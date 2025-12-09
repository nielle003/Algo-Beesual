import { useState, useEffect, useCallback, useRef } from 'react';

export interface Node {
    x: number;
    y: number;
    isWall: boolean;
    isStart: boolean;
    isGoal: boolean;
    distance: number;
    isVisited: boolean;
    previousNode: Node | null;
}

/**
 * Hook that manages a shared grid state that can be passed to multiple PathfindingView instances.
 * This allows synchronized maze editing across multiple instances.
 * 
 * @param dimensions - optional { rows, cols } to explicitly control grid size. If provided, grid initializes immediately.
 */
/**
 * Hook that manages a shared grid state that can be passed to multiple PathfindingView instances.
 * This allows synchronized maze editing across multiple instances.
 * 
 * @param canvasRef - ref to the canvas element for coordinate calculations
 * @param dimensions - optional { rows, cols } to explicitly control grid size. If provided, grid initializes immediately.
 */

const useSharedPathfindingGrid = (dimensions?: { rows: number; cols: number }) => {
    const [grid, setGrid] = useState<Node[][]>([]);
    const [startNode, setStartNode] = useState<Node | null>(null);
    const [goalNode, setGoalNode] = useState<Node | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const drawModeRef = useRef<null | boolean>(null);

    const createNode = (col: number, row: number): Node => ({
        x: col,
        y: row,
        isWall: false,
        isStart: false,
        isGoal: false,
        distance: Infinity,
        isVisited: false,
        previousNode: null,
    });

    const initializeGrid = useCallback((rows: number, cols: number) => {
        console.debug('[sharedGrid] initializeGrid', { rows, cols });
        const newGrid: Node[][] = [];
        for (let row = 0; row < rows; row++) {
            const currentRow: Node[] = [];
            for (let col = 0; col < cols; col++) {
                currentRow.push(createNode(col, row));
            }
            newGrid.push(currentRow);
        }

        if (rows > 0 && cols > 0) {
            const start = { x: Math.floor(cols / 4), y: Math.floor(rows / 2) };
            const goal = { x: Math.floor((3 * cols) / 4), y: Math.floor(rows / 2) };

            if (newGrid[start.y] && newGrid[start.y][start.x]) {
                const startCell = newGrid[start.y][start.x];
                startCell.isStart = true;
                setStartNode(startCell);
            }
            if (newGrid[goal.y] && newGrid[goal.y][goal.x]) {
                const goalCell = newGrid[goal.y][goal.x];
                goalCell.isGoal = true;
                setGoalNode(goalCell);
            }
        }

        setGrid(newGrid);
    }, []);

    // Initialize grid when dimensions are provided
    useEffect(() => {
        if (dimensions && dimensions.rows > 0 && dimensions.cols > 0) {
            initializeGrid(dimensions.rows, dimensions.cols);
        }
    }, [dimensions, initializeGrid]);

    const clearWalls = useCallback(() => {
        console.debug('[sharedGrid] clearWalls');
        setGrid(prevGrid =>
            prevGrid.map(row =>
                row.map(node => ({
                    ...node,
                    isWall: false,
                }))
            )
        );
    }, []);

    const generateRandomWalls = useCallback(() => {
        console.debug('[sharedGrid] generateRandomWalls');
        setGrid(prevGrid =>
            prevGrid.map(row =>
                row.map(node => {
                    if (node.isStart || node.isGoal) return node;
                    return {
                        ...node,
                        isWall: Math.random() < 0.25,
                    };
                })
            )
        );
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const { col, row } = getMousePos(e);
        console.debug('[sharedGrid] mouseDown', { row, col });
        if (row < 0 || col < 0 || row >= grid.length || col >= (grid[0]?.length ?? 0)) return;
        const node = grid[row]?.[col];
        if (!node || node.isStart || node.isGoal) return;

        // Determine draw mode: true means set wall, false means clear wall
        const mode = !node.isWall;
        drawModeRef.current = mode;
        setIsDrawing(true);
        // set cell to draw mode
        setGrid(prevGrid => prevGrid.map((r, ri) => r.map((n, ci) => (ri === row && ci === col ? { ...n, isWall: mode } : n))));
    }, [grid]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const { col, row } = getMousePos(e);
        console.debug('[sharedGrid] mouseMove', { row, col });
        if (row < 0 || col < 0 || row >= grid.length || col >= (grid[0]?.length ?? 0)) return;
        const node = grid[row]?.[col];
        if (!node || node.isStart || node.isGoal) return;
        const mode = drawModeRef.current;
        if (mode === null) return;
        // only update if value differs to reduce rerenders
        if (node.isWall === mode) return;
        setGrid(prevGrid => prevGrid.map((r, ri) => r.map((n, ci) => (ri === row && ci === col ? { ...n, isWall: mode } : n))));
    }, [grid, isDrawing]);

    const handleMouseUp = useCallback(() => {
        setIsDrawing(false);
        drawModeRef.current = null;
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsDrawing(false);
        drawModeRef.current = null;
    }, []);

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = e.currentTarget as HTMLCanvasElement;
        if (!canvas) return { col: -1, row: -1 };
        const rect = canvas.getBoundingClientRect();
        const cellSize = 20;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor(x / cellSize);
        const row = Math.floor(y / cellSize);
        return { col, row };
    };

    const toggleWall = useCallback((row: number, col: number) => {
        console.debug('[sharedGrid] toggleWall request', { row, col });
        setGrid(prevGrid => {
            if (!prevGrid[row] || !prevGrid[row][col]) return prevGrid;
            const updated = prevGrid.map((r, ri) =>
                r.map((n, ci) => (ri === row && ci === col ? { ...n, isWall: !n.isWall } : n))
            );
            console.debug('[sharedGrid] toggled wall -> new value', { row, col, isWall: !prevGrid[row][col].isWall });
            return updated;
        });
    }, []);

    const setNewGoalNode = useCallback((node: Node) => {
        console.debug('[sharedGrid] setNewGoalNode', node);
        setGrid(prevGrid => {
            return prevGrid.map((r, ri) =>
                r.map((n, ci) => {
                    if (n.isStart) return { ...n, isGoal: false };
                    if (ri === node.y && ci === node.x) return { ...n, isGoal: true };
                    // clear previous goal
                    if (goalNode && ri === goalNode.y && ci === goalNode.x) return { ...n, isGoal: false };
                    return n;
                })
            );
        });
        setGoalNode(node);
    }, [goalNode]);

    return {
        grid,
        startNode,
        goalNode,
        setGoalNode: setNewGoalNode,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleMouseLeave,
        clearWalls,
        generateRandomWalls,
    };
};

export default useSharedPathfindingGrid;
