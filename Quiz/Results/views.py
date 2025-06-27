from django.shortcuts import render, redirect
from .models import *
from django.http import Http404
from CreateTest.models import *
import ast

def checkCorrect(question, result_user):
    correct = False
    if question.answer_type == 'multiple_choice':
        list_answer = ast.literal_eval(question.answers)
        list_correct_answer = ast.literal_eval(question.correct_answer)
        if len(question.correct_answer.split('true')) > 2:
            user_answer = ast.literal_eval(result_user)
            for answer_index, answer in enumerate(user_answer):
                user_answer[answer_index] = str(answer).lower()
            if user_answer == list_correct_answer:
                correct = True
        else:
            user_answer = list_answer.index(result_user)
            if list_correct_answer[user_answer] == 'true':
                correct = True
        # print(correct, result_user, question.correct_answer, question.answers)
    elif question.answer_type == 'match':
        list_correct_answer = ast.literal_eval(question.correct_answer)
        user_answer = ast.literal_eval(result_user)
        if user_answer == list_correct_answer:
            correct = True
        # print(correct, result_user, question.correct_answer, question.answers)
    elif question.answer_type == 'fill_blank':
        if result_user == question.correct_answer:
            correct = True
        elif question.answers:
            list_answers = ast.literal_eval(question.answers)
            for answer in list_answers:
                if answer['type'] == 'exactly':
                    if answer['answer'] == result_user:
                        correct = True
                        break
                elif answer['type'] == 'contains':
                    if answer['answer'] in result_user:
                        correct = True
                        break
    return correct

def getAdminResult(admin_result):
    global_result = list(GlobalResult.objects.filter(admin_result=admin_result))
    result_not_auth = list(ResultNotAuth.objects.filter(admin_result=admin_result))
    count_user = len(global_result) + len(result_not_auth)
    list_percent = []
    list_users_result = []
    for user in global_result:
        list_users_result.append([user.user.username, []])
    for user in result_not_auth:
        list_users_result.append([user.username, []])
    for index, question in enumerate(Question.objects.filter(test = admin_result.test)):
        count_correct = 0
        for index_user, result in enumerate(global_result + result_not_auth):
            result_user = result.result.split('|||')[index]
            correct = False
            if result_user != 'None':
                correct = checkCorrect(question, result_user)
            if correct:
                count_correct += 1
            if str(result_user) != 'None':
                list_users_result[index_user][1].append(correct)
            else:
                list_users_result[index_user][1].append('None')
        list_percent.append([round(count_correct / count_user * 100), index + 1])
    count_question = admin_result.test.count_question()
    for index, res in enumerate(list_users_result):
        list_users_result[index].append(res[1].count(True))
        list_users_result[index].append(round(res[1].count(True) / count_question * 100))

    list_users_result = sorted(list_users_result, key=lambda x: x[2], reverse=True)
    return global_result, result_not_auth, count_question, list_percent, list_users_result

# Create your views here.
def render_amdin_result(request, result_id):
    admin_result = AdminResult.objects.get(id=result_id)
    if admin_result:
        if admin_result.admin == request.user:
            global_result, result_not_auth, count_question, list_percent, list_users_result = getAdminResult(admin_result)
            return render(request, 'Results/admin_result.html', context={
                'global_result': global_result, 
                'result_not_auth': result_not_auth, 
                'admin_result': admin_result,
                'list_users': global_result + result_not_auth,
                'count_question': count_question, 
                'list_percent': list_percent,
                'list_users_result': list_users_result
            })
    return Http404('Такого тесту не існує')

def render_user_result(request, result_url):
    username = ""
    result = GlobalResult.objects.filter(result_url=result_url).first()
    if not result:
        result = ResultNotAuth.objects.filter(result_url=result_url).first()
        if result:
            username = result.username
    else:
        username = result.user.username
    if result:
        list_questions = []
        questions = list(Question.objects.filter(test=result.test))
        count_correct = 0
        count_incorrect = 0
        count_none = 0
        for index, question in enumerate(questions):
            user_answer = result.result.split('|||')[index]
            status = False
            if user_answer != "None":
                status = checkCorrect(question, user_answer)
                if status:
                    count_correct += 1
                else:
                    count_incorrect += 1
            else:
                status = 'None'
                count_none += 1
            list_questions.append({'question': question, 'answer': user_answer, 'status': status})
        percent = round(count_correct/len(questions) * 100)

        admin_result = result.admin_result
        list_users_result = getAdminResult(admin_result)[-1]
        
        place = 0
        for user in list_users_result:
            place += 1
            if user[0] == username:
                break
        place = f'{place} / {len(list_users_result)}'
        
        return render(request, 'Results/user_result.html', context={
            'list_questions': list_questions, 
            'username': username, 
            'percent': percent,
            'count_correct': count_correct,
            'count_incorrect': count_incorrect,
            'count_none': count_none,
            'place': place
        })
    else:
        return Http404('Такого результату не існує')
    
def render_reports(request):
    admin_results = AdminResult.objects.filter(admin = request.user)
    if admin_results:
        return render(request, 'Results/reports.html', context={'results': admin_results})
    else:
        return redirect('/')