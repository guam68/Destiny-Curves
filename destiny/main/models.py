from django.db import models

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