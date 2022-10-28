---
title: "Maze Generation"
date: 2022-10-04T11:12:19-05:00
draft: false
tags: ["Go"]
---

I recently came across [this video series](https://www.youtube.com/watch?v=HyK_Q5rrcr4) by Daniel Shiffman (The Coding Train) where he used a [recursive backtracking algorithm](https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_implementation) to generate mazes.

![Maze Animation](/images/maze.gif)

Shiffman's example was written in JavaScript, so I thought it would be fun to port it to Go and document the journey.  

<!--more-->

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

While the above approach works, I've decided to deviate from this and use bit arrays instead---for two reasons:

1. **Memory Savings.**  Boolean values consume an entire byte of memory. This may come as a surprise to some---after all, wouldn't a single bit suffice? Yes... but, because our CPUs are optimized to read and write in bytes, processing data smaller than this is not efficient.  Thankfully, there is a way to bypass this limitation by converting our boolean values into bits and stuffing them into a byte---specifically a `uint8`.  This is referred to as a bit array, and (in our case) it will reduce the memory requirements by $ 4\times $ without impacting efficiency.
2. **Speed.**  The `walls` array serves several functions within our program, including providing input to our algorithm.  If the algorithm isn't aware of which walls exist, it can't determine which cells to visit next.  If we choose to represent our walls with boolean arrays, we restrict this logic to *if-then* statements.  These in turn can create branches in our compiled code, resulting in unpredictability and reduced performance.  By using bit arrays instead, we can expand our options to include bitwise operations.  These allow our algorithm to use mathematical operations to predictably (but still conditionally) execute program logic---bolstering performance.

With that rationale out of the way, let's now turn our attention to the implementation.  I believe the following chart should be sufficient for this.

{{< highlight text >}}
BITS     INTEGER     WALLS                     EXAMPLE
----     -------     -----                     -------
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

## The Animation

Because Shiffman used JavaScript, he was able to render his mazes in the browser quite easily (a perk to programming in the browser's native tongue).  Since we are using Go, however, we'll need to get a bit more creative with our approach.

To be fair, we could also render our mazes in the browser with a little extra work.  A couple of ideas come to mind:

1. Compiling our code to WebAssembly.
2. Creating a maze API that's consumed by JavaScript.

I may explore these options in future posts, but I'd rather shift our focus away from the browser for now.  Instead, let's use something simpler---the humble GIF.

![Homer Simpson GIF](/images/simpson.gif)

While any video format would work for this, GIFs are by far the easiest to implement.  For one, Go maintains a [gif package](https://pkg.go.dev/image/gif) in their standard library, so its supported right out of the box.

This convenience does come with a trade-off though---storage space.  GIFs are notorious for their bloat, thanks to their poor compression technique.  When compared to other formats like MP4, it's common for GIFs to consume $ 4\times $, $ 6\times $, or even $ 9\times $ as much memory depending on the specifics.

A better solution is to create the video directly from our program's memory, without building intermediate images.

While this could be accomplished with any video format, I've opted to use the humble GIF.  This has everything to do with the convenient [gif package](https://pkg.go.dev/image/gif) provided in Go's standard library and nothing to do with the merits of the format itself.  It's no secret that GIFs are known for their bloat, making other video formats (like MP4) ideal.  However, these space savings come at the cost of increased complexity---a trade-off that I'm not willing to make.

{{< tabs tabTotal="3" tabRightAlign="2">}}
{{< tab tabName="Tab 1" >}}

{{< highlight text >}}
BITS     INTEGER     WALLS                     EXAMPLE
----     -------     -----                     -------
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

{{< /tab >}}
{{< tab tabName="Tab 2" >}}

{{< highlight text >}}
walls[0] --> top
walls[1] --> right
walls[2] --> bottom
walls[3] --> left
{{</highlight >}}

{{< /tab >}}
{{< tab tabName="Tab 3">}}

{{< highlight javascript >}}
walls = [true, true, false, false]   //       top, right:  ¯|
walls = [false, false, true, true]   //     bottom, left: |_
walls = [true, true, false, true]    // top, right, left: |¯|
{{</highlight >}}

{{< /tab >}}
{{< /tabs >}}
