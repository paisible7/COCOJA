"""
Module pour l'intégration du modèle NLP/IA.
Ce fichier centralise toute la logique d'interaction avec le modèle d'intelligence artificielle.
"""

from typing import Optional


class NLPModel:
    """
    Classe pour gérer le modèle NLP.
    
    TODO: Remplacer cette implémentation par votre modèle réel.
    """
    
    def __init__(self):
        """
        Initialiser le modèle NLP.
        
        Ici vous pouvez :
        - Charger les poids du modèle
        - Initialiser le tokenizer
        - Configurer le device (CPU/GPU)
        - Charger les configurations nécessaires
        """
        self.model = None
        self.tokenizer = None
        self._initialize_model()
    
    def _initialize_model(self):
        """
        Initialise et charge le modèle.
        
        Exemple avec transformers:
        from transformers import AutoModelForCausalLM, AutoTokenizer
        
        model_name = "votre-modele"
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name)
        """
        # TODO: Charger votre modèle ici
        print("⚠️  Modèle NLP non initialisé - utilisation du mode simulation")
    
    def generate_response(
        self,
        user_input: str,
        conversation_history: Optional[list] = None,
        max_length: int = 512,
        temperature: float = 0.7,
    ) -> str:
        """
        Génère une réponse basée sur l'entrée de l'utilisateur.
        
        Args:
            user_input: Le message de l'utilisateur
            conversation_history: Historique des messages [{role: str, content: str}, ...]
            max_length: Longueur maximale de la réponse
            temperature: Température pour la génération (contrôle la créativité)
        
        Returns:
            La réponse générée par le modèle
        
        TODO: Implémenter la logique de génération avec votre modèle
        """
        
        # Mode simulation - À REMPLACER
        if not self.model:
            return self._simulation_response(user_input)
        
        # TODO: Implémenter votre logique de génération
        # Exemple:
        # inputs = self.tokenizer(user_input, return_tensors="pt")
        # outputs = self.model.generate(
        #     inputs.input_ids,
        #     max_length=max_length,
        #     temperature=temperature,
        #     do_sample=True
        # )
        # response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        # return response
        
        return self._simulation_response(user_input)
    
    def _simulation_response(self, user_input: str) -> str:
        """
        Réponse de simulation pour le développement.
        À supprimer une fois le vrai modèle intégré.
        """
        responses = {
            "bonjour": "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
            "salut": "Salut ! Je suis là pour répondre à vos questions.",
            "comment vas-tu": "Je vais bien, merci ! Et vous ?",
            "merci": "De rien ! N'hésitez pas si vous avez d'autres questions.",
        }
        
        # Recherche de mots-clés simples
        user_lower = user_input.lower().strip()
        for keyword, response in responses.items():
            if keyword in user_lower:
                return response
        
        # Réponse par défaut
        return f"J'ai bien reçu votre message : '{user_input}'. Je suis actuellement en mode simulation. Intégrez votre modèle NLP pour des réponses intelligentes."
    
    def format_conversation_history(self, messages: list) -> str:
        """
        Formate l'historique de conversation pour le modèle.
        
        Args:
            messages: Liste de messages [{role: str, content: str}, ...]
        
        Returns:
            Historique formaté sous forme de string
        """
        formatted = []
        for msg in messages:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            formatted.append(f"{role.upper()}: {content}")
        return "\n".join(formatted)


# Instance globale du modèle (singleton)
_model_instance: Optional[NLPModel] = None


def get_nlp_model() -> NLPModel:
    """
    Retourne l'instance unique du modèle NLP (singleton pattern).
    Le modèle est chargé une seule fois au démarrage.
    
    Returns:
        Instance du modèle NLP
    """
    global _model_instance
    if _model_instance is None:
        _model_instance = NLPModel()
    return _model_instance


def generate_ai_response(
    user_input: str,
    conversation_history: Optional[list] = None
) -> str:
    """
    Fonction helper pour générer une réponse IA.
    
    Args:
        user_input: Le message de l'utilisateur
        conversation_history: Historique optionnel de la conversation
    
    Returns:
        La réponse générée
    """
    model = get_nlp_model()
    return model.generate_response(user_input, conversation_history)
