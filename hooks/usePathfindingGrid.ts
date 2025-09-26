import { useState, useEffect, useCallback, RefObject } from 'react';

// The Node interface should be defined here, not in the component.
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

const usePathfindingGrid = (canvasRef: RefObject<HTMLCanvasElement | null>) => {
    const [grid, setGrid] = useState<Node[][]>([]);
    const [startNode, setStartNode] = useState<Node | null>(null);
    const [goalNode, setGoalNode] = useState<Node | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const getGridDimensions = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return { rows: 20, cols: 30 }; // Default size
        const cellSize = 20;
        const rows = Math.floor(canvas.height / cellSize);
        const cols = Math.floor(canvas.width / cellSize);
        return { rows, cols };
    }, [canvasRef]);

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

    const initializeGrid = useCallback(() => {
        const { rows, cols } = getGridDimensions();
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
    }, [getGridDimensions]);

    useEffect(() => {
        const handler = setTimeout(() => {
            initializeGrid();
        }, 100);
        return () => clearTimeout(handler);
    }, [initializeGrid]);

    const clearWalls = () => {
        const newGrid = grid.map(row =>
            row.map(node => ({
                ...node,
                isWall: false,
            }))
        );
        setGrid(newGrid);
    };

    const generateRandomWalls = () => {
        const newGrid = grid.map(row =>
            row.map(node => {
                if (node.isStart || node.isGoal) return node;
                return {
                    ...node,
                    isWall: Math.random() < 0.25,
                };
            })
        );
        setGrid(newGrid);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const { col, row } = getMousePos(e);
        if (row < 0 || col < 0 || row >= grid.length || col >= grid[0].length) return;
        const node = grid[row][col];
        if (!node || node.isStart || node.isGoal) return;

        setIsDrawing(true);
        const newGrid = getNewGridWithWallToggled(grid, row, col);
        setGrid(newGrid);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const { col, row } = getMousePos(e);
        if (row < 0 || col < 0 || row >= grid.length || col >= grid[0].length) return;
        const node = grid[row][col];
        if (!node || node.isStart || node.isGoal) return;

        const newGrid = getNewGridWithWallToggled(grid, row, col);
        setGrid(newGrid);
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    const handleMouseLeave = () => {
        setIsDrawing(false);
    };

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { col: -1, row: -1 };
        const rect = canvas.getBoundingClientRect();
        const cellSize = 20;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor(x / cellSize);
        const row = Math.floor(y / cellSize);
        return { col, row };
    };

    const getNewGridWithWallToggled = (currentGrid: Node[][], row: number, col: number): Node[][] => {
        const newGrid = [...currentGrid];
        const node = newGrid[row][col];
        const newNode = {
            ...node,
            isWall: !node.isWall,
        };
        newGrid[row][col] = newNode;
        return newGrid;
    };

    const setNewGoalNode = (node: Node) => {
        const newGrid = [...grid];
        if (goalNode) {
            const oldGoal = newGrid[goalNode.y]?.[goalNode.x];
            if (oldGoal) oldGoal.isGoal = false;
        }
        const newGoal = newGrid[node.y][node.x];
        newGoal.isGoal = true;
        setGoalNode(newGoal);
        setGrid(newGrid);
    };


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

export default usePathfindingGrid;