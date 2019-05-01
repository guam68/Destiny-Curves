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
    user_deck = requests.get(url + data['deck_id'].strip()).json()
    opp_deck = requests.get(url + data['opp_deck'].strip()).json()
    user_char_arr = []
    opp_char_arr = {} 

    user_chars = user_deck['characters']
    opp_chars = opp_deck['characters']

    print(opp_chars)
    i = 0
    for char in opp_chars:
        if opp_chars[char]['quantity'] == 1:
            opp_char_arr [i] = { 
                'card': Card.objects.filter(id = char)[0],
                'dice': opp_chars[char]['dice']
            }
            i += 1
            print(char)
        else:
            for copy in range(opp_chars[char]['quantity']):
                opp_char_arr[i] = { 
                    'card': Card.objects.filter(id = char)[0],
                    'dice': 1
                }
                i += 1
            

    print(opp_char_arr)

    print(opp_char_arr[0]['card'].calc_dmg())

    return




