---
title: "Maze Generation"
date: 2022-10-04T11:12:19-05:00
draft: false
---

I recently came across [this video series](https://www.youtube.com/watch?v=HyK_Q5rrcr4) by Daniel Shiffman (The Coding Train) where he used a [recursive backtracking algorithm](https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_implementation) to generate mazes.

![Maze Animation](/images/maze.gif)

Shiffman's example was written in JavaScript, so I thought it would be fun to port it to Go and document the journey.  

## The Algorithm

Like Shiffman, we will use a recursive backtracking algorithm to generate our mazes.  The implementation is similar to [depth-first search](https://en.wikipedia.org/wiki/Depth-first_search) (DFS), with a slight twist.  Let's carefully observe the animation above to get a better understanding.

We start off with an empty grid of cells.  The algorithm forms a path by "drilling" through the grid, cell by cell, removing the impeding walls along the way.  At each step, the next cell is chosen at *random*.  This produces the maze effect.  If our algorithm ever becomes "trapped", meaning it can't move forward without going out of bounds or "drilling" into a previously explored cell, it will backtrack until it can continue exploring new cells.

This can be summarized more succinctly with the following instructions:

1. Choose a "start" cell and make it the current cell
2. Mark the current cell as visited
3. While the current cell has unvisited neighbor cells
    1. Randomly choose one of the unvisited neighbors
    2. Remove the wall between the current cell and the neighbor cell
    3. Execute this routine recursively for the neighbor cell

One thing to note with this approach is its bias towards mazes with long passageways---a result of DFS's low branching factor.  While that's not necessarily a bad thing, it does reduce the complexity of our mazes.

**Note:** For creating mazes without biases, check out [Wilson's algorithm](https://en.wikipedia.org/wiki/Maze_generation_algorithm#Wilson's_algorithm).

## Data Structures

As previously stated, we will represent our mazes as grids of *cells*.  To do this, we'll define the following two structs:

{{< highlight go >}}
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

Additionally, our algorithm needs to maintain its positional history using a stack.  Since Go doesn't provide this out of the box, we'll implement our own:

{{< highlight go >}}
type Stack struct {
    cell []Cell     // the cells contained in our stack
}
{{</highlight >}}

## Representing the Walls

Those who have seen Shiffman's series may recall his use of boolean arrays to represent cell walls---similar to this:

{{< highlight javascript >}}
walls = [true, true, true, true]    // top, right, bottom, left
{{</highlight >}}

As shown below, each index corresponds to a specific wall---with `true` values indicating a wall's presence and `false` indicating its absence.

{{< highlight text >}}
walls[0] --> top
walls[1] --> right
walls[2] --> bottom
walls[3] --> left
{{</highlight >}}

{{< highlight javascript >}}
walls = [true, true, false, false]   //       top, right:  ¯|
walls = [false, false, true, true]   //     bottom, left: |_
walls = [true, true, false, true]    // top, right, left: |¯|
{{</highlight >}}

While the above approach works, I've decided to deviate and use bit arrays instead.  This is for two reasons:

1. **Memory Savings.**  Boolean values consume a byte of memory. This may come as a surprise to some---after all, wouldn't a single bit suffice? Yes... but, because our CPUs are built to read and write in bytes, processing data smaller than this is not optimal.  Thankfully, there is a way to bypass this limitation by converting our boolean values into bits and stuffing them into a single byte---a `uint8`.  This is referred to as a bit array, and (in our case) it will provide $ 4\times $ memory savings with no loss in efficiency.
2. **Speed.**  The `walls` array serves several functions in our program, one of which is the conditional logic of our algorithm.  Without knowledge of which walls exist, our algorithm can't determine which cells to visit next.  Therefore, if we use boolean arrays for this task, we (unnecessarily) restrict this logic to *if-then* statements.  These statements have the nasty tendency of creating branches in our compiled code, resulting in unpredictability and reduced performance.  By using bit arrays instead, we expand our options to include bitwise operations.  This allows our algorithm to use mathematics to predictably (but still conditionally) execute program logic---bolstering performance.

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


