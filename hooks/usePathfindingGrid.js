// hooks/usePathfindingGrid.js
import { useState, useCallback } from 'react';

const usePathfindingGrid = (rows, cols, start) => {
    const [grid, setGrid] = useState([]);
    const [goal, setGoal] = useState({ x: cols - 1, y: rows - 1 });
    const [wallDensity, setWallDensity] = useState(0.2);

    // Initialize grid with different patterns
    const initializeGrid = useCallback((pattern = 'random', density = wallDensity) => {
        const newGrid = [];

        // Create empty grid
        for (let y = 0; y < rows; y++) {
            const row = [];
            for (let x = 0; x < cols; x++) {
                row.push({
                    wall: false,
                    x,
                    y,
                    explored: false,
                    inPath: false,
                    gScore: Infinity,
                    fScore: Infinity,
                    distance: Infinity
                });
            }
            newGrid.push(row);
        }

        // Apply different patterns
        switch (pattern) {
            case 'random':
                for (let y = 0; y < rows; y++) {
                    for (let x = 0; x < cols; x++) {
                        newGrid[y][x].wall = Math.random() < density;
                    }
                }
                break;

            case 'maze':
                // Create maze-like pattern with corridors
                for (let y = 1; y < rows - 1; y += 2) {
                    for (let x = 1; x < cols - 1; x += 2) {
                        // Create chambers
                        newGrid[y][x].wall = false;

                        // Randomly connect chambers
                        if (Math.random() < 0.5 && x + 2 < cols) {
                            newGrid[y][x + 1].wall = false; // Right
                        }
                        if (Math.random() < 0.5 && y + 2 < rows) {
                            newGrid[y + 1][x].wall = false; // Down
                        }
                    }
                }
                // Fill the rest with walls
                for (let y = 0; y < rows; y++) {
                    for (let x = 0; x < cols; x++) {
                        if (newGrid[y][x].wall === undefined) {
                            newGrid[y][x].wall = true;
                        }
                    }
                }
                break;

            case 'vertical':
                // Vertical corridors
                for (let x = 2; x < cols; x += 3) {
                    for (let y = 0; y < rows; y++) {
                        if (Math.random() > 0.3) { // 70% wall chance
                            newGrid[y][x].wall = true;
                        }
                    }
                }
                break;

            case 'horizontal':
                // Horizontal corridors
                for (let y = 2; y < rows; y += 3) {
                    for (let x = 0; x < cols; x++) {
                        if (Math.random() > 0.3) { // 70% wall chance
                            newGrid[y][x].wall = true;
                        }
                    }
                }
                break;

            case 'diagonal':
                // Diagonal walls
                for (let y = 0; y < rows; y++) {
                    for (let x = 0; x < cols; x++) {
                        if ((x + y) % 3 === 0 && Math.random() < 0.7) {
                            newGrid[y][x].wall = true;
                        }
                    }
                }
                break;

            case 'border':
                // Border walls with openings
                for (let y = 0; y < rows; y++) {
                    for (let x = 0; x < cols; x++) {
                        if (x === 0 || x === cols - 1 || y === 0 || y === rows - 1) {
                            if (Math.random() > 0.2) { // 80% wall chance on borders
                                newGrid[y][x].wall = true;
                            }
                        }
                    }
                }
                break;

            case 'empty':
                // All cells are empty (already initialized as false)
                break;

            case 'filled':
                // Fill all with walls
                for (let y = 0; y < rows; y++) {
                    for (let x = 0; x < cols; x++) {
                        newGrid[y][x].wall = true;
                    }
                }
                break;
        }

        // Randomize goal location for random pattern
        let newGoal = { x: cols - 1, y: rows - 1 }; // Default goal
        if (pattern === 'random') {
            let goalPlaced = false;
            let attempts = 0;
            while (!goalPlaced && attempts < 100) {
                const randomX = Math.floor(Math.random() * cols);
                const randomY = Math.floor(Math.random() * rows);
                if ((randomX !== start.x || randomY !== start.y) && !newGrid[randomY][randomX].wall) {
                    newGoal = { x: randomX, y: randomY };
                    goalPlaced = true;
                }
                attempts++;
            }
            // Fallback to bottom-right if no valid position found
            if (!goalPlaced) {
                newGoal = { x: cols - 1, y: rows - 1 };
            }
        }

        // Ensure start and goal are always passable
        newGrid[start.y][start.x].wall = false;
        newGrid[newGoal.y][newGoal.x].wall = false;

        // Clear any previous algorithm data
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                newGrid[y][x].explored = false;
                newGrid[y][x].inPath = false;
                newGrid[y][x].gScore = Infinity;
                newGrid[y][x].fScore = Infinity;
                newGrid[y][x].distance = Infinity;
            }
        }

        setGrid(newGrid);
        if (pattern === 'random') {
            setGoal(newGoal);
        }
    }, [rows, cols, start, wallDensity]);

    // Toggle wall at specific position
    const toggleWall = useCallback((x, y) => {
        if (x < 0 || x >= cols || y < 0 || y >= rows) return;
        if ((x === start.x && y === start.y) || (x === goal.x && y === goal.y)) return;

        setGrid(prevGrid => {
            const newGrid = prevGrid.map(row => [...row]);
            newGrid[y][x].wall = !newGrid[y][x].wall;
            return newGrid;
        });
    }, [cols, rows, start, goal]);

    // Set wall at specific position
    const setWall = useCallback((x, y, isWall) => {
        if (x < 0 || x >= cols || y < 0 || y >= rows) return;
        if ((x === start.x && y === start.y) || (x === goal.x && y === goal.y)) return;

        setGrid(prevGrid => {
            const newGrid = prevGrid.map(row => [...row]);
            newGrid[y][x].wall = isWall;
            return newGrid;
        });
    }, [cols, rows, start, goal]);

    // Clear all walls
    const clearAllWalls = useCallback(() => {
        setGrid(prevGrid =>
            prevGrid.map(row =>
                row.map(cell => ({
                    ...cell,
                    wall: false,
                    explored: false,
                    inPath: false,
                    gScore: Infinity,
                    fScore: Infinity,
                    distance: Infinity
                }))
            )
        );
    }, []);

    // Fill all with walls (except start and goal)
    const fillAllWalls = useCallback(() => {
        setGrid(prevGrid =>
            prevGrid.map(row =>
                row.map(cell => {
                    const isStartOrGoal = (cell.x === start.x && cell.y === start.y) ||
                        (cell.x === goal.x && cell.y === goal.y);
                    return {
                        ...cell,
                        wall: !isStartOrGoal,
                        explored: false,
                        inPath: false,
                        gScore: Infinity,
                        fScore: Infinity,
                        distance: Infinity
                    };
                })
            )
        );
    }, [start, goal]);

    // Update goal position
    const updateGoal = useCallback((newGoal) => {
        if (newGoal.x >= 0 && newGoal.x < cols &&
            newGoal.y >= 0 && newGoal.y < rows &&
            !grid[newGoal.y] && !grid[newGoal.y][newGoal.x].wall &&
            (newGoal.x !== start.x || newGoal.y !== start.y)) {
            setGoal(newGoal);
        }
    }, [cols, rows, grid, start]);

    // Reset algorithm visualization data
    const resetVisualization = useCallback(() => {
        setGrid(prevGrid =>
            prevGrid.map(row =>
                row.map(cell => ({
                    ...cell,
                    explored: false,
                    inPath: false,
                    gScore: Infinity,
                    fScore: Infinity,
                    distance: Infinity
                }))
            )
        );
    }, []);

    // Get statistics about the grid
    const getGridStats = useCallback(() => {
        let wallCount = 0;
        let emptyCount = 0;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (grid[y] && grid[y][x]) {
                    if (grid[y][x].wall) {
                        wallCount++;
                    } else {
                        emptyCount++;
                    }
                }
            }
        }

        return {
            wallCount,
            emptyCount,
            totalCells: rows * cols,
            wallPercentage: Math.round((wallCount / (rows * cols)) * 100),
            emptyPercentage: Math.round((emptyCount / (rows * cols)) * 100)
        };
    }, [grid, rows, cols]);

    return {
        grid,
        goal,
        wallDensity,
        setWallDensity,
        initializeGrid,
        toggleWall,
        setWall,
        clearAllWalls,
        fillAllWalls,
        updateGoal,
        resetVisualization,
        getGridStats
    };
};

export default usePathfindingGrid;