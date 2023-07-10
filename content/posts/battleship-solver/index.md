---
title: "Battleship Solver"
date: 2023-05-31T06:29:34-05:00
tags: ["Go", "JavaScript"]
draft: true
---

I recently read [this blog post](http://www.datagenetics.com/blog/december32011/) by Nick Berry and thoroughly enjoyed it.  If you're interested in data science, math, or board games, I highly recommend his [DataGenetics blog](https://datagenetics.com/blog.html).  It's a treasure.

In this particular post, Nick compared strategies for the classic *Battleship* board game.  Not surprisingly, he found that the most effective approach mimics how we intuitively play the game ourselves (more on that later).

While he does a terrific job explaining the algorithm (with one minor caveat), I found myself wanting to visualize and play with it some more.  To that end, I created [this web app](https://battleship.lukeorth.com) --- the subject of this post.

<!--more-->

## Strategy

If you're unfamiliar with *Battleship* or need a refresher, the official game rules can be found [here](https://www.hasbro.com/common/instruct/battleship.pdf).

It's important to note that *Battleship* is considered an "unsolvable" game, meaning there is no strategy that can force a win every time.  Like *Yahtzee* or *black jack*, it's (somewhat) dependent on chance.  

That said, there are still better/worse ways to play, and probabilistic reasoning can be used to increase the odds of victory.  "Knowing thy enemy" plays a significant role, but beyond that, *Battleship* is really just a numbers game.

### Our Intuition

Some of this comes from "knowing thy enemy," but the rest is a numbers game.  Namely:

These strategies are familiar to most.  However, even to newcomers (or anyone with crusty skills)

You likely already incorporate these strategies into your gameplay.

These strategies are familiar to most and they're easy to intuit.  For example, consider the following game board, where gray dots represent "misses."

![intuition_image](images/intuition_1.png?w=400&l=lazy "Game Board 1")

Even to the uninitiated, it's apparent that the next salvo should focus on rows _F_ through _J_.  These lower quadrants are the least explored, thereby yielding the highest probability of success.

![intuition_image](images/intuition_2.png?w=400&l=lazy "Game Board 2")

This is clearly a contrived example, but it demonstrates the general effectiveness of our intuition (at least when applied to _Battleship_).

This is a contrived example of course, but it demonstrates that our approximations are 

### Our Intuitions

Before mathematically perfecting 

Consider the following game board.


### Game Modes


On offense, a player can be in one of two game "modes" -- a **Hunt mode** and a **Target mode**.

When in **Hunt mode**, players don't have any active "hits" on the board.  Their immediate goal is to land a "hit," thereby locating an enemy ship.  Once accomplished, players switch into **Target mode**.  That is, until there are no longer any active "hits," and the player switches back to **Hunt mode**.

1. Targeting large, unexplored areas of "open water"
2. Concentrating fire around cells that have already been "hit"


