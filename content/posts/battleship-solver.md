---
title: "Battleship Solver"
date: 2023-05-31T06:29:34-05:00
tags: ["Go", "JavaScript"]
draft: true
---

I recently read [this blog post](http://www.datagenetics.com/blog/december32011/) by Nick Berry and really enjoyed it.  If you're interested in data science, math, or board games, I recommend his [DataGenetics blog](https://datagenetics.com/blog.html).  It's a treasure.

In this particular post, Nick compared strategies for the classic *Battleship* board game.  Not surprisingly, he found that the most effective approach mimics how we intuitively play the game ourselves (more on that later).

While Nick does a terrific job explaining the algorithm, I found myself wanting to visualize it and play with it some more.  To that end, I created [this web app](https://battleship.lukeorth.com), which I'll be expounding in this post.

<!--more-->

## The Strategies

If you're unfamiliar with *Battleship* or need a refresher, the official game rules can be found [here](https://www.hasbro.com/common/instruct/battleship.pdf).  The rest of this post assumes you know how to play.

First, it's important to note that *Battleship* is classified as an "unsolvable" game, meaning there is no strategy that can force a win every time.  Like *Yahtzee* or *black jack*, it's (somewhat) dependent on chance.

That said, there are still better/worse ways to play, and probabilistic reasoning can be used to increase the odds of victory.  Offensively, this means:

1. Targeting large areas of "open water"
2. Concentrating fire around the cells that have already been "hit"  

Defensively, it usually just means spreading out ship placement.

These strategies are fairly intuitive, so I won't be spending much time analyzing *why* they work.  Instead, I'll be focusing on *how* they work and *how* to model them.  I also won't be looking at the defensive strategy since it's simplistic and boring (in my opinion).

## Modeling

The two offensive strategies outlined above can be represented as different game "modes" -- a **Hunt mode** and a **Target mode**.

### Hunt Mode

In hunt mode, a player doesn't have any "hits" on the board.

A player that does not have any "hits" on the board is in **Hunt mode**, meaning they are in search of enemy ships.  This is when large areas of open water are targeted.  Once a "hit" is made, the player switches into **Target mode**, and the cells around the "hit" are targeted until the ship is sunk.

