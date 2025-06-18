from django import template
import ast, json


register = template.Library()

@register.simple_tag
def str_to_list(string):
    if string == None:
        return False
    return ast.literal_eval(string)

@register.simple_tag
def has_answer_image(question, answer):
    answers = ast.literal_eval(question.answers)
    answer_id = answers.index(answer)
    for image in question.answerimage_set.all():
        if image.answer_id == str(answer_id):
            return image
    return False

@register.simple_tag
def check_answer_correct(answers, answer, correct_answers):
    index = answers.index(answer)
    correct_answers = ast.literal_eval(correct_answers)
    if correct_answers[index] == 'true':
        return 'true'
    
@register.simple_tag
def get_answers_from_list_dict(list_dict):
    answers = []
    for dict in list_dict:
        answers.append(dict['answer'])
    return answers

@register.simple_tag
def get_type_and_answers_from_list_dict(list_dict):
    answers = []
    for dict in list_dict:
        answers.append([dict['answer'], dict['type']])
    return answers

@register.filter
def zip_lists(a, b):
    return zip(a, b)