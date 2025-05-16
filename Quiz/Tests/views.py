from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import *

# Create your views here.
def render_start_test(request, code):
    test = StartTest.objects.filter(code=code).first()
    if test:
        if request.user.is_authenticated:
            if request.user == test.admin:
                list_users = test.users_not_auth.split(', ')[:-1]
                for user in test.users.all():
                    list_users.append(user.username)
                return render(request, 'Tests/start_test_admin.html', context={'test': test, 'users': list_users})
        return render(request, 'Tests/start_test.html', context={'test': test, 'user': request.user})
    else:
        return redirect('/')
    
def render_user_disconnect(request):
    return render(request, 'Tests/user_disconnect.html')

def get_question(request):
    if request.method == 'POST':
        test_id = request.POST.get('test_id')
        question_number = request.POST.get('question_number')
        print(test_id, question_number)
        return JsonResponse({'hi': 'hi'})