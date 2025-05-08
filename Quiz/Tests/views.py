from django.shortcuts import render, redirect
from .models import *

# Create your views here.
def render_start_test(request, code):
    test = StartTest.objects.filter(code=code).first()
    if test:
        if request.user.is_authenticated:
            if request.user == test.admin:
                return render(request, 'Tests/start_test_admin.html', context={'test': test})
        return render(request, 'Tests/start_test.html', context={'test': test, 'user': request.user})
    else:
        return redirect('/')