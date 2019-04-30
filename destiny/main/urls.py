from django.urls import path
from . import views

app_name = 'main'

urlpatterns = [
    path('', views.index, name='index'),
    path('get_decks/', views.get_decks, name='get_decks'),
]

