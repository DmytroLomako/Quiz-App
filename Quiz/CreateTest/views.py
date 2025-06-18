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
        test = Test.objects.create(user = request.user, name = 'Тест без назви', logo = None, finished = False)
        test.save()
        return redirect(f'/{link}/{test.id}')
    return render(request, 'CreateTest/choose_test.html', context={'error': None})
    
@login_required(login_url='/auth/')
def render_select_question(request, test_id):
    return render(request, 'CreateTest/select_question_type.html', context={'test_id': test_id})
    
@login_required(login_url='/auth/')
def render_multiple_choice(request, test_id):
    if request.method == 'POST':
        test = Test.objects.get(id=test_id)
        time = request.POST.get('time')
        time = int(time.split('_')[0])
        question_number = test.count_question()
        question_text = request.POST.get('question')
        list_answers = request.POST.getlist('answer')
        list_correct_answers = request.POST.getlist('is_correct')
        question = Question.objects.create(
            question_number = question_number,
            question = question_text,
            image = request.FILES.get('question_image') if 'question_image' in request.FILES else None,
            answers = list_answers,
            answer_type = 'multiple_choice',
            correct_answer = list_correct_answers,
            test = Test.objects.get(id=test_id)
        )
        question.save()
        
        for i, answer in enumerate(list_answers):
            image_key = f'answer-image_{i}'
            if image_key in request.FILES:
                answer_image = AnswerImage(
                    image = request.FILES[image_key],
                    question = question,
                    answer_id = str(i)
                )
                answer_image.save()
                
        return redirect(f'/create_quiz/test_info/{test_id}')
    return render(request, 'CreateTest/multiple_choice.html', context={'test_id': test_id, 'range': range(10, 121, 10)})

@login_required(login_url='/auth/')
def render_fill_blank(request, test_id):
    if request.method == 'POST':
        test = Test.objects.get(id=test_id)
        time = request.POST.get('time')
        time = int(time.split('_')[0])
        question_number = test.count_question()
        question_text = request.POST.get('question')
        answer = request.POST.get('correct_answer')
        alternate_answers = request.POST.getlist('alternate_answers')
        alternate_types = request.POST.getlist('alternate_types')
        
        alternate_data = []
        for i in range(len(alternate_answers)):
            alternate_data.append({
                'answer': alternate_answers[i],
                'type': alternate_types[i]
            })
        
        question = Question.objects.create(
            question_number=question_number,
            question=question_text,
            image=request.FILES.get('question_image') if 'question_image' in request.FILES else None,
            answers=alternate_data,
            answer_type='fill_blank',
            correct_answer=answer,
            test=test
        )
        question.save()
                        
        return redirect(f'/create_quiz/test_info/{test_id}')
    return render(request, 'CreateTest/fill_blank.html', context={'test_id': test_id, 'range': range(10, 121, 10)})

@login_required(login_url='/auth/')
def render_match(request, test_id):
    if request.method == 'POST':
        test = Test.objects.get(id=test_id)
        time = request.POST.get('time')
        time = int(time.split('_')[0])
        question_number = test.count_question()
        question_text = request.POST.get('question')
        hints = request.POST.getlist('hint')
        answers = request.POST.getlist('answer')
        
        question = Question.objects.create(
            question_number = question_number,
            question = question_text,
            image = request.FILES.get('question_image') if 'question_image' in request.FILES else None,
            answers = answers,
            answer_type = 'match',
            correct_answer = hints,
            test = test
        )
        question.save()
        
        for i, hint in enumerate(hints):
            hint_image_key = f'hint-image_{i}'
            if hint_image_key in request.FILES:
                hint_image = AnswerImage(
                    image = request.FILES[hint_image_key],
                    question = question,
                    answer_id = f'hint_{i}'
                )
                hint_image.save()
        
        for i, answer in enumerate(answers):
            answer_image_key = f'answer-image_{i}'
            if answer_image_key in request.FILES:
                answer_image = AnswerImage(
                    image = request.FILES[answer_image_key],
                    question = question,
                    answer_id = f'answer_{i}'
                )
                answer_image.save()
                
        return redirect(f'/create_quiz/test_info/{test_id}')
    return render(request, 'CreateTest/match.html', context={'test_id': test_id, 'range': range(10, 121, 10)})
    
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

@login_required(login_url='/auth/')
def render_test_info(request, test_id):
    test = Test.objects.get(id=test_id)
    if test.user == request.user:
        return render(request, 'CreateTest/test_info.html', context={'test': test, 'range': range(10, 121, 10)})
    else:
        return redirect('/')
    
