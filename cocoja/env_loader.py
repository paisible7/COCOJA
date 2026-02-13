"""
Utilitaire pour charger les variables d'environnement depuis le fichier .env
"""

import os
from pathlib import Path


def load_env_file(env_path: str = None):
    """
    Charge les variables d'environnement depuis un fichier .env
    
    Args:
        env_path: Chemin vers le fichier .env (optionnel)
    """
    if env_path is None:
        # Chercher .env dans le dossier parent (racine du projet)
        base_dir = Path(__file__).resolve().parent.parent
        env_path = base_dir / '.env'
    else:
        env_path = Path(env_path)
    
    if not env_path.exists():
        print(f"⚠️  Fichier .env non trouvé : {env_path}")
        print(f"💡 Copiez .env.example vers .env et configurez vos variables")
        return
    
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            
            # Ignorer les commentaires et lignes vides
            if not line or line.startswith('#'):
                continue
            
            # Parser la ligne KEY=VALUE
            if '=' in line:
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip()
                
                # Retirer les quotes si présentes
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                elif value.startswith("'") and value.endswith("'"):
                    value = value[1:-1]
                
                # Définir la variable d'environnement si elle n'existe pas déjà
                if key not in os.environ:
                    os.environ[key] = value


def get_env(key: str, default=None, cast=str):
    """
    Récupère une variable d'environnement avec conversion de type
    
    Args:
        key: Nom de la variable
        default: Valeur par défaut si non trouvée
        cast: Fonction de conversion du type (str, int, bool, etc.)
    
    Returns:
        La valeur convertie ou la valeur par défaut
    
    Examples:
        >>> get_env('DEBUG', False, bool)
        True
        >>> get_env('MAX_LENGTH', 512, int)
        512
    """
    value = os.environ.get(key)
    
    if value is None:
        return default
    
    # Conversion spéciale pour les booléens
    if cast == bool:
        return value.lower() in ('true', '1', 'yes', 'on')
    
    try:
        return cast(value)
    except (ValueError, TypeError):
        return default


# Charger automatiquement au démarrage
load_env_file()
