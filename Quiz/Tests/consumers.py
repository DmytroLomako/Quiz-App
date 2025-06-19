from channels.generic.websocket import AsyncWebsocketConsumer
import json, random, string
from .models import *
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from urllib.parse import parse_qs
from django.contrib.auth.models import User
from django.forms.models import model_to_dict
from transliterate import translit, get_available_language_codes
import random
from Results.models import *

def generate_code(length):
    list_symbols = string.ascii_letters + string.digits
    code = ''
    for i in range(length):
        code += random.choice(list_symbols)
    if GlobalResult.objects.filter(result_url=code).exists() or ResultNotAuth.objects.filter(result_url=code).exists():
        return generate_code(length)
    return code

class QuizConsumers(AsyncWebsocketConsumer):
    async def connect(self):
        print('connect')
        self.quiz_code = self.scope['url_route']['kwargs']['quiz_code']
        self.quiz_group_name = f'quiz_{self.quiz_code}'
        self.user = self.scope['user']
        admin = await self.get_test_admin()
        await self.channel_layer.group_add(
            self.quiz_group_name,
            self.channel_name
        )
        await self.accept()
        params = parse_qs(self.scope['query_string'].decode())
        id = None
        username = None
        start_test = await self.get_test_admin(True)
        if not self.user.is_authenticated or self.user != admin:
            if self.user.is_authenticated: 
                id = self.user.id
                username = self.user.username
            else:
                username = params.get('name', '')
            print(username)
            print(2)
            print(params)
            socket_exist = params.get('socket_exist', False)
            if not socket_exist:
                try:
                    if start_test:
                        if self.user.is_authenticated:
                            await sync_to_async(start_test.users.add)(self.user)
                        else:
                            if start_test.users_not_auth != None:
                                start_test.users_not_auth += f'{username[0]}%,'
                            else:
                                start_test.users_not_auth = f'{username[0]}%,'
                        await sync_to_async(start_test.save)()
                except Exception as error:
                    print("connect error", error)
                await self.channel_layer.group_send(
                    self.quiz_group_name,
                    {
                        'type': 'send_data',
                        'data_type': 'user_connect',
                        'username': username,
                        'id': id
                    }
                )
        if start_test.current_question != -1:
            print("USER CONNECT")
            if self.user == admin:
                id = admin.id
            if id:
                self.user_group_name = f'user_{id}'
            else:
                print(username)
                self.user_group_name = f'not_auth_user_{translit(username[0], 'ru', 'en')}'
            await self.channel_layer.group_add(
                self.user_group_name,
                self.channel_name
            )
            count_question = await sync_to_async(start_test.count_question)()
            await self.channel_layer.group_send(
                self.user_group_name,
                {
                    'type': 'send_data',
                    'data_type': 'get_question',
                    'question_number': start_test.current_question,
                    'test_id': start_test.id,
                    'last_question': start_test.current_question == count_question - 1
                }
            )
            
    @database_sync_to_async
    def get_test_admin(self, get_test = False):
        start_test = StartTest.objects.filter(code=self.quiz_code).first()
        if get_test:
            return start_test
        return start_test.admin
        
    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.quiz_code,
            self.channel_name
        )
        
    @database_sync_to_async
    def get_users(self, start_test):
        return list(start_test.users.all())
    
    @database_sync_to_async
    def get_questions(self, test):
        return list(Question.objects.filter(test=test))
        
    async def receive(self, text_data=None):
        async def stop_question():
            start_test = await self.get_test_admin(True)
            start_test.question_finished = True
            await sync_to_async(start_test.save)()
            test = await sync_to_async(getattr)(start_test, 'test')
            question = await sync_to_async(Question.objects.filter(test=test, question_number=start_test.current_question).first)()
            if question:
                await self.channel_layer.group_send(
                    self.quiz_group_name,
                    {
                        'type': 'send_data',
                        'data_type': 'check_correct',
                        'question_type': question.answer_type,
                        'answer': question.answers,
                        'correct_answer': question.correct_answer 
                    }
                )
        text_data = json.loads(text_data)
        if text_data['type'] == 'user_disconnect':
            try:
                print("DISCONECT")
                start_test = await self.get_test_admin(True)
                if self.user.is_authenticated:
                    await sync_to_async(start_test.users.remove)(self.user)
                else:
                    usernames = start_test.users_not_auth.split('%,')
                    for name in usernames[:-1]:
                        if name == text_data['username']:
                            usernames.remove(name)
                    start_test.users_not_auth = '%,'.join(usernames)
                await sync_to_async(start_test.save)()
                await self.channel_layer.group_send(
                    self.quiz_group_name,
                    {
                        'type': 'send_data',
                        'data_type': 'user_disconnect',
                        'username': text_data['username'],
                        'receiver': 'admin'
                    }
                )
            except Exception as error:
                print(f'disconnect error :{error}')
        elif text_data['type'] == 'admin_user_disconnect':
            user_id = text_data['user_id']
            username = text_data['username']
            start_test = await self.get_test_admin(True)
            if user_id != 'null' and user_id is not None:
                user = await sync_to_async(User.objects.get)(id=int(user_id))
                await sync_to_async(start_test.users.remove)(user)
            else:
                usernames = start_test.users_not_auth.split('%,')
                for name in usernames[:-1]:
                    if name == username:
                        usernames.remove(name)
                start_test.users_not_auth = '%,'.join(usernames)
            await sync_to_async(start_test.save)()
            await self.channel_layer.group_send(
                self.quiz_group_name,
                {
                    'type': 'send_data',
                    'data_type': 'user_disconnect',
                    'username': username,
                    'receiver': 'user'
                }
            )
        elif text_data['type'] == 'start_test' or text_data['type'] == 'next_question':
            start_test = await self.get_test_admin(True)
            start_test.current_question += 1
            start_test.question_finished = False
            await sync_to_async(start_test.save)()
            count_question = await sync_to_async(start_test.count_question)()
            await self.channel_layer.group_send(
                self.quiz_group_name,
                {
                    'type': 'send_data',
                    'data_type': 'get_question',
                    'question_number': start_test.current_question,
                    'test_id': start_test.id,
                    'last_question': count_question -1 <= start_test.current_question
                }
            )
        elif text_data['type'] == 'send_answer':
            id = None
            result = None
            question = await sync_to_async(Question.objects.filter(id=text_data['question_id']).first)()
            start_test = await self.get_test_admin(True)
            if self.user.is_authenticated:
                id = self.user.id
                result = await sync_to_async(Result.objects.filter(user=self.user, start_test=start_test, question=question).first)()
                if not result:
                    result = await sync_to_async(Result.objects.create)(
                        user = self.user,
                        result = text_data['answer'],
                        question = question,
                        start_test = start_test
                    )
            else:
                result = await sync_to_async(Result.objects.filter(user_not_auth=text_data['username'], start_test=start_test, question=question).first)()
                if not result:
                    result = await sync_to_async(Result.objects.create)(
                        user_not_auth = text_data['username'],
                        result = text_data['answer'],
                        question = question,
                        start_test = start_test
                    )
            if result != None:
                await sync_to_async(result.save)()
                results = await sync_to_async(Result.objects.filter(start_test=start_test, question=question).count)()
                count_users = await sync_to_async(start_test.users.count)()
                if start_test.users_not_auth:
                    count_users += len(start_test.users_not_auth.split('%,')) - 1
                if count_users == results:
                    await stop_question()
                await self.channel_layer.group_send(
                    self.quiz_group_name,
                    {
                        'type': 'send_data',
                        'data_type': 'admin_user_answer',
                        'user_id': id,
                        'username': text_data['username'],
                        'not_answer_count': count_users - results
                    }
                )
        elif text_data['type'] == 'stop_question':
            await stop_question()
        elif text_data['type'] == 'stop_test':
            start_test = await self.get_test_admin(True)
            results = await sync_to_async(Result.objects.filter)(start_test = start_test)
            test = await sync_to_async(getattr)(start_test, 'test')
            questions = await self.get_questions(test)
            admin_result = await sync_to_async(AdminResult.objects.create)(
                admin = self.user,
                test = test
            )
            await sync_to_async(admin_result.save)()
            users = await self.get_users(start_test)
            list_results_auth = []
            list_results_not_auth = []
            for user in users:
                user_results = await sync_to_async(Result.objects.filter)(start_test = start_test, user=user)
                code = await sync_to_async(generate_code)(50)
                text_user_result = ''
                for question in questions:
                    user_question_result = await sync_to_async(user_results.filter(question=question).first)()
                    if user_question_result:
                        text_user_result += f'{user_question_result.result}|||'
                    else:
                        text_user_result += 'None|||'
                user_result = await sync_to_async(GlobalResult.objects.create)(
                    user = user,
                    test = test,
                    result = text_user_result,
                    result_url = code,
                    admin_result = admin_result
                )
                await sync_to_async(user_result.save)()
                list_results_auth.append(model_to_dict(user_result))
            if start_test.users_not_auth:
                for user in start_test.users_not_auth.split('%,'):
                    if user:
                        user_results = await sync_to_async(Result.objects.filter)(start_test = start_test, user_not_auth=user)
                        code = await sync_to_async(generate_code)(50)
                        text_user_result = ''
                        for question in questions:
                            user_question_result = await sync_to_async(user_results.filter(question=question).first)()
                            if user_question_result:
                                text_user_result += f'{user_question_result.result}|||'
                            else:
                                text_user_result += 'None|||'
                        user_result = await sync_to_async(ResultNotAuth.objects.create)(
                            username = user,
                            test = test,
                            result = text_user_result,
                            result_url = code,
                            admin_result = admin_result
                        )
                        await sync_to_async(user_result.save)()
                        list_results_not_auth.append(model_to_dict(user_result))
            await sync_to_async(start_test.delete)()
            await self.channel_layer.group_send(
                self.quiz_group_name,
                {
                    'type': 'send_data',
                    'data_type': 'stop_test',
                    'id_admin': admin_result.id,
                    'list_results_not_auth': list_results_not_auth,
                    'list_results_auth': list_results_auth
                }
            )
            
    async def send_data(self, event):
        event['type'] = event['data_type']
        await self.send(text_data=json.dumps(event))