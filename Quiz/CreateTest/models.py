from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Test(models.Model):
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to='logo')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    finished = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name
    
    def count_question(self):
        return len(Question.objects.filter(test=self))
    
class Question(models.Model):
    question = models.CharField(max_length=255)
    image = models.ImageField(upload_to='question')
    answers = models.TextField()
    answer_type = models.CharField(max_length=50)
    correct_answer = models.TextField()
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    mark = models.IntegerField(default=1)
    
    def __str__(self):
        return self.text