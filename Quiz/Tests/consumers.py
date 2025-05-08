from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import StartTest
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from urllib.parse import parse_qs


class QuizConsumers(AsyncWebsocketConsumer):
    async def connect(self):
        print('connect')
        self.quiz_code = self.scope['url_route']['kwargs']['quiz_code']
        self.quiz_group_name = f'quiz_{self.quiz_code}'
        self.user = self.scope['user']
        admin = await self.get_test_admin()
        await self.channel_layer.group_add(
            self.quiz_group_name,
            self.channel_name
        )
        await self.accept()
        params = parse_qs(self.scope['query_string'].decode())
        if not self.user.is_authenticated or self.user != admin:
            if self.user.is_authenticated: 
                username = self.user.username
            else:
                username = params.get('name', '')
            socket_exist = params.get('socket_exist', False)
            if not socket_exist:
                await self.channel_layer.group_send(
                    self.quiz_group_name,
                    {
                        'type': 'user_connect',
                        'username': username
                    }
                )
            
    @database_sync_to_async
    def get_test_admin(self):
        start_test = StartTest.objects.filter(code=self.quiz_code).first()
        return start_test.admin
        
    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.quiz_code,
            self.channel_name
        )
        
    async def user_connect(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_connect',
            'username': event['username']
        }))