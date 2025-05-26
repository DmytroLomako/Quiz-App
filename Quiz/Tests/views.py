from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import *
from django.forms.models import model_to_dict

# Create your views here.
def render_start_test(request, code):
    test = StartTest.objects.filter(code=code).first()
    if test:
        if request.user.is_authenticated:
            if request.user == test.admin:
                list_not_auth_users = test.users_not_auth.split(', ')[:-1]
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
                print(list_not_auth_users, list_users)
                return render(request, 'Tests/start_test_admin.html', context={'test': test, 'not_auth_users': list_not_auth_users, 'auth_users': list_users})
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
                question_data['image'] = question_data['image'].url
                print(question_data)
                result = None
                if request.user.is_authenticated:
                    result = Result.objects.filter(start_test=start_test, question=question, user=request.user).first()
                else:
                    result = Result.objects.filter(start_test=start_test, question=question, user_not_auth=request.POST.get('username')).first()
                if result != None:
                    result = model_to_dict(result)
                return JsonResponse({'question': question_data, "user_result": result})
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