@login_required(login_url='/auth/')
def render_edit_test(request, test_id, question_id, question_type):
    test = Test.objects.get(id=test_id)
    if test.user == request.user:
        question = Question.objects.get(id=question_id)
        if question:
            if request.method == 'POST':
                answer_type = request.POST.get('answer_type')
                question.answer_type = answer_type  
                question.question = request.POST.get('question')
                if 'question_image' in request.FILES:
                    question.image = request.FILES.get('question_image')
                if answer_type == 'multiple_choice':
                    question.answers = request.POST.getlist('answer')
                    question.correct_answer = request.POST.getlist('is_correct')
                    for i, answer in enumerate(question.answers):
                        image_key = f'answer-image_{i}'
                        if image_key in request.FILES:
                            answer_image = AnswerImage.objects.filter(question=question, answer_id=str(i)).first()
                            if answer_image:
                                answer_image.image = request.FILES[image_key] 
                            else:
                                answer_image = AnswerImage(
                                    image=request.FILES[image_key],
                                    question=question,
                                    answer_id=str(i)
                                )
                            answer_image.save()
                        else:
                            answer_image = AnswerImage.objects.filter(question=question, answer_id=str(i)).first()
                            if answer_image:
                                answer_image.delete()
                elif answer_type == 'fill_blank':
                    alternate_answers = request.POST.getlist('alternate_answers')
                    alternate_types = request.POST.getlist('alternate_types')
                    if len(alternate_answers) == 1 and not alternate_answers[0]:
                        alternate_data = None
                    else:
                        alternate_data = []
                        for i in range(len(alternate_answers)):
                            alternate_data.append({
                                'answer': alternate_answers[i],
                                'type': alternate_types[i]
                            })
                    question.answers = alternate_data
                    question.correct_answer = request.POST.get('correct_answer')
                elif answer_type == 'match':
                    question.answers = request.POST.getlist('answer')
                    question.correct_answer = request.POST.getlist('hint')
                    for i, answer in enumerate(question.answers):
                        image_key = f'answer-image_{i}'
                        if image_key in request.FILES:
                            answer_image = AnswerImage.objects.filter(question=question, answer_id=f'answer_{i}').first()
                            if answer_image:
                                answer_image.image = request.FILES[image_key]
                            else:
                                answer_image = AnswerImage(
                                    image=request.FILES[image_key],
                                    question=question,
                                    answer_id=f'answer_{i}'
                                )
                            answer_image.save()
                        hint_image_key = f'hint-image_{i}'
                        if hint_image_key in request.FILES:
                            hint_image = AnswerImage.objects.filter(question=question, answer_id=f'hint_{i}').first()
                            if hint_image:
                                hint_image.image = request.FILES[hint_image_key]
                            else:
                                hint_image = AnswerImage(
                                    image=request.FILES[hint_image_key],
                                    question=question,
                                    answer_id=f'hint_{i}'
                                )
                            hint_image.save()
                question.save()
                return redirect('test_info', test_id)
            if question_type == 'multiple_choice':
                return render(request, 'CreateTest/multiple_choice.html', context={'test': test, 'question': question, 'range': range(10, 121, 10)})
            elif question_type == 'fill_blank':
                return render(request, 'CreateTest/fill_blank.html', context={'test': test, 'question': question, 'range': range(10, 121, 10)})
            elif question_type == 'match':
                return render(request, 'CreateTest/match.html', context={'test': test, 'question': question, 'range': range(10, 121, 10)})
    return redirect('/')

@login_required(login_url='/auth/')
def delete_question(request, test_id, question_id):
    test = Test.objects.get(id=test_id)
    if test.user == request.user:
        question = Question.objects.get(id=question_id)
        if question:
            question.delete()
        for i, question in enumerate(Question.objects.filter(test=test)):
            question.question_number = i
            question.save()
        return redirect('test_info', test_id)
    
@login_required(login_url='/auth/')
def save_test(request, test_id):
    if request.method == 'POST':
        test = Test.objects.get(id=test_id)
        if test.user == request.user:
            test.name = request.POST.get('name')
            if 'cover-image' in request.FILES:
                test.logo = request.FILES.get('cover-image')
            else:
                test.logo = None
            test.finished = True
            test.save()
            return redirect('library')
    return redirect('/')

@login_required(login_url='/auth/')
def delete_test(request, test_id):
    test = Test.objects.get(id=test_id)
    if test.user == request.user:
        test.delete()
        return redirect('library')
    return redirect('/')