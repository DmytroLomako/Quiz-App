from django.db import models
from django.contrib.auth.models import User
from Tests.models import Test

# Create your models here.
class AdminResult(models.Model):
    admin = models.ForeignKey(User, on_delete=models.CASCADE)
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    
class GlobalResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    test = models.ForeignKey(Test, on_delete=models.CASCADE, null=True)
    result = models.TextField()
    result_url = models.CharField(max_length=50, default=None)
    admin_result = models.ForeignKey(AdminResult, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return f'{self.user.username}'
    
class ResultNotAuth(models.Model):
    username = models.TextField()
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    result = models.TextField()
    result_url = models.CharField(max_length=50, default=None)
    admin_result = models.ForeignKey(AdminResult, on_delete=models.CASCADE, null=True)
    
    def __str__(self):
        return f'{self.username}'