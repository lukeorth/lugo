---
title: "Battleship Solver"
date: 2022-10-04T11:12:19-05:00
draft: true
tags: ["go", "web development"]
---

![Maze Animation](/images/maze-generation/maze.gif)

I recently watched [this YouTube series](https://www.youtube.com/watch?v=HyK_Q5rrcr4) on maze generation by Daniel Shiffman (The Coding Train) and was intrigued by the animations being produced.  Since Shiffman developed his example using JavaScript, I thought it would be fun to port it to Go and document the journey.

<!--more-->

## The Algorithm

Like Shiffman, I'll be using a [recursive backtracking algorithm](https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_implementation) to generate the mazes.  This algorithm is very similar to [depth-first search](https://en.wikipedia.org/wiki/Depth-first_search) (DFS), with a slight twist.  Let's analyze the animation above to see how it works.

We start off with an empty grid of cells.  The algorithm forms a path by "drilling" through the grid cell by cell and removing impeding walls along the way.  At each step, the next cell is chosen at *random*.  This produces the maze effect.  If the algorithm ever becomes "trapped", meaning it can't move forward without *a*) going out of bounds, or *b*) "drilling" into a previously explored cell, it will backtrack until it can continue exploring new cells.

This can be stated more succinctly with the following steps:

1. Choose a "start" cell and make it the current cell
2. Mark the current cell as visited
3. While the current cell has any unvisited neighbor cells
    1. Randomly choose one of the unvisited neighbors
    2. Remove the wall between the current cell and the neighbor cell
    3. Execute this routine recursively for the neighbor cell

An important consideration when using this approach is its strong bias for creating mazes with long corridors---a result of DFS's low branching factor.  While that's not necessarily a bad thing, it does reduce the complexity of our mazes.

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

Additionally, our algorithm needs a way to maintain its positional history.  We can use a stack to accomplish this, but since Go doesn't provide this out of the box we'll implement our own:

{{< highlight go >}}
type Stack struct {
    cell []Cell     // the cells contained in our stack
}
{{</highlight >}}

## Representing the Walls

Those who have seen Shiffman's series may recall the use of boolean arrays to represent cell walls---similar to this:

{{< highlight javascript >}}
walls = [true, true, true, true]    // top, right, bottom, left
{{</highlight >}}

Using this method, each index corresponds to a specific wall---with `true` values indicating the wall's presence and `false` indicating its absence.

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

While the above approach works, I've decided to deviate and use bit arrays instead---for two reasons:

1. **Memory Savings.**  Boolean values consume an entire byte of memory. This may come as a surprise to some.  After all, wouldn't a single bit suffice? Yes... but, because our CPUs are optimized to read and write in bytes, processing smaller chunks of data is simply not efficient.  Thankfully, there is a way to bypass this limitation by converting boolean values to bits and stuffing them into a byte---specifically a `uint8`.  This is referred to as a bit array, and (in our case) it will reduce the memory usage by $ 4\times $ without compromising the efficiency.
2. **Speed.**  The `walls` array serves several important functions within our program, one of which is supplying input to our algorithm (a requirement for determining which cells to visit next).  By choosing to represent cell walls with boolean arrays, we restrict this logic to *if-then* statements.  These statements can create branches in our compiled code, resulting in unpredictability and reduced performance.  By using bit arrays instead, we expand our options to include bitwise operations.  These will allow our algorithm to use mathematical operations to predictably (but still conditionally) execute program logic, bolstering its performance.

With these explanations out of the way, let's now take a look at the specific binary representation we intend to use.  This can be conveniently summarized in the following chart.

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

Shiffman chose to animate his mazes in the browser---a natural choice for anyone working with JavaScript.  Though we could 

To be fair, we could also render our mazes in the browser---it would just require a little extra work.  A couple of options for doing so are:

1. Compiling our code to WebAssembly.
2. Creating a maze API that's consumed by JavaScript.

While I may choose to explore these options in future posts, I'd rather focus on a browser-less solution for now.  Something a bit more primal and more indicative of our progress as a civilization---the humble GIF.

![Homer Simpson GIF](/images/maze-generation/simpson.gif)

While any video format would do, GIFs happen to be the easiest to implement.  For one, Go maintains a [gif package](https://pkg.go.dev/image/gif) in their standard library, so support is provided out of the box.  But on top of that, it's just a simple technology to use and understand.

The convenience is not without trade-offs though---the most significant of which is storage space.  GIFs are notorious for their bloat, thanks to their poor compression technique.  When compared to other formats like MP4, it's common for GIFs to consume $ 4\times $, $ 6\times $, or even $ 9\times $ as much memory depending on the specifics.

A better solution is to create the video directly from our program's memory, without building intermediate images.

While this could be accomplished with any video format, I've opted to use the humble GIF.  This has everything to do with the convenient [gif package](https://pkg.go.dev/image/gif) provided in Go's standard library and nothing to do with the merits of the format itself.  It's no secret that GIFs are known for their bloat, making other video formats (like MP4) ideal.  However, these space savings come at the cost of increased complexity---a trade-off that I'm not willing to make.

{{< tabs tabTotal="3" >}}
{{< tab tabName="test.js" >}}

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
