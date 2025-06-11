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
    
class ResultNotAuth(models.Model):
    username = models.TextField()
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    result = models.TextField()
    
    def __str__(self):
        return f'{self.username}'
    
class GlobalResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    test = models.ForeignKey(Test, on_delete=models.CASCADE, null=True)
    results = models.TextField()

    def __str__(self):
        return f'{self.user.username}'
    
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
    users_not_auth = models.TextField(blank=True, null=True)
    current_question = models.IntegerField(default=-1)
    question_finished = models.BooleanField(default=False)
    
    def count_question(self):
        return self.test.count_question()