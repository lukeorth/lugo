---
title: "Maze Generation"
date: 2022-10-04T11:12:19-05:00
draft: false
---

I recently came across [this video series](https://www.youtube.com/watch?v=HyK_Q5rrcr4) by The Coding Train (Daniel Shiffman) on maze generation, and I was mesmerized.

{{< youtube id="HyK_Q5rrcr4" title="Coding Challenge #10.1: Maze Generator with p5.js - Part 1" >}}

By using a [recursive backtracking algorithm](https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_implementation), he was able to generate a random maze and display its creation in real time.  Pretty cool!

Shiffman used the [p5.js](https://p5js.org/) library in his series, so I thought it would be a fun exercise to port it over to Go and document the journey.

## The Algorithm

Like Shiffman, I will be using a recursive backtracking algorithm to generate the mazes.  This will be a randomized version of the [depth-first search](https://en.wikipedia.org/wiki/Depth-first_search) (DFS) algorithm, called via a recursive routine.

One thing to note with this approach is its bias towards mazes with long passageways.  This is a result of the low branching factor baked into DFS.  While that's not necessarily a bad thing for our purposes, it will reduce the complexity of the mazes.

**Note:** For creating mazes without biases, check out [Wilson's algorithm](https://en.wikipedia.org/wiki/Maze_generation_algorithm#Wilson's_algorithm).

With that said, the algorithm is defined as follows:

1. Choose a starting cell and make it the current cell
2. Mark the current cell as visited
3. While the current cell has unvisited neighbor cells
    1. Choose one of the unvisited neighbors
    2. Remove the wall between the current cell and the neighbor cell
    3. Invoke the routine recursively for the neighbor cell

## The Animation

This is an additional consideration since I've chosen to use Go.  
