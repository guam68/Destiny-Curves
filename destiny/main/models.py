from django.db import models
import re

class Card(models.Model):
    id = models.IntegerField(primary_key=True)
    sides = models.TextField(blank=True, null=True)
    name = models.TextField()
    cost = models.IntegerField(blank=True, null=True)
    health = models.IntegerField(blank=True, null=True)
    has_die = models.BooleanField()
    url = models.TextField()
    img_src = models.TextField(blank=True, null=True)

    
    def __str__(self):
        return self.name


    def calc_dmg(self):
        dmg = 0
        dmg_side = 0
        sides = self.sides.split(',')

        for i in range(len(sides)):
            if 'MD' in sides[i] or 'RD' in sides[i] or 'ID' in sides[i]:
                side = re.findall(r'\d[A-Z]', sides[i])
                dmg += int(side[0][0])
                dmg_side += 1
            
        dmg_total = dmg/dmg_side if dmg_side else 0
        return dmg_total