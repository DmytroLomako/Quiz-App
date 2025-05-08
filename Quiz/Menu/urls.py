from django.urls import path
from .views import *

urlpatterns = [
    path('', render_home),
    path('reg/', render_reg),
    path('auth/', render_auth),
    path('logout/', render_logout)
]
