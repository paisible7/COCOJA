from django.urls import path
from .views import ask_model

urlpatterns = [
    path('ask/', ask_model),
]
