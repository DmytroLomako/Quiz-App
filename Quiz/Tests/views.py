from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import *
from CreateTest.models import AnswerImage
from django.forms.models import model_to_dict
import random, json

# Create your views here.
def render_start_test(request, code):
    test = StartTest.objects.filter(code=code).first()
    if test:
        if request.user.is_authenticated:
            if request.user == test.admin:
                list_not_auth_users = []
                if test.users_not_auth:
                    list_not_auth_users = test.users_not_auth.split('%,')[:-1]
                list_users = list(test.users.all())
                current_question = test.current_question
                question = Question.objects.filter(test=test.test, question_number=current_question).first()
                results = Result.objects.filter(start_test=test, question=question)
                for index, user in enumerate(list_users):
                    list_users[index] = [False, user]
                    for result in results:
                        if result.user == user:
                            list_users[index] = [True, user]
                for index, user in enumerate(list_not_auth_users):
                    list_not_auth_users[index] = [False, user]
                    for result in results:
                        if result.user_not_auth == user:
                            list_not_auth_users[index] = [True, user]
                count_question = test.count_question()
                count_users = str(len(list_users) + len(list_not_auth_users))
                if count_users == '1':
                    count_users = count_users + ' учасник'
                elif count_users[-1] in '234' and (len(count_users) == 1 or count_users[-2] != '1'):
                    count_users = count_users + ' учасники'
                else:
                    count_users = count_users + ' учасників'
                return render(request, 'Tests/start_test_admin.html', context={
                    'test': test, 
                    'not_auth_users': list_not_auth_users, 
                    'auth_users': list_users,
                    'last_question': count_question -1 <= test.current_question,
                    'count_users': count_users
                })
        return render(request, 'Tests/start_test.html', context={'test': test, 'user': request.user})
    else:
        return redirect('/')
    
def render_user_disconnect(request):
    return render(request, 'Tests/user_disconnect.html')

def get_question(request):
    if request.method == 'POST':
        test_id = request.POST.get('test_id')
        question_number = request.POST.get('question_number')
        start_test = StartTest.objects.filter(id=int(test_id)).first()
        if start_test:
            test = start_test.test
            question = Question.objects.filter(test = test, question_number = int(question_number)).first()
            if question:
                question_data = model_to_dict(question)
                if question.image:    
                    question_data['image'] = question.image.url
                else:
                    question_data['image'] = None
                result = None
                if request.user.is_authenticated:
                    result = Result.objects.filter(start_test=start_test, question=question, user=request.user).first()
                else:
                    result = Result.objects.filter(start_test=start_test, question=question, user_not_auth=request.POST.get('username')).first()
                if result != None:
                    result = model_to_dict(result)
                if question_data['answer_type'] == 'match':
                    hints = json.loads(question_data['correct_answer'].replace("'", '"'))
                    question_data['correct_hints'] = str(hints)
                    random.shuffle(hints)
                    question_data['correct_answer'] = str(hints)
                answer_images_dict = {}
                answer_images = AnswerImage.objects.filter(question=question)
                for image in answer_images:
                    answer_images_dict[image.answer_id] = image.image.url
                return JsonResponse({
                    'question': question_data, 
                    "user_result": result, 
                    'question_finished': start_test.question_finished,
                    'answer_images': answer_images_dict
                })
        return JsonResponse({'question': None})
    
def render_join(request):
    if request.method == 'POST':
        code = request.POST.get('code')
        test = StartTest.objects.filter(code=code).first()
        if test:
            return redirect(f'/tests/start_test/{code}')
        else:
            return render(request, 'Tests/join.html', context={'error': 'This code does not exist'})
    return render(request, 'Tests/join.html')