from django.urls import path
from .views import *

urlpatterns = [
    path('start_test/<str:code>', render_start_test),
    path('delete_from_test', render_user_disconnect),
    path('get_question', get_question)
]
