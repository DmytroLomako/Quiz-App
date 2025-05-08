from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.contrib.auth import logout

# Create your views here.
def render_home(request):
    if request.user.is_authenticated:
        return render(request, 'Menu/home.html', context={'user': request.user})
    else:
        return render(request, 'Menu/home_not_auth.html', context={'user': request.user})

def render_reg(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        print(username, password)
        if len(password) < 8:
            return render(request, 'Menu/reg.html', context={'error': 'Password must be at least 8 characters long'})
        try:
            user = User.objects.create_user(username=username, password=password)
            user.save()
        except:
            return render(request, 'Menu/reg.html', context={'error': 'This username is already taken'})
        return redirect('/auth/')
    return render(request, 'Menu/reg.html', context={'error': None})

def render_auth(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('/')      
    return render(request, 'Menu/auth.html')

def render_logout(request):
    logout(request)
    return redirect('/')