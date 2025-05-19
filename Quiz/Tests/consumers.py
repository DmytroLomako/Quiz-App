from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import StartTest
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from urllib.parse import parse_qs
from .models import *
from django.contrib.auth.models import User



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
        if not self.user.is_authenticated or self.user != admin:
            id = None
            if self.user.is_authenticated: 
                id = self.user.id
                username = self.user.username
            else:
                username = params.get('name', '')
            socket_exist = params.get('socket_exist', False)
            if not socket_exist:
                try:
                    start_test = await self.get_test_admin(True)
                    print(self.quiz_code, start_test)
                    if start_test:
                        if self.user.is_authenticated:
                            print('user_add')
                            await sync_to_async(start_test.users.add)(self.user)
                        else:
                            print('user_not_auth_add')
                            start_test.users_not_auth += f'{username[0]}, '
                        print("add")
                        await sync_to_async(start_test.save)()
                        print('True')
                except Exception as error:
                    print(error)
                await self.channel_layer.group_send(
                    self.quiz_group_name,
                    {
                        'type': 'user_connect',
                        'username': username,
                        'id': id
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
        
    async def user_connect(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_connect',
            'username': event['username'],
            'id': event['id']
        }))
        
    async def receive(self, text_data=None):
        text_data = json.loads(text_data)
        print(text_data)
        if text_data['type'] == 'user_disconnect':
            try:
                start_test = await self.get_test_admin(True)
                if self.user.is_authenticated:
                    await sync_to_async(start_test.users.remove)(self.user)
                else:
                    usernames = start_test.users_not_auth.split(', ')
                    for name in usernames[:-1]:
                        if name == text_data['username']:
                            usernames.remove(name)
                    start_test.users_not_auth = ', '.join(usernames)
                await sync_to_async(start_test.save)()
                await self.channel_layer.group_send(
                    self.quiz_group_name,
                    {
                        'type': 'user_disconnect',
                        'username': text_data['username'],
                        'receiver': 'admin'
                    }
                )
            except:
                print('disconnect error')
        elif text_data['type'] == 'admin_user_disconnect':
            user_id = text_data['user_id']
            username = text_data['username']
            start_test = await self.get_test_admin(True)
            if user_id != 'null' and user_id is not None:
                user = await sync_to_async(User.objects.get)(id=int(user_id))
                await sync_to_async(start_test.users.remove)(user)
            else:
                usernames = start_test.users_not_auth.split(', ')
                for name in usernames[:-1]:
                    if name == username:
                        usernames.remove(name)
                start_test.users_not_auth = ', '.join(usernames)
            await sync_to_async(start_test.save)()
            await self.channel_layer.group_send(
                self.quiz_group_name,
                {
                    'type': 'user_disconnect',
                    'username': username,
                    'receiver': 'user'
                }
            )
        elif text_data['type'] == 'start_test':
            start_test = await self.get_test_admin(True)
            start_test.current_question = 0
            await sync_to_async(start_test.save)()
            await self.channel_layer.group_send(
                self.quiz_group_name,
                {
                    'type': 'start_test',
                    'question_number': start_test.current_question,
                    'test_id': start_test.id
                }
            )
                
    async def user_disconnect(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_disconnect',
            'username': event['username'],
            'receiver': event['receiver']
        }))
        
    async def start_test(self, event):
        await self.send(text_data=json.dumps({
            'type': 'start_test',
            'question_number': event['question_number'],
            'test_id': event['test_id']
        }))