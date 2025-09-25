// utils/pathfindingAlgorithms.js

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));



export const heuristic = (a, b) => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

export const getNeighbors = (node, grid, rows, cols) => {
    const { x, y } = node;
    const neighbors = [];

    // Check all 4 directions
    const directions = [
        { x: -1, y: 0 }, // Left
        { x: 1, y: 0 },  // Right
        { x: 0, y: -1 }, // Up
        { x: 0, y: 1 }   // Down
    ];

    for (const dir of directions) {
        const newX = x + dir.x;
        const newY = y + dir.y;

        // Check bounds and walls
        if (newX >= 0 && newX < cols && newY >= 0 && newY < rows && !grid[newY][newX].wall) {
            neighbors.push(grid[newY][newX]);
        }
    }

    return neighbors;
};

export const drawPathWithHead = async (cameFrom, current, ctx, lineColor, headColor, cellSize, waitTime, searchInProgress) => {
    const path = [];

    // Build path from goal to start
    while (cameFrom[`${current.x},${current.y}`]) {
        path.push(current);
        current = cameFrom[`${current.x},${current.y}`];
    }
    path.reverse(); // Reverse to get start to goal order

    // Animate the path
    for (let i = 0; i < path.length; i++) {
        if (!searchInProgress()) break; // Stop if search was cancelled

        const cell = path[i];

        // Clear previous head (if any)
        if (i > 0) {
            ctx.fillStyle = lineColor;
            const prevCell = path[i - 1];
            ctx.fillRect(prevCell.x * cellSize, prevCell.y * cellSize, cellSize, cellSize);
        }

        // Draw path cell
        ctx.fillStyle = lineColor;
        ctx.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);

        // Draw moving head circle
        ctx.beginPath();
        ctx.arc(
            cell.x * cellSize + cellSize / 2,
            cell.y * cellSize + cellSize / 2,
            cellSize / 2.5,
            0,
            2 * Math.PI
        );
        ctx.fillStyle = headColor;
        ctx.fill();

        await sleep(waitTime);
    }
};

export const animateAStar = async (
    grid,
    start,
    goal,
    rows,
    cols,
    ctx,
    cellSize,
    searchDelay,
    pathDelay,
    isSearchInProgress
) => {
    const openSet = [start];
    const cameFrom = {};
    const gScore = Array(rows).fill().map(() => Array(cols).fill(Infinity));
    gScore[start.y][start.x] = 0;
    const fScore = Array(rows).fill().map(() => Array(cols).fill(Infinity));
    fScore[start.y][start.x] = heuristic(start, goal);

    while (openSet.length > 0 && isSearchInProgress()) {
        // Sort openSet by f-score (lowest first)
        openSet.sort((a, b) => fScore[a.y][a.x] - fScore[b.y][b.x]);
        const current = openSet.shift();

        // Check if we reached the goal
        if (current.x === goal.x && current.y === goal.y) {
            await drawPathWithHead(
                cameFrom,
                current,
                ctx,
                "yellow",
                "orange",
                cellSize,
                pathDelay,
                isSearchInProgress
            );
            return { success: true, path: cameFrom };
        }

        // Visualize explored cell
        ctx.fillStyle = "lightyellow";
        ctx.fillRect(current.x * cellSize, current.y * cellSize, cellSize, cellSize);

        // Add border to show it's been explored
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2;
        ctx.strokeRect(current.x * cellSize + 1, current.y * cellSize + 1, cellSize - 2, cellSize - 2);
        ctx.lineWidth = 1;

        await sleep(searchDelay);

        // Check all neighbors
        for (const neighbor of getNeighbors(current, grid, rows, cols)) {
            const tentativeGScore = gScore[current.y][current.x] + 1;

            if (tentativeGScore < gScore[neighbor.y][neighbor.x]) {
                // This path to neighbor is better than any previous one
                cameFrom[`${neighbor.x},${neighbor.y}`] = current;
                gScore[neighbor.y][neighbor.x] = tentativeGScore;
                fScore[neighbor.y][neighbor.x] = tentativeGScore + heuristic(neighbor, goal);

                // Add neighbor to openSet if not already there
                if (!openSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                    openSet.push(neighbor);

                    // Visualize node in openSet (frontier)
                    ctx.fillStyle = "lightcyan";
                    ctx.fillRect(neighbor.x * cellSize, neighbor.y * cellSize, cellSize, cellSize);
                }
            }
        }
    }

    return { success: false, path: null };
};

export const animateDijkstra = async (
    grid,
    start,
    goal,
    rows,
    cols,
    ctx,
    cellSize,
    searchDelay,
    pathDelay,
    isSearchInProgress
) => {
    const openSet = [start];
    const cameFrom = {};
    const dist = Array(rows).fill().map(() => Array(cols).fill(Infinity));
    dist[start.y][start.x] = 0;

    while (openSet.length > 0 && isSearchInProgress()) {
        // Sort openSet by distance (lowest first)
        openSet.sort((a, b) => dist[a.y][a.x] - dist[b.y][b.x]);
        const current = openSet.shift();

        // Check if we reached the goal
        if (current.x === goal.x && current.y === goal.y) {
            await drawPathWithHead(
                cameFrom,
                current,
                ctx,
                "orange",
                "red",
                cellSize,
                pathDelay,
                isSearchInProgress
            );
            return { success: true, path: cameFrom };
        }

        // Visualize explored cell
        ctx.fillStyle = "lightcoral";
        ctx.fillRect(current.x * cellSize, current.y * cellSize, cellSize, cellSize);

        // Add border to show it's been explored
        ctx.strokeStyle = "#ff6b6b";
        ctx.lineWidth = 2;
        ctx.strokeRect(current.x * cellSize + 1, current.y * cellSize + 1, cellSize - 2, cellSize - 2);
        ctx.lineWidth = 1;

        await sleep(searchDelay);

        // Check all neighbors
        for (const neighbor of getNeighbors(current, grid, rows, cols)) {
            const newDist = dist[current.y][current.x] + 1;

            if (newDist < dist[neighbor.y][neighbor.x]) {
                // Found shorter path to neighbor
                cameFrom[`${neighbor.x},${neighbor.y}`] = current;
                dist[neighbor.y][neighbor.x] = newDist;

                // Add neighbor to openSet if not already there
                if (!openSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                    openSet.push(neighbor);

                    // Visualize node in openSet (frontier)
                    ctx.fillStyle = "mistyrose";
                    ctx.fillRect(neighbor.x * cellSize, neighbor.y * cellSize, cellSize, cellSize);
                }
            }
        }
    }

    return { success: false, path: null };
};