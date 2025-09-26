"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from './dijkstra.module.css';
import usePathfindingGrid, { Node } from '../../../hooks/usePathfindingGrid';
import { animateBumblebeeDijkstra } from '../../../utils/bumblebeeAlgorithm';

const BumblebeePathfinding = () => {
    const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

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
    } = usePathfindingGrid(canvasRef);

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

        const { width, height } = canvas;
        context.clearRect(0, 0, width, height);

        const cellSize = 20;
        const rows = Math.floor(height / cellSize);
        const cols = Math.floor(width / cellSize);

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
            if (containerRef.current) {
                const size = Math.min(containerRef.current.offsetWidth, window.innerHeight * 0.8);
                setCanvasSize({ width: size, height: size });
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    useEffect(() => {
        drawGrid();
    }, [grid, startNode, goalNode, canvasSize, drawGrid]);

    const runBumblebeePathfinding = async () => {
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

        const result = await animateBumblebeeDijkstra(
            grid,
            startNode,
            goalNode,
            context,
            20, // cellSize
            getSearchInProgress,
            setSearchInProgress,
            drawGrid
        );
        setSearchStatus(result);
        setSearchInProgress(false);
    };

    const stopSearch = () => {
        setSearchInProgress(false);
    };

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
        if (clickedNode && !clickedNode.isWall && !clickedNode.isStart) {
            setGoalNode(clickedNode);
        }
    };

    if (!isClient) {
        return <div className={styles.loading}>Loading Bumblebee Grid...</div>;
    }

    return (
        <div className={styles.mainLayout}>
            <div className={styles.contentGrid}>
                <div ref={containerRef} className={styles.canvasSection}>
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
                <div className={styles.controlsSection}>
                    <header className={styles.header}>
                        <h1>Bumblebee Pathfinding (Djikstra)</h1>
                        <p>Help the bumblebee find the flower using Djikstra Algorithm!</p>
                    </header>
                    <div className={styles.controls}>
                        <button onClick={runBumblebeePathfinding} disabled={searchInProgressRef.current}>
                            <Image src="/play icon.png" alt="Play" width={20} height={20} />
                            Find Path
                        </button>
                        <button onClick={stopSearch} disabled={!searchInProgressRef.current}>
                            <Image src="/stop icon.png" alt="Stop" width={20} height={20} />
                            Stop
                        </button>
                        <button onClick={clearWalls} disabled={searchInProgressRef.current}>
                            Clear Walls
                        </button>
                        <button onClick={generateRandomWalls} disabled={searchInProgressRef.current}>
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
                    <div className={styles.instructions}>
                        <h2>How to Play</h2>
                        <ul>
                            <li>The bee is the start, the flower is the goal.</li>
                            <li>Click and drag to draw walls.</li>
                            <li>Click on an empty square to move the flower.</li>
                            <li>Click &apos;Find Path&apos; to see the bumblebee&apos;s journey!</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BumblebeePathfinding;