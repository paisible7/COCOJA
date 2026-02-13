# 🤖 Guide d'Intégration du Modèle NLP

## 📝 Vue d'ensemble

Le système est maintenant prêt pour intégrer votre modèle NLP. Toute la logique est centralisée dans le fichier [`chat/nlp_model.py`](chat/nlp_model.py).

## 🚀 Étapes d'Intégration

### 1. Préparer votre modèle

Assurez-vous d'avoir :
- Les poids du modèle (fichiers `.pt`, `.bin`, `.pth`, etc.)
- Le tokenizer associé
- Les dépendances nécessaires (transformers, torch, etc.)

### 2. Installer les dépendances

```bash
# Pour les modèles Hugging Face
pip install transformers torch

# Pour d'autres frameworks
# pip install tensorflow
# pip install jax
```

### 3. Configurer l'environnement

Copiez `.env.example` vers `.env` et configurez :

```bash
cp .env.example .env
```

Modifiez les variables dans `.env` :

```env
# Chemin vers votre modèle
NLP_MODEL_PATH=/path/to/your/model
NLP_MODEL_NAME=gpt2  # ou votre modèle

# Configuration GPU/CPU
NLP_DEVICE=cuda  # ou cpu

# Paramètres de génération
NLP_MAX_LENGTH=512
NLP_TEMPERATURE=0.7
```

### 4. Modifier `chat/nlp_model.py`

#### Option A : Utiliser un modèle Hugging Face

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
import os

class NLPModel:
    def __init__(self):
        model_name = os.getenv('NLP_MODEL_NAME', 'gpt2')
        device = os.getenv('NLP_DEVICE', 'cpu')
        
        self.device = torch.device(device)
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name)
        self.model.to(self.device)
        self.model.eval()
    
    def generate_response(self, user_input, conversation_history=None, **kwargs):
        # Préparer le prompt avec l'historique
        prompt = self._prepare_prompt(user_input, conversation_history)
        
        # Tokenizer
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)
        
        # Générer
        with torch.no_grad():
            outputs = self.model.generate(
                inputs.input_ids,
                max_length=kwargs.get('max_length', 512),
                temperature=kwargs.get('temperature', 0.7),
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
        
        # Décoder
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        return response
    
    def _prepare_prompt(self, user_input, conversation_history):
        """Formater le prompt avec l'historique"""
        if not conversation_history:
            return user_input
        
        prompt = ""
        for msg in conversation_history[-5:]:  # Garder les 5 derniers messages
            role = msg['role'].upper()
            content = msg['content']
            prompt += f"{role}: {content}\n"
        
        prompt += f"USER: {user_input}\nASSISTANT:"
        return prompt
```

#### Option B : Utiliser votre propre modèle

```python
class NLPModel:
    def __init__(self):
        # Charger votre modèle custom
        self.model = self._load_custom_model()
    
    def _load_custom_model(self):
        # Votre code de chargement
        import your_model_library
        model = your_model_library.load_model('path/to/model')
        return model
    
    def generate_response(self, user_input, conversation_history=None, **kwargs):
        # Votre logique de génération
        response = self.model.predict(user_input)
        return response
```

### 5. Tester l'intégration

```bash
# Lancer le serveur
python manage.py runserver

# Dans un autre terminal, tester l'API
curl -X POST http://127.0.0.1:8000/api/chat/ask/ \
  -H "Content-Type: application/json" \
  -d '{"question": "Bonjour, comment ça va ?"}'
```

## 🔧 Configuration avancée

### Gestion de la mémoire

Pour les modèles volumineux :

```python
class NLPModel:
    def __init__(self):
        # Charger en 8-bit ou 4-bit
        from transformers import BitsAndBytesConfig
        
        quantization_config = BitsAndBytesConfig(
            load_in_8bit=True,
            llm_int8_threshold=6.0
        )
        
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            quantization_config=quantization_config,
            device_map="auto"
        )
```

### Cache de réponses

```python
from functools import lru_cache

class NLPModel:
    @lru_cache(maxsize=100)
    def generate_response(self, user_input, **kwargs):
        # Utiliser le cache pour les questions fréquentes
        return self._generate(user_input, **kwargs)
```

### Gestion asynchrone

Pour ne pas bloquer les requêtes :

```python
from asgiref.sync import sync_to_async

# Dans views.py
async def ask_model(request):
    response = await sync_to_async(generate_ai_response)(user_input)
    return Response({'answer': response})
```

## 📊 Monitoring et Logs

Ajoutez des logs pour suivre les performances :

```python
import logging

logger = logging.getLogger(__name__)

class NLPModel:
    def generate_response(self, user_input, **kwargs):
        import time
        start = time.time()
        
        response = self._generate(user_input, **kwargs)
        
        elapsed = time.time() - start
        logger.info(f"Génération terminée en {elapsed:.2f}s")
        
        return response
```

## 🧪 Tests

Créez des tests dans `chat/tests.py` :

```python
from django.test import TestCase
from chat.nlp_model import get_nlp_model

class NLPModelTestCase(TestCase):
    def test_model_loading(self):
        model = get_nlp_model()
        self.assertIsNotNone(model)
    
    def test_generate_response(self):
        model = get_nlp_model()
        response = model.generate_response("Hello")
        self.assertIsInstance(response, str)
        self.assertTrue(len(response) > 0)
```

## 🚨 Dépannage

### Erreur : Out of Memory

- Réduire `NLP_MAX_LENGTH`
- Utiliser `NLP_DEVICE=cpu`
- Quantifier le modèle (8-bit ou 4-bit)

### Erreur : Model not found

- Vérifier `NLP_MODEL_PATH` et `NLP_MODEL_NAME`
- Télécharger le modèle manuellement
- Vérifier les permissions du dossier

### Réponses lentes

- Utiliser un GPU : `NLP_DEVICE=cuda`
- Réduire `NLP_MAX_LENGTH`
- Implémenter un cache
- Utiliser un modèle plus petit

## 📚 Exemples de modèles

### Modèles recommandés

| Modèle | Taille | Usage | Performance |
|--------|--------|-------|-------------|
| GPT-2 | 774M | Tests/Dev | Rapide |
| DistilGPT-2 | 355M | Prod légère | Très rapide |
| GPT-J-6B | 6B | Prod avancée | Moyen |
| LLaMA-2-7B | 7B | Prod premium | Moyen |

### Configuration example pour GPT-2

```python
# Dans chat/nlp_model.py
def _initialize_model(self):
    from transformers import GPT2LMHeadModel, GPT2Tokenizer
    
    self.tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
    self.model = GPT2LMHeadModel.from_pretrained('gpt2')
    self.tokenizer.pad_token = self.tokenizer.eos_token
```

## ✅ Checklist avant production

- [ ] Modèle testé et fonctionnel
- [ ] Variables d'environnement configurées
- [ ] Logs et monitoring en place
- [ ] Tests unitaires écrits
- [ ] Gestion des erreurs implémentée
- [ ] Performance optimisée (GPU/cache)
- [ ] Documentation à jour

## 🔗 Ressources

- [Hugging Face Models](https://huggingface.co/models)
- [Transformers Documentation](https://huggingface.co/docs/transformers)
- [Django Async Views](https://docs.djangoproject.com/en/4.2/topics/async/)

---

**Note**: Le système fonctionne actuellement en mode simulation. Suivez ce guide pour intégrer votre modèle réel.
