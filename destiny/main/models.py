from django.db import models
import re

class Card(models.Model):
    id = models.TextField(primary_key=True)
    type_code = models.TextField(blank=True, null=True)
    sides = models.TextField(blank=True, null=True)
    name = models.TextField()
    cost = models.IntegerField(blank=True, null=True)
    health = models.IntegerField(blank=True, null=True)
    has_die = models.BooleanField()
    dmg = models.FloatField(blank=True, null=True)
    url = models.TextField()
    img_src = models.TextField(blank=True, null=True)

    
    def __str__(self):
        return self.name
