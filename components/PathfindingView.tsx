"use client";

import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import Image from 'next/image';
import styles from '../app/Visuals/Djikstra/dijkstra.module.css';
import usePathfindingGrid, { Node } from '../hooks/usePathfindingGrid';
import { animateBumblebeeDijkstra, animateBumblebeeAStar } from '../utils/bumblebeeAlgorithm';

export type PathfindingHandle = {
    run: () => Promise<void> | void;
    stop: () => void;
    clearWalls: () => void;
    shuffleWalls: () => void;
    isSearching: () => boolean;
};

type GridState = {
    grid: Node[][];
    startNode: Node | null;
    goalNode: Node | null;
    setGoalNode: (node: Node) => void;
    handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    handleMouseUp: () => void;
    handleMouseLeave: () => void;
    clearWalls: () => void;
    generateRandomWalls: () => void;
};

type Props = {
    algo: 'Djikstra' | 'A';
    title?: string;
    compact?: boolean; // hide local controls if using central controls
    gridState?: GridState; // optional external grid state for synchronization
    externalCanvasSize?: { width: number; height: number }; // optional canvas size from parent
    onCanvasSizeReady?: (size: { width: number; height: number }) => void; // callback when canvas is sized
};

const PathfindingView = forwardRef<PathfindingHandle, Props>(({ algo, title, compact = false, gridState, externalCanvasSize, onCanvasSizeReady }, ref) => {
    const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 });
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isClient, setIsClient] = useState(false);

    // Use external gridState if provided, otherwise use the local hook
    const localGridState = usePathfindingGrid(canvasRef);
    const {
        grid,
        startNode,
        goalNode,
        setGoalNode,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleMouseLeave,
        clearWalls,
        generateRandomWalls,
    } = gridState || localGridState;

    const searchInProgressRef = useRef(false);
    const [searchStatus, setSearchStatus] = useState<{ success: boolean; path: Node[] | null } | null>(null);

    const getSearchInProgress = useCallback(() => searchInProgressRef.current, []);
    const setSearchInProgress = useCallback((value: boolean) => {
        searchInProgressRef.current = value;
    }, []);

    const beeImage = useRef<HTMLImageElement | null>(null);
    const flowerImage = useRef<HTMLImageElement | null>(null);

    const drawGrid = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !grid || grid.length === 0) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Use CSS pixel dimensions so drawing aligns with pointer coordinates
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        context.clearRect(0, 0, width, height);

        const cellSize = 20;
        // Use actual grid dimensions, not canvas-derived dimensions
        const rows = grid.length;
        const cols = grid[0]?.length || 0;

        context.strokeStyle = '#F0F0F0';
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                context.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
            }
        }

        grid.forEach((row: Node[]) => {
            row.forEach((node: Node) => {
                if (node.isWall) {
                    context.fillStyle = '#8D6E63';
                    context.fillRect(node.x * cellSize, node.y * cellSize, cellSize, cellSize);
                }
            });
        });

        if (beeImage.current && startNode) {
            context.drawImage(beeImage.current, startNode.x * cellSize, startNode.y * cellSize, cellSize, cellSize);
        }
        if (flowerImage.current && goalNode) {
            context.drawImage(flowerImage.current, goalNode.x * cellSize, goalNode.y * cellSize, cellSize, cellSize);
        }
    }, [grid, startNode, goalNode]);

    useEffect(() => {
        setIsClient(true);
        const bee = new window.Image();
        bee.src = '/bee.png';
        bee.onload = () => {
            beeImage.current = bee;
            drawGrid();
        };

        const flower = new window.Image();
        flower.src = '/flower.png';
        flower.onload = () => {
            flowerImage.current = flower;
            drawGrid();
        };
    }, [drawGrid]);

    useEffect(() => {
        const resizeCanvas = () => {
            if (externalCanvasSize) {
                setCanvasSize(externalCanvasSize);
                onCanvasSizeReady?.(externalCanvasSize);
            } else if (containerRef.current) {
                const size = Math.min(containerRef.current.offsetWidth, window.innerHeight * 0.8);
                setCanvasSize({ width: size, height: size });
                onCanvasSizeReady?.({ width: size, height: size });
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [externalCanvasSize, onCanvasSizeReady]);

    // Ensure the backing store (device pixels) and CSS size are in sync to avoid coordinate mismatch
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const { width, height } = canvasSize;
        // Set the backing store size (actual pixel buffer)
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        // Ensure CSS size matches logical size
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        // Redraw after resizing
        drawGrid();
    }, [canvasSize, drawGrid]);

    useEffect(() => {
        drawGrid();
    }, [grid, startNode, goalNode, canvasSize, drawGrid]);

    const run = useCallback(async () => {
        if (searchInProgressRef.current || !grid || !startNode || !goalNode) return;
        setSearchInProgress(true);
        setSearchStatus(null);

        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!canvas || !context) {
            setSearchInProgress(false);
            return;
        }

        drawGrid();

        if (algo === 'Djikstra') {
            const result = await animateBumblebeeDijkstra(
                grid,
                startNode,
                goalNode,
                context,
                20,
                getSearchInProgress,
                setSearchInProgress,
                drawGrid
            );
            setSearchStatus(result);
        } else {
            const result = await animateBumblebeeAStar(
                grid,
                startNode,
                goalNode,
                context,
                20,
                getSearchInProgress,
                setSearchInProgress,
                drawGrid
            );
            setSearchStatus(result);
        }
    }, [algo, grid, startNode, goalNode, drawGrid, getSearchInProgress, setSearchInProgress]);

    const stop = useCallback(() => {
        setSearchInProgress(false);
    }, [setSearchInProgress]);

    useImperativeHandle(ref, () => ({
        run,
        stop,
        clearWalls: () => clearWalls(),
        shuffleWalls: () => generateRandomWalls(),
        isSearching: () => searchInProgressRef.current,
    }), [run, stop, clearWalls, generateRandomWalls]);

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (searchInProgressRef.current) return;
        const canvas = canvasRef.current;
        if (!canvas || !grid) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const cellSize = 20;
        const col = Math.floor(x / cellSize);
        const row = Math.floor(y / cellSize);

        if (row < 0 || col < 0 || row >= grid.length || col >= grid[0].length) return;
        const clickedNode = grid[row][col];
        
        // Double-click to set goal
        if (event.detail === 2) {
            if (clickedNode && !clickedNode.isWall && !clickedNode.isStart) {
                setGoalNode(clickedNode);
            }
        }
    };

    if (!isClient) {
        return <div className={styles.loading}>Loading Grid...</div>;
    }

    return (
        <div className={styles.mainLayout} ref={containerRef}>
            <div className={styles.contentGrid} style={compact ? { gridTemplateColumns: '1fr' } : undefined}>
                <div className={styles.canvasSection}>
                    <canvas
                        ref={canvasRef}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        onClick={handleCanvasClick}
                        className={styles.canvas}
                    />
                </div>
                {!compact && (
                    <div className={styles.controlsSection}>
                        <header className={styles.header}>
                            <h1>{title ?? `Bumblebee Pathfinding (${algo === 'Djikstra' ? "Djikstra" : "A*"})`}</h1>
                        </header>
                        <div className={styles.controls}>
                            <button onClick={() => run()} disabled={searchInProgressRef.current}>
                                <Image src="/play icon.png" alt="Play" width={20} height={20} />
                                Find Path
                            </button>
                            <button onClick={() => stop()} disabled={!searchInProgressRef.current}>
                                <Image src="/stop icon.png" alt="Stop" width={20} height={20} />
                                Stop
                            </button>
                            <button onClick={() => clearWalls()} disabled={searchInProgressRef.current}>
                                Clear Walls
                            </button>
                            <button onClick={() => generateRandomWalls()} disabled={searchInProgressRef.current}>
                                <Image src="/shuffle icon.png" alt="Shuffle" width={20} height={20} />
                                Shuffle Walls
                            </button>
                        </div>
                        {searchStatus && (
                            <div className={styles.status}>
                                <p>
                                    {searchStatus.success
                                        ? '🐝 Bumblebee found the flower!'
                                        : '😢 Bumblebee could not find the flower.'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

PathfindingView.displayName = 'PathfindingView';

export default PathfindingView;
