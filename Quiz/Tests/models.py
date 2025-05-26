from django.db import models
from django.contrib.auth.models import User
from CreateTest.models import Test, Question

# Create your models here.
class Result(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    user_not_auth = models.TextField(default=None, null=True)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    start_test = models.ForeignKey('StartTest', on_delete=models.CASCADE, default=None)
    result = models.TextField()

    def __str__(self):
        if self.user:
            return f'{self.user.username} - {self.start_test.test.name} - {self.result}'
        return f'{self.user_not_auth} - {self.start_test.test.name} - {self.result}'
    
class GlobalResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    results = models.TextField()

    def __str__(self):
        return f'{self.user.username} - {self.results}'
    
class AdminResult(models.Model):
    admin = models.ForeignKey(User, on_delete=models.CASCADE)
    results = models.TextField()
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    
class StartTest(models.Model):
    admin = models.ForeignKey(User, on_delete=models.CASCADE)
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    code = models.CharField(max_length=4)
    users = models.ManyToManyField(User, related_name='users')
    users_not_auth = models.TextField()
    current_question = models.IntegerField(default=-1)