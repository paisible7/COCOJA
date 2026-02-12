from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([AllowAny])
def ask_model(request):
    user_input = request.data.get('question')
    
    # Ici tu appelles ton modèle NLP pour générer une réponse
    # Pour l'instant, on renvoie juste un test
    response = f"Réponse du modèle à : {user_input}"
    
    return Response({'answer': response})
