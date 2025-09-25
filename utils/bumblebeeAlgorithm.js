// Bumblebee-themed pathfinding algorithm
import { sleep, getNeighbors } from './pathfindingAlgorithms.js';

// Bumblebee theme colors
const BUMBLEBEE_COLORS = {
    VISITED: '#FFD54F',    // Honey yellow for visited cells
    CURRENT: '#FF8A65',    // Orange for current cell
    PATH: '#8D6E63',       // Brown for the final path
    PATH_HEAD: '#FFC107'   // Bright amber for path head
};

// Bumblebee-themed Dijkstra algorithm
export const animateBumblebeeDijkstra = async (grid, start, goal, rows, cols, ctx, cellSize, waitSearch, waitPath, getSearchInProgress) => {
    console.log('🐝 Starting bumblebee algorithm with:', { start, goal, rows, cols });

    const startNode = grid[start.y][start.x];
    const goalNode = grid[goal.y][goal.x];

    console.log('🐝 Start node:', startNode, 'Goal node:', goalNode);

    // Initialize all nodes
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const node = grid[row][col];
            node.distance = Infinity;
            node.visited = false;
            node.previous = null;
        }
    }

    startNode.distance = 0;
    const unvisited = [];

    // Add all nodes to unvisited set
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (!grid[row][col].wall) {
                unvisited.push(grid[row][col]);
            }
        }
    }

    let iterations = 0;
    while (unvisited.length > 0 && getSearchInProgress()) {
        iterations++;
        console.log(`🐝 Iteration ${iterations}, unvisited nodes: ${unvisited.length}`);

        // Find unvisited node with minimum distance
        unvisited.sort((a, b) => a.distance - b.distance);
        const current = unvisited.shift();

        console.log(`🐝 Current node: (${current.x}, ${current.y}), distance: ${current.distance}`);

        // If we can't reach any more nodes, break
        if (current.distance === Infinity) {
            console.log('🐝 No more reachable nodes, breaking');
            break;
        }

        // Mark as visited
        current.visited = true;

        // Visualize current node (where the bumblebee is exploring)
        ctx.fillStyle = BUMBLEBEE_COLORS.CURRENT;
        ctx.fillRect(current.x * cellSize, current.y * cellSize, cellSize, cellSize);

        // If we reached the goal, reconstruct path
        if (current.x === goalNode.x && current.y === goalNode.y) {
            const path = [];
            let pathNode = current;
            while (pathNode !== null) {
                path.unshift(pathNode);
                pathNode = pathNode.previous;
            }

            // Animate the path (bumblebee flying to the flower)
            for (let i = 0; i < path.length; i++) {
                if (!getSearchInProgress()) break;

                const node = path[i];

                // Draw path segment
                ctx.fillStyle = BUMBLEBEE_COLORS.PATH;
                ctx.fillRect(node.x * cellSize, node.y * cellSize, cellSize, cellSize);

                // Draw path head (current bumblebee position)
                if (i > 0) {
                    ctx.fillStyle = BUMBLEBEE_COLORS.PATH_HEAD;
                    ctx.fillRect(node.x * cellSize, node.y * cellSize, cellSize, cellSize);
                }

                await sleep(waitPath);
            }

            return { success: true, path: path };
        }

        // Check neighbors
        const neighbors = getNeighbors(current, grid, rows, cols);
        for (const neighbor of neighbors) {
            if (neighbor.visited) continue;

            const tentativeDistance = current.distance + 1;

            if (tentativeDistance < neighbor.distance) {
                neighbor.distance = tentativeDistance;
                neighbor.previous = current;

                // Visualize explored area (bumblebee's trail)
                if (neighbor.x !== goalNode.x || neighbor.y !== goalNode.y) {
                    ctx.fillStyle = BUMBLEBEE_COLORS.VISITED;
                    ctx.fillRect(neighbor.x * cellSize, neighbor.y * cellSize, cellSize, cellSize);
                }
            }
        }

        await sleep(waitSearch);
    }

    return { success: false, path: null };
};