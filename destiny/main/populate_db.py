import requests
import re
from .models import Card


def calc_dmg(sides):
    dmg = 0
    dmg_side = 0
    sides = sides.split(',')

    for i in range(len(sides)):
        print(sides)
        if 'MD' in sides[i] or 'RD' in sides[i] or 'ID' in sides[i]:
            side = re.findall(r'\d[A-Z]', sides[i])
            print(side)
            if(side):
                dmg += int(side[0][0])
            dmg_side += 1
        
    dmg_total = format(dmg/dmg_side, '.2f') if dmg_side else 0
    return dmg_total


url = 'https://swdestinydb.com/api/public/cards/'
cards = requests.get(url).json()
card_objs = []

for i, card in enumerate(cards):
    sides = ''
    dmg = 0
    try:
        sides = ','.join(card['sides'])
        dmg = calc_dmg(sides)
    except KeyError:
        sides = None
    new_card = Card(
                id = card['code'],
                type_code = card['type_code'],
                sides = sides,
                name = card['name'],
                cost = card['cost'],
                health = card['health'],
                has_die = card['has_die'],
                dmg = dmg,
                url = card['url'],
                img_src = card['imagesrc'],
            )

    card_objs += [new_card]

Card.objects.bulk_create(card_objs, batch_size=50, ignore_conflicts=True)
print(str(len(card_objs)) + ' cards')


