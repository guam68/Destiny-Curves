# Destiny-Curves

## Background/Overview
I was working on another django project but I've decided to set it on hold in favor of this for now. While I love the gameplay of KeyForge, it doesn't quite let me dive into it outside of the game due to a lack of deck building. This has pushed me to take up an alternate game on the side. I considered pikcing up the pauper format in MTG but ultimatly, the Star Wars theme won me over with Destiny.

I'm still pretty new (I have five games under my belt at this point) and one thing I have found interesting when considering options in deck building are damage and resource curves. Shout out to Team Covenant and their learn to play series. You can learn more about the curves and how they affect deck building [here](https://www.youtube.com/watch?v=u2UXHAMUfFY&list=PLmHifZPFC_JtcmsxaciHHf8FEonoV6KOL&index=6). 

The goal of this project is to produce these curves based on an imported decklist. Ideally they would be adustable based on user input information. Still need to learn a bit more on what is actually most useful to the player.

## Functionality

This is going to be a simple single page application that works in tandem with swdestinydb.com. When a user creates a deck on that website, the deck is given an id. This id will be used to import the deck and gain all pertinent card information through the API provided by swdestinydb. That data will be used to generate our curves using D3.js. Card images are provided via Fantasy Flight Games' CDN.

## Progress

- [x] Get all data for a deck to the page
- [x] Generate a graph for a curve (based on a four turn game)

* [x] Input for turn amount
* [x] Input for primary target
* [x] Curve adjustment for turn characters are expected to be defeated 

- [x] Create the basic Django application with the app working in its previous state
- [x] Write a Python script to populate a Postgres database with all the card information
- [x] Replace existing JS code with Django template code to get card info from database instead of looped API requests

* [ ] Select to add upgrades for different turns
* [ ] Select to add supports for different turns

- [ ] Generate a graph plotting required resources 
- [ ] Interface for browsing cards

* [ ] Styling


### Known Issues
30 May 2019
-   Minor, but after becoming more familiar with the game, having a slider to select turn length is 
    unnecessary. Maybe just remove it and cap out at 4-6 turns

