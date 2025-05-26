from django.urls import path
from .views import *

urlpatterns = [
    path('', render_choose_test),
    path('select_question/<int:test_id>/', render_select_question, name='select_question'),
    path('multiple_choice/<int:test_id>/', render_multiple_choice, name = 'multiple_choice'),
    path('fill_in_the_blank/<int:test_id>/', render_fill_blank, name = 'fill_blank'),
    path('match/<int:test_id>/', render_match, name = 'match'),
    path('library/', render_library, name='library'),
    path('test_info/<int:test_id>/', render_test_info, name='test_info'),
    path('edit/<int:test_id>/question/<int:question_id>/<str:question_type>', render_edit_test, name='edit_test')
]
