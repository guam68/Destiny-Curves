from django.shortcuts import render
from django.http import JsonResponse
from django.forms.models import model_to_dict
from .models import Card
import requests
import json
# from . import populate_db


def index(request):
    return render(request, 'main/index.html')


def get_decks(request):
    url = 'https://swdestinydb.com/api/public/decklist/'
    data = json.loads(request.body)
    user_deck = requests.get(url + data['deck_id'].strip()).json()
    opp_deck = requests.get(url + data['opp_deck'].strip()).json()

    user_dice = {}
    opp_dice = {}

    for card_id in user_deck['slots']:
        if user_deck['slots'][card_id]['dice'] > 0:
            user_dice[card_id] = model_to_dict(Card.objects.get(id = card_id))
            user_dice[card_id]['quantity'] = user_deck['slots'][card_id]['quantity']
    for card_id in opp_deck['slots']:
        if opp_deck['slots'][card_id]['dice'] > 0:
            opp_dice[card_id] = model_to_dict(Card.objects.get(id = card_id))     
            opp_dice[card_id]['quantity'] = opp_deck['slots'][card_id]['quantity']
    
    user_chars = user_deck['characters']
    opp_chars = opp_deck['characters']

    user_char_dict = assign_characters(user_chars)
    opp_char_dict = assign_characters(opp_chars)

    return JsonResponse({'user': user_char_dict, 'user_dice': user_dice, 'opp': opp_char_dict, 'opp_dice': opp_dice})


def assign_characters(chars):
    char_dict = {}
    i = 0
    for char in chars:
        if chars[char]['quantity'] == 1:
            card = Card.objects.get(id = char)
            char_dict[i] = { 
                'card': model_to_dict(card),
                'dice': chars[char]['dice'],
                'dice_dmg': card.dmg
            }
            i += 1
        else:
            card = Card.objects.get(id = char)
            for copy in range(chars[char]['quantity']):
                char_dict[i] = { 
                    'card': model_to_dict(card),
                    'dice': 1,
                    'dice_dmg': card.dmg
                }
                i += 1
    
    return char_dict
