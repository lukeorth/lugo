---
title: "Battleship Solver"
date: 2023-05-31T06:29:34-05:00
tags: ["Go", "JavaScript"]
draft: false
---

I recently stumbled across [this blog post](http://www.datagenetics.com/blog/december32011/) by Nick Berry and really enjoyed it.  If you're interested in data science, math, or board games, I highly recommend his [DataGenetics blog](https://datagenetics.com/blog.html).  It's a treasure.

In this particular post, Nick compares strategies for *Battleship* -- the classic board game you probably played as a kid.  Naturally, the most effective approach mimics how we intuitively play the game ourselves (more on that later).

Nick does a terrific job explaining the algorithm, but I wanted a way to visualize it.  To that end, I created [this web app](https://battleship.lukeorth.com) so that others can enjoy it too.  If you're interested in learning more about the algorithm and its implementation in code, read on.

<!--more-->

## Battleship Strategy

The official *Battleship* game rules can be found [here](https://www.hasbro.com/common/instruct/battleship.pdf) (if you're in need of a refresher).

*Battleship* is considered an "unsolvable" game, meaning there is no strategy that can force a win every time.  This is true for other games as well, like *Monopoly*, *black jack*, and *backgammon*.  Each of these contains some randomness or secrecy that prevents us from reliably computing future outcomes. 

In contrast, games like chess and checkers are considered "solvable" since their state is fully known.  With enough computational power, every possible outcome can be predicted with certainty.

Even still, as anyone that has ever played one of these "unsolvable" games knows, there are better and worse ways to play them -- even if victory is not always guaranteed.  The strategies for such games typically involves some form of probabilistic reasoning

