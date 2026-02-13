from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import viewsets, status
from .models import Conversation, Message
from .serializers import (
    ConversationSerializer,
    ConversationListSerializer,
    MessageSerializer,
    MessageCreateSerializer
)


class ConversationViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les conversations."""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ConversationListSerializer
        return ConversationSerializer
    
    def get_queryset(self):
        # Les utilisateurs ne voient que leurs propres conversations
        return Conversation.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Associer automatiquement la conversation à l'utilisateur connecté
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_message(self, request, pk=None):
        """Ajouter un message à une conversation."""
        conversation = self.get_object()
        serializer = MessageCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            message = serializer.save(conversation=conversation)
            return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Récupérer tous les messages d'une conversation."""
        conversation = self.get_object()
        messages = conversation.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les messages."""
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer
    
    def get_queryset(self):
        # Les utilisateurs ne voient que les messages de leurs conversations
        return Message.objects.filter(conversation__user=self.request.user)


@api_view(['POST'])
@permission_classes([AllowAny])
def ask_model(request):
    """Endpoint pour poser une question au modèle (guest ou authentifié)."""
    user_input = request.data.get('question')
    conversation_id = request.data.get('conversation_id')
    
    # Ici tu appelles ton modèle NLP pour générer une réponse
    # Pour l'instant, on renvoie juste un test
    response = f"Réponse du modèle à : {user_input}"
    
    # Si l'utilisateur est authentifié, sauvegarder les messages
    if request.user.is_authenticated and conversation_id:
        try:
            conversation = Conversation.objects.get(id=conversation_id, user=request.user)
            
            # Sauvegarder le message de l'utilisateur
            Message.objects.create(
                conversation=conversation,
                role='user',
                content=user_input
            )
            
            # Sauvegarder la réponse de l'assistant
            Message.objects.create(
                conversation=conversation,
                role='assistant',
                content=response
            )
        except Conversation.DoesNotExist:
            pass
    
    return Response({'answer': response})

