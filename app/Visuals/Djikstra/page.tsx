"use client";

import React from 'react'
import { useRef, useEffect, useCallback, useState } from 'react';
import Head from 'next/head';

import usePathfindingGrid from '@/hooks/usePathfindingGrid';
import { animateBumblebeeDijkstra } from '@/utils/bumblebeeAlgorithm';
import styles from './dijkstra.module.css';

const ROWS = 10;
const COLS = 10;
const CELL_SIZE = 40;
const WAIT_SECONDS_SEARCH = 100;
const WAIT_SECONDS_PATH = 200;
const START = { x: 0, y: 0 };

const BumblebeePathfinding = () => {
    // Use custom hook for grid management
    const {
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

        getGridStats
    } = usePathfindingGrid(ROWS, COLS, START);

    // Component state
    const [searchInProgress, setSearchInProgress] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [draggingGoal, setDraggingGoal] = useState(false);
    const [drawingMode, setDrawingMode] = useState('toggle');
    const [isDrawing, setIsDrawing] = useState(false);
    const [showStats, setShowStats] = useState(false);

    // Canvas ref - only need one for Dijkstra
    const dijkstraCanvasRef = useRef<HTMLCanvasElement>(null);
    // Ref to track search status for algorithm
    const searchInProgressRef = useRef(false);

    // Draw grid function with bumblebee theme - respects algorithm visualization
    const drawGrid = useCallback(() => {
        const dijkstraCtx = dijkstraCanvasRef.current?.getContext('2d');

        if (!dijkstraCtx || !grid.length || !dijkstraCanvasRef.current) return;

        // Clear canvas
        dijkstraCtx.clearRect(0, 0, dijkstraCanvasRef.current.width, dijkstraCanvasRef.current.height);

        // Draw each cell with bumblebee theme
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const row of grid as any[]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const cell of row as any) {
                let fillStyle = "#FFF9C4"; // Light honey color for empty cells

                // Determine cell color based on bumblebee theme and algorithm state
                if (cell.wall) {
                    fillStyle = "#8D6E63"; // Brown for hive walls
                } else if (cell.x === START.x && cell.y === START.y) {
                    fillStyle = "#FFD54F"; // Golden yellow for start (bumblebee home)
                } else if (cell.x === goal.x && cell.y === goal.y) {
                    fillStyle = "#FF8A65"; // Flower color for goal
                }

                // Fill cell background
                dijkstraCtx.fillStyle = fillStyle;
                dijkstraCtx.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

                // Draw cell borders with honey-like color
                dijkstraCtx.strokeStyle = "#FFB74D";
                dijkstraCtx.lineWidth = 2;
                dijkstraCtx.strokeRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

                // Add cute bumblebee and flower emojis
                if (cell.x === START.x && cell.y === START.y) {
                    // Draw bumblebee emoji for start
                    dijkstraCtx.fillStyle = "black";
                    dijkstraCtx.font = "bold 20px Arial";
                    dijkstraCtx.textAlign = "center";
                    dijkstraCtx.fillText("🐝", cell.x * CELL_SIZE + CELL_SIZE / 2, cell.y * CELL_SIZE + CELL_SIZE / 2 + 7);
                } else if (cell.x === goal.x && cell.y === goal.y) {
                    // Draw flower emoji for goal
                    dijkstraCtx.fillStyle = "black";
                    dijkstraCtx.font = "bold 20px Arial";
                    dijkstraCtx.textAlign = "center";
                    dijkstraCtx.fillText("🌻", cell.x * CELL_SIZE + CELL_SIZE / 2, cell.y * CELL_SIZE + CELL_SIZE / 2 + 7);
                }
            }
        }
    }, [grid, goal]);

    // Enhanced canvas interaction
    const handleCanvasInteraction = useCallback((event: React.MouseEvent<HTMLCanvasElement>, canvasRef: React.RefObject<HTMLCanvasElement | null>, eventType: string) => {
        if (searchInProgress) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / CELL_SIZE);
        const y = Math.floor((event.clientY - rect.top) / CELL_SIZE);

        // Check bounds
        if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return;

        // Handle goal dragging
        if (eventType === 'mousedown' && x === goal.x && y === goal.y) {
            setDraggingGoal(true);
            return;
        }

        if (eventType === 'mousemove' && draggingGoal) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!(grid as any)[y][x].wall && (x !== START.x || y !== START.y)) {
                updateGoal({ x, y });
            }
            return;
        }

        if (eventType === 'mouseup') {
            setDraggingGoal(false);
            setIsDrawing(false);
            return;
        }

        // Prevent modifying start or goal cells
        if ((x === START.x && y === START.y) || (x === goal.x && y === goal.y)) return;

        // Handle wall modification based on drawing mode
        if (eventType === 'mousedown') {
            setIsDrawing(true);
        }

        if ((eventType === 'click') ||
            (eventType === 'mousemove' && isDrawing) ||
            (eventType === 'mousedown')) {

            switch (drawingMode) {
                case 'toggle':
                    if (eventType === 'click') {
                        toggleWall(x, y);
                    }
                    break;
                case 'paint':
                    setWall(x, y, true);
                    break;
                case 'erase':
                    setWall(x, y, false);
                    break;
            }
        }
    }, [searchInProgress, goal, draggingGoal, drawingMode, isDrawing, grid, toggleWall, setWall, updateGoal]);

    // Run Dijkstra algorithm
    const runBumblebeePathfinding = async () => {
        setSearchInProgress(true);
        searchInProgressRef.current = true;
        setShowWarning(true);

        const dijkstraCtx = dijkstraCanvasRef.current?.getContext('2d');

        if (!dijkstraCtx) {
            setSearchInProgress(false);
            searchInProgressRef.current = false;
            setShowWarning(false);
            return;
        }

        try {
            // Run bumblebee-themed Dijkstra algorithm
            const dijkstraResult = await animateBumblebeeDijkstra(
                grid,
                START,
                goal,
                ROWS,
                COLS,
                dijkstraCtx,
                CELL_SIZE,
                WAIT_SECONDS_SEARCH,
                WAIT_SECONDS_PATH,
                () => searchInProgressRef.current
            );

            console.log('🐝 Bumblebee found the flower! Dijkstra Result:', dijkstraResult);

        } catch (error) {
            console.error('🐝 Bumblebee got lost! Error:', error);
        } finally {
            setSearchInProgress(false);
            searchInProgressRef.current = false;
            setShowWarning(false);
            // Redraw clean grid after algorithm completes
            setTimeout(() => drawGrid(), 100);
        }
    };

    // Stop searching
    const stopSearching = () => {
        setSearchInProgress(false);
        searchInProgressRef.current = false;
        setShowWarning(false);
        drawGrid();
    };

    // Initialize grid on component mount
    useEffect(() => {
        initializeGrid();
    }, [initializeGrid]);

    // Redraw grid when state changes
    useEffect(() => {
        drawGrid();
    }, [drawGrid]);

    // Grid statistics
    const gridStats = getGridStats();

    return (
        <>
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4">
                <Head>
                    <title>🐝 Bumblebee Pathfinding - Dijkstra Algorithm</title>
                    <meta name="description" content="Help the cute bumblebee find flowers using Dijkstra's pathfinding algorithm!" />
                </Head>

                <div className={styles.container}>

                    <h1 className={styles.title}>🐝 Bumblebee&apos;s Flower Quest</h1>
                    <p className={styles.subtitle}>Watch our cute bumblebee find the sweetest flowers using Dijkstra&apos;s algorithm! 🌻</p>

                    {/* Enhanced Controls */}
                    <div className={styles.controls}>
                        <div className={styles.controlSection}>
                            <h3>� Garden Layouts</h3>
                            <div className={styles.buttonGrid}>
                                <button onClick={() => initializeGrid('random')} title="Random hive walls">
                                    🎲 Wild Garden
                                </button>
                                <button onClick={() => initializeGrid('empty')} title="Empty meadow">
                                    🌾 Open Meadow
                                </button>
                                <button onClick={() => initializeGrid('maze')} title="Flower maze">
                                    � Flower Maze
                                </button>
                                <button onClick={() => initializeGrid('vertical')} title="Vertical flower rows">
                                    🌷 Flower Rows
                                </button>
                                <button onClick={() => initializeGrid('horizontal')} title="Horizontal garden beds">
                                    🌻 Garden Beds
                                </button>
                                <button onClick={() => initializeGrid('diagonal')} title="Diagonal paths">
                                    ⚡ Zigzag Path
                                </button>
                                <button onClick={() => initializeGrid('border')} title="Garden border">
                                    � Garden Fence
                                </button>
                            </div>
                        </div>                        <div className="control-section">
                            <h3>🏠 Garden Settings</h3>
                            <div className="setting-item">
                                <label>
                                    Hive Wall Density: <strong>{Math.round(wallDensity * 100)}%</strong>
                                    <input
                                        type="range"
                                        min="0"
                                        max="0.6"
                                        step="0.05"
                                        value={wallDensity}
                                        onChange={(e) => setWallDensity(parseFloat(e.target.value))}
                                    />
                                </label>
                            </div>
                            <div className="setting-item">
                                <label>
                                    Drawing Mode:
                                    <select
                                        value={drawingMode}
                                        onChange={(e) => setDrawingMode(e.target.value)}
                                    >
                                        <option value="toggle">🖱️ Click Toggle</option>
                                        <option value="paint">🖌️ Build Hive (Drag)</option>
                                        <option value="erase">🧽 Clear Path (Drag)</option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        <div className="control-section">
                            <h3>🎯 Garden Tools</h3>
                            <div className="button-group">
                                <button onClick={clearAllWalls} title="Remove all hive walls">
                                    🧹 Clear Garden
                                </button>
                                <button onClick={fillAllWalls} title="Fill with hive walls">
                                    🏠 Build Hive
                                </button>
                                <button onClick={() => setShowStats(!showStats)} title="Show grid statistics">
                                    📊 {showStats ? 'Hide' : 'Show'} Stats
                                </button>
                            </div>
                            <button
                                onClick={runBumblebeePathfinding}
                                disabled={searchInProgress}
                                className={`run-button ${searchInProgress ? 'running' : ''}`}
                            >
                                {searchInProgress ? '🐝 Buzzing...' : '🐝 Start Flower Hunt!'}
                            </button>
                        </div>
                    </div>

                    {/* Grid Statistics */}
                    {showStats && (
                        <div className="stats-panel">
                            <h4>📊 Grid Statistics</h4>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-label">Total Cells:</span>
                                    <span className="stat-value">{gridStats.totalCells}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Walls:</span>
                                    <span className="stat-value">{gridStats.wallCount} ({gridStats.wallPercentage}%)</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Empty:</span>
                                    <span className="stat-value">{gridStats.emptyCount} ({gridStats.emptyPercentage}%)</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Goal Distance:</span>
                                    <span className="stat-value">{Math.abs(goal.x - START.x) + Math.abs(goal.y - START.y)} cells</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {searchInProgress && (
                        <button onClick={stopSearching} className="stop-button">
                            ⏹️ Stop Search
                        </button>
                    )}

                    {showWarning && (
                        <div className="warning">
                            � <strong>Bumblebee is searching for flowers...</strong> Watch the little bee buzz around the garden!
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="instructions">
                        <h4>� How to Help the Bumblebee:</h4>
                        <div className="instruction-grid">
                            <div className="instruction-item">
                                <strong>🎲 Generate:</strong> Try different grid patterns
                            </div>
                            <div className="instruction-item">
                                <strong>🖱️ Build Garden:</strong> Click/drag to place walls
                            </div>
                            <div className="instruction-item">
                                <strong>� Move Flower:</strong> Drag the flower to relocate it
                            </div>
                            <div className="instruction-item">
                                <strong>🐝 Watch Magic:</strong> See how the bumblebee finds the shortest path!
                            </div>
                        </div>
                    </div>

                    {/* Grid Display - Single Dijkstra Canvas */}
                    <div className="grids" style={{ justifyContent: 'center' }}>
                        <div className="canvas-container">
                            <h3>� Bumblebee&apos;s Journey</h3>
                            <p className="algorithm-description">Using Dijkstra&apos;s algorithm to find the sweetest path to flowers! 🌻</p>
                            <canvas
                                ref={dijkstraCanvasRef}
                                width={400}
                                height={400}
                                onClick={(e) => handleCanvasInteraction(e, dijkstraCanvasRef, 'click')}
                                onMouseDown={(e) => handleCanvasInteraction(e, dijkstraCanvasRef, 'mousedown')}
                                onMouseMove={(e) => handleCanvasInteraction(e, dijkstraCanvasRef, 'mousemove')}
                                onMouseUp={(e) => handleCanvasInteraction(e, dijkstraCanvasRef, 'mouseup')}
                                onMouseLeave={(e) => handleCanvasInteraction(e, dijkstraCanvasRef, 'mouseup')}
                                className="pathfinding-canvas"
                            />
                            <div className="canvas-legend">
                                <span className="legend-item start">🐝 Bumblebee Home</span>
                                <span className="legend-item goal">🌻 Sweet Flower</span>
                                <span className="legend-item wall">🏠 Hive Walls</span>
                                <span className="legend-item explored">🍯 Explored</span>
                                <span className="legend-item path">✨ Bee Path</span>
                                <span className="legend-item mode">Mode: {drawingMode}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BumblebeePathfinding;