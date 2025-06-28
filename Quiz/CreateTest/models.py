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
    
    def show_count_question(self):
        count = self.count_question()
        if str(count)[-1] in '1234':
            return f'{count} питання'
        else:
            return f'{count} питань'
    
class Question(models.Model):
    question_number = models.IntegerField(default=0)
    question = models.CharField(max_length=255)
    image = models.ImageField(upload_to='question', null=True, blank=True)
    answers = models.TextField(null=True)
    answer_type = models.CharField(max_length=50)
    correct_answer = models.TextField()
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    time = models.IntegerField(default=30)
    
    def __str__(self):
        return self.question
    
class AnswerImage(models.Model):
    image = models.ImageField(upload_to='answer')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer_id = models.TextField()