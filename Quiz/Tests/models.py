from django.db import models
from django.contrib.auth.models import User
from CreateTest.models import Test, Question

# Create your models here.
class Result(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    result = models.TextField()

    def __str__(self):
        return f'{self.user.username} - {self.test.name} - {self.result}'
    
class GlobalResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    results = models.ForeignKey(Result, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.user.username} - {self.results}'
    
class StartTest(models.Model):
    admin = models.ForeignKey(User, on_delete=models.CASCADE)
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    code = models.CharField(max_length=4)
    users = models.ManyToManyField(User, related_name='users')
    users_not_auth = models.TextField()