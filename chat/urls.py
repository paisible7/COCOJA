from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ask_model, ConversationViewSet, MessageViewSet

router = DefaultRouter()
router.register(r'conversations', ConversationViewSet, basename='conversation')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('ask/', ask_model, name='ask_model'),
    path('', include(router.urls)),
]

