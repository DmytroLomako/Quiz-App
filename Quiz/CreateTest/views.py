from django.shortcuts import render, redirect
from .models import *
import random
from Tests.models import StartTest
from django.contrib.auth.decorators import login_required

# Create your views here.

@login_required(login_url='/auth/')
def render_choose_test(request):
    if request.method == 'POST':
        if request.POST.get('multiple'):
            link = 'create_quiz/multiple_choice'
        elif request.POST.get('blank'):
            link = 'create_quiz/fill_in_the_blank'
        elif request.POST.get('match'):
            link = 'create_quiz/match'
        else:
            return render(request, 'CreateTest/choose_test.html', context={'error': 'Оберіть тип тесту'})
        test = Test.objects.create(user = request.user, name = '', logo = None, finished = False)
        test.save()
        return redirect(f'/{link}/{test.id}')
    return render(request, 'CreateTest/choose_test.html', context={'error': None})
    
@login_required(login_url='/auth/')
def render_select_question(request, test_id):
    return render(request, 'CreateTest/select_question_type.html', context={'test_id': test_id})
    
@login_required(login_url='/auth/')
def render_multiple_choice(request, test_id):
    return render(request, 'CreateTest/multiple_choice.html', context={'test_id': test_id, 'range': range(5, 16)})

@login_required(login_url='/auth/')
def render_fill_blank(request, test_id):
    return render(request, 'CreateTest/fill_blank.html', context={'test_id': test_id, 'range': range(5, 16)})

@login_required(login_url='/auth/')
def render_match(request, test_id):
    return render(request, 'CreateTest/match.html', context={'test_id': test_id, 'range': range(5, 16)})
    
@login_required(login_url='/auth/')
def render_library(request):
    tests = Test.objects.filter(user=request.user)
    if request.method == 'POST':
        test_id = request.POST.get('id')
        test = Test.objects.get(id=test_id)
        while True:
            code = ''
            for i in range(4):
                code += str(random.randint(0, 9))
            all_tests = StartTest.objects.filter(code=code).first()
            if all_tests is None:
                break
        start_test = StartTest.objects.create(admin=request.user, test=test, code=code)
        start_test.save()
        return redirect(f'/tests/start_test/{code}')
    return render(request, 'CreateTest/library.html', context={'tests': tests})