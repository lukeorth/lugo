---
title: "Maze Generation"
date: 2022-10-04T11:12:19-05:00
draft: false
---

In [this video series](https://www.youtube.com/watch?v=HyK_Q5rrcr4), Daniel Shiffman (The Coding Train) uses a [recursive backtracking algorithm](https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_implementation) to generate mazes and display their creation in real time.  Pretty neat.

Shiffman uses the [p5.js](https://p5js.org/) library in his example, so I thought it would be fun to port it to Go and document the process.  While you don't need to have watched Shiffman's series prior to reading this post, I do recommend it.  I will be referencing his code throughout the post.

## The Algorithm

Like Shiffman, we will use a recursive backtracking algorithm to generate our mazes.  The implementation is similar to [depth-first search](https://en.wikipedia.org/wiki/Depth-first_search) (DFS) with a slight twist.

Let's walk through the animation (above) to get a better understanding.  We start with an empty grid of cells.  The algorithm then forms a path by "drilling" through the grid, cell by cell, removing any impeding walls along the way.  At each step, the next cell is chosen at *random*.  This produces the maze effect.  If our algorithm ever becomes "trapped", meaning it's unable to move forward without either going out of bounds or "drilling" into a previously explored cell, it will backtrack until it can continue exploring new cells.

As seen in the algorithm's formal definition below, this is a randomized version of DFS, called with a recursive routine.

1. Choose a "start" cell and make it the current cell
2. Mark the current cell as visited
3. While the current cell has unvisited neighbor cells
    1. Choose one of the unvisited neighbors
    2. Remove the wall between the current cell and the neighbor cell
    3. Execute this routine recursively for the neighbor cell

One thing to note with this approach is its bias towards mazes with long passageways, which is a result of DFS's low branching factor.  While that's not necessarily a bad thing, it will reduce the complexity of our mazes.

**Note:** For creating mazes without biases, I recommend checking out [Wilson's algorithm](https://en.wikipedia.org/wiki/Maze_generation_algorithm#Wilson's_algorithm).

## Data Structures

Using the same terminology as our algorithm, we'll define a maze as a grid of *cells*.  To do this, we just need two structs:

{{< highlight go >}}
package main

type Maze struct {
    cells   []*Cell     // the cells (represented as a grid)
    cols    int         // number of columns
    rows    int         // number of rows
    scale   int         // width of each cell in pixels
}

type Cell struct {
    x       int         // x coordinate
    y       int         // y coordinate
    walls   uint8       // the cell's walls (explained in the next section...)
    visited bool        // has this cell been visited?
    current bool        // is this the current cell being evaluated?
}
{{</highlight >}}

## Representing the Walls

### Shiffman's Design

Shiffman used an array with four boolean values to represent the four walls of a cell.

{{< highlight javascript >}}
walls = [true, true, true, true]    // top, right, bottom, left
{{</highlight >}}

{{< highlight text >}}
walls[0] --> top
walls[1] --> right
walls[2] --> bottom
walls[3] --> left
{{</highlight >}}

`true` represents walls that are present. `false` represents walls that are absent.

{{< highlight javascript >}}
walls = [true, true, false, false]   //       top, right:  ¯|
walls = [false, false, true, true]   //     bottom, left: |_
walls = [true, true, false, true]    // top, right, left: |¯|
{{</highlight >}}

This empowers us to 
This allows us to describe any wall state with just four boolean values.

### Our Design

While the above approach works, it can be 

Let's think in the abstract for a moment---what is a "boolean" value?  It's a single binary choice (also called a *bit*).  A boolean value may be `true` or `false` and bit may be $ 1 $ or $ 0 $.  Conceptually then, bits and boolean values may be used interchangeably (though some practical differences do persist).

In this case we'll convert the boolean array from above into a bit array, which is represented by a `uint8` in Go.  We'll do this for two reasons:

1. **Memory savings.**  This may come as a surprise, but in Go (and most other programming languages) boolean values are actually stored as a byte (8 bits), not a bit.  The reason for this has to do with how our CPUs are designed.  Most data requires at least a byte of memory.  As a result, CPUs have been optimized to read and write in bytes---not bits.  So while we can theorize in bits, our machines work in bytes.  What this means in our case is that the boolean array discussed above will consume four bytes, while the equivalent bit array will consume just one.
2. **Speed.**  Irrespective of the datatype we choose, the `walls` variable is used for conditional logic within our algorithm.  With a boolean array, we're restricting this logic to *if-then* statements, which can create branches in our compiled code.  In turn, this causes unpredictability and negative performance hits to our program.  By using a bit array instead, we expand our options with bitwise operations.  This allows our algorithm to use mathematical operations that predictably (but still conditionally) execute program logic---enhancing its performance.

Thus the "key" to our wall design can be summed up with the following table.

{{< highlight text >}}
BITS    INTEGERS     WALLS                     EXAMPLE
----    --------     -----                     -------
0001        1        left                        |
0010        2        bottom                       _
0100        4        right                         |
1000        8        top                          ¯

0011        3        bottom, left                |_
0101        5        right, left                 | |
0110        6        right, bottom                _|
1001        9        top, left                   |¯
1010       10        top, bottom                 ¯_
1100       12        top, right                   ¯|

0111        7        right, bottom, left         |_|
1011       11        top, bottom, left           |¯_
1101       13        top, right, left            |¯|
1110       14        top, right, bottom          _¯|

1111       15        top, right, bottom, left     □

{{</highlight >}}

An alternative method for achieving the same ends (albiet with some improvements) 

<!--more-->

## The Animation

We'll take a unique approach to the animation process.
One approach is to create an image at each step of the maze generation process and combine these into a video format.  While this works, there are some drawbacks:

1. It requires additional time and memory allocation to create/save each image.
2. It obscures and complicates the code by turning what should be a two-step process into a three-step process.

A better solution is to create the video directly from our program's memory, without building intermediate images.

While this could be accomplished with any video format, I've opted to use the humble GIF.  This has everything to do with the convenient [gif package](https://pkg.go.dev/image/gif) provided in Go's standard library and nothing to do with the merits of the format itself.  It's no secret that GIFs are known for their bloat, making other video formats (like MP4) ideal.  However, these space savings come at the cost of increased complexity---a trade-off that I'm not willing to make.


