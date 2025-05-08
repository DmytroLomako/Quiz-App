from django.urls import path
from .consumers import QuizConsumers


websocket_urlpatterns = [
    path('ws/quiz/<str:quiz_code>/', QuizConsumers.as_asgi()),
]