import requests
from .models import Card


url = 'https://swdestinydb.com/api/public/cards/'
cards = requests.get(url).json()
card_objs = []

for i, card in enumerate(cards):
    sides = ''
    try:
        sides = ','.join(card['sides'])
    except KeyError:
        sides = None
    new_card = Card(
                id = card['code'],
                sides = sides,
                name = card['name'],
                cost = card['cost'],
                health = card['health'],
                has_die = card['has_die'],
                url = card['url'],
                img_src = card['imagesrc'],
            )

    card_objs += [new_card]

Card.objects.bulk_create(card_objs, batch_size=100, ignore_conflicts=True)
print(str(len(card_objs)) + ' cards')

