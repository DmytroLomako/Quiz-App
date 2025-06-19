from django.urls import path
from .views import *

urlpatterns = [
    path('view_result/<int:result_id>', render_amdin_result, name='amin_result'),
    path('view_user_result/<str:result_url>', render_user_result, name='user_result')
]
