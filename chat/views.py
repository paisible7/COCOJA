from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def ask_model(request):
    user_input = request.data.get('question')
    
    # Ici tu appelles ton modèle NLP pour générer une réponse
    # Pour l'instant, on renvoie juste un test
    response = f"Réponse du modèle à : {user_input}"
    
    return Response({'answer': response})
