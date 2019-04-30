from django.shortcuts import render
from django.http import HttpResponse
from .models import Card
import requests
import json


def index(request):
    return render(request, 'main/index.html')


def get_decks(request):
    url = 'https://swdestinydb.com/api/public/decklist/'
    data = json.loads(request.body)
    user_deck = requests.get(url + data['deck_id']).json()
    opp_deck = requests.get(url + data['opp_deck']).json()
    user_char_arr = []
    opp_char_arr = []

    user_chars = user_deck['characters']
    opp_chars = opp_deck['characters']

    for char in opp_chars:
        print(char)
        opp_char_arr += Card.objects.filter(id = char)

    print(opp_char_arr)

    print(opp_char_arr[0].calc_dmg())




