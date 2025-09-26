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
export const animateBumblebeeDijkstra = async (grid, start, goal, ctx, cellSize, getSearchInProgress, setSearchInProgress, drawGrid) => {
    console.log('🐝 Starting bumblebee algorithm with:', { start, goal });

    if (!grid || grid.length === 0 || !start || !goal) {
        console.error("Grid, start, or goal is not initialized.");
        setSearchInProgress(false);
        return { success: false, path: null };
    }

    // Reset the grid visualization before starting
    drawGrid();

    const rows = grid.length;
    const cols = grid[0].length;
    const startNode = grid[start.y][start.x];
    const goalNode = grid[goal.y][goal.x];

    console.log('🐝 Start node:', startNode, 'Goal node:', goalNode);

    // Reset grid properties for a new search
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            grid[row][col].distance = Infinity;
            grid[row][col].isVisited = false;
            grid[row][col].previousNode = null;
        }
    }

    startNode.distance = 0;
    const unvisitedNodes = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            unvisitedNodes.push(grid[row][col]);
        }
    }

    while (unvisitedNodes.length > 0) {
        if (!getSearchInProgress()) {
            console.log("🛑 Search stopped by user.");
            return { success: false, path: null };
        }

        unvisitedNodes.sort((a, b) => a.distance - b.distance);
        const closestNode = unvisitedNodes.shift();

        if (closestNode.isWall) continue;

        if (closestNode.distance === Infinity) {
            console.log('🐝 No more reachable nodes, breaking.');
            setSearchInProgress(false);
            return { success: false, path: null };
        }

        closestNode.isVisited = true;
        if (closestNode !== startNode && closestNode !== goalNode) {
            ctx.fillStyle = BUMBLEBEE_COLORS.VISITED;
            ctx.fillRect(closestNode.x * cellSize, closestNode.y * cellSize, cellSize, cellSize);
        }

        if (closestNode === goalNode) {
            console.log("✅ Path found!");
            const path = [];
            let currentNode = goalNode;
            while (currentNode !== null) {
                path.unshift(currentNode);
                currentNode = currentNode.previousNode;
            }

            // Animate final path
            for (let i = 0; i < path.length; i++) {
                const node = path[i];
                ctx.fillStyle = BUMBLEBEE_COLORS.PATH;
                ctx.fillRect(node.x * cellSize, node.y * cellSize, cellSize, cellSize);
                await sleep(40);
            }

            // Redraw start and goal to be on top
            drawGrid();

            setSearchInProgress(false);
            return { success: true, path };
        }

        const neighbors = getNeighbors(closestNode, grid, rows, cols);
        for (const neighbor of neighbors) {
            if (!neighbor.isVisited) {
                const distance = closestNode.distance + 1;
                if (distance < neighbor.distance) {
                    neighbor.distance = distance;
                    neighbor.previousNode = closestNode;
                }
            }
        }
        await sleep(5); // Small delay for visualization
    }

    console.log("😢 No path found.");
    setSearchInProgress(false);
    return { success: false, path: null };
};

// Heuristic function for A* (Manhattan distance)
const heuristic = (nodeA, nodeB) => {
    return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
};

// Bumblebee-themed A* algorithm
export const animateBumblebeeAStar = async (grid, start, goal, ctx, cellSize, getSearchInProgress, setSearchInProgress, drawGrid) => {
    console.log('🐝 Starting A* bumblebee algorithm with:', { start, goal });

    if (!grid || grid.length === 0 || !start || !goal) {
        console.error("Grid, start, or goal is not initialized.");
        setSearchInProgress(false);
        return { success: false, path: null };
    }

    drawGrid();

    const rows = grid.length;
    const cols = grid[0].length;
    const startNode = grid[start.y][start.x];
    const goalNode = grid[goal.y][goal.x];

    // Reset grid properties
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const node = grid[row][col];
            node.gScore = Infinity;
            node.fScore = Infinity;
            node.isVisited = false;
            node.previousNode = null;
        }
    }

    startNode.gScore = 0;
    startNode.fScore = heuristic(startNode, goalNode);

    const openSet = [startNode];

    while (openSet.length > 0) {
        if (!getSearchInProgress()) {
            console.log("🛑 Search stopped by user.");
            return { success: false, path: null };
        }

        // Find node with the lowest fScore
        openSet.sort((a, b) => a.fScore - b.fScore);
        const currentNode = openSet.shift();

        if (currentNode.isWall) continue;

        if (currentNode === goalNode) {
            console.log("✅ Path found with A*!");
            const path = [];
            let temp = currentNode;
            while (temp !== null) {
                path.unshift(temp);
                temp = temp.previousNode;
            }

            // Animate path
            for (const node of path) {
                ctx.fillStyle = BUMBLEBEE_COLORS.PATH;
                ctx.fillRect(node.x * cellSize, node.y * cellSize, cellSize, cellSize);
                await sleep(40);
            }

            drawGrid(); // Redraw to put bee/flower on top
            setSearchInProgress(false);
            return { success: true, path };
        }

        currentNode.isVisited = true;
        if (currentNode !== startNode) {
            ctx.fillStyle = BUMBLEBEE_COLORS.VISITED;
            ctx.fillRect(currentNode.x * cellSize, currentNode.y * cellSize, cellSize, cellSize);
        }

        const neighbors = getNeighbors(currentNode, grid, rows, cols);
        for (const neighbor of neighbors) {
            if (neighbor.isVisited || neighbor.isWall) {
                continue;
            }

            const tentativeGScore = currentNode.gScore + 1;

            if (tentativeGScore < neighbor.gScore) {
                neighbor.previousNode = currentNode;
                neighbor.gScore = tentativeGScore;
                neighbor.fScore = neighbor.gScore + heuristic(neighbor, goalNode);

                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                }
            }
        }
        await sleep(5);
    }

    console.log("😢 No path found with A*.");
    setSearchInProgress(false);
    return { success: false, path: null };
};