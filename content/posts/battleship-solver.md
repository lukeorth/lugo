---
title: "Battleship Solver"
date: 2023-05-31T06:29:34-05:00
tags: ["Go", "JavaScript"]
draft: false
---

I recently read [this blog post](http://www.datagenetics.com/blog/december32011/) by Nick Berry and really enjoyed it.  If you're interested in data science, math, or board games, I highly recommend his [DataGenetics blog](https://datagenetics.com/blog.html).  It's a treasure.

In this particular post, Nick compared strategies for the classic *Battleship* board game.  Not surprisingly, he found that the most effective approach mimics how we intuitively play the game ourselves (more on that later).

While he does a terrific job of explaining the algorithm (with one minor caveat), I found myself wanting to visualize and play with it some more.  To that end, I created [this web app](https://battleship.lukeorth.com) which is the subject of this post.

<!--more-->

## The Strategy

If you're unfamiliar with *Battleship* or need a refresher, the official game rules can be found [here](https://www.hasbro.com/common/instruct/battleship.pdf).  The rest of this post assumes you already know how to play.

First, it's important to note that *Battleship* is classified as an "unsolvable" game, meaning there is no strategy that can force a win every time.  Like *Yahtzee* or *black jack*, it's (somewhat) dependent on chance.

That said, there are still better/worse ways to play, and probabilistic reasoning can be used to increase the odds of victory.

### Our Intuitions

Consider the following game board.  No ships have been sunk, and the gray dots represent "misses."  Which cell should be targeted next?

![Intuitive Gameboard 1](images/intuition_1.png "400px")

Of course, it's apparent that rows _F - J_ 

Before performing any definitive calculations, it's already apparent that rows _F - J_ are likely to yield the best results.

, most people will choose a cell in the _F - J_ rows (red box below).

If you're like most, you probably chose a cell in the _F - J_ rows.  You might have even selected a cell in columns _3 - 7_.  Why is this.

![Intuitive Gameboard 2](images/intuition_2.png "400px")

Intuitively, we know that targeting cells in rows _F - J_ are likely to yield better results.

### Game Modes


On offense, a player can be in one of two game "modes" -- a **Hunt mode** and a **Target mode**.

When in **Hunt mode**, players don't have any active "hits" on the board.  Their immediate goal is to land a "hit," thereby locating an enemy ship.  Once accomplished, players switch into **Target mode**.  That is, until there are no longer any active "hits," and the player switches back to **Hunt mode**.

