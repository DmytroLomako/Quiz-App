from django.urls import path
from .views import *

urlpatterns = [
    path('start_test/<str:code>', render_start_test)
]
