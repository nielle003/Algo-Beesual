"use client";

import React from 'react'
import Image from "next/image";
import { useState, useEffect, useRef } from 'react';

interface SortingState {
    array: number[];
    low: number;
    high: number;
    pivotIndex: number;
    partitionIndex: number;
    isPartitioning: boolean;
    stack: Array<{ low: number, high: number }>;
}

function QuickSortPage() {
    const [arr, setArr] = useState<number[]>([]);
    const [sortingState, setSortingState] = useState<SortingState>({
        array: [],
        low: -1,
        high: -1,
        pivotIndex: -1,
        partitionIndex: -1,
        isPartitioning: false,
        stack: []
    });
    const [isSorting, setIsSorting] = useState(false);
    const [isSorted, setIsSorted] = useState(false);
    const [arraySize, setArraySize] = useState(15);
    const [sortDelay, setSortDelay] = useState(200);
    const [autoStart, setAutoStart] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const drawArray = (array: number[]) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = "#FFF9C4"; // background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        array.forEach((value, index) => {
            let fillStyle = "#5a3019"; // default brown

            // Color coding for quicksort visualization
            if (isSorting) {
                if (index === sortingState.pivotIndex) {
                    fillStyle = "#FF6B6B"; // Red for pivot
                } else if (index >= sortingState.low && index <= sortingState.high) {
                    fillStyle = "#4ECDC4"; // Teal for current subarray being sorted
                } else if (index === sortingState.partitionIndex) {
                    fillStyle = "#FFD93D"; // Yellow for partition pointer
                }
            }

            ctx.fillStyle = fillStyle;
            ctx.fillRect(
                index * (canvas.width / array.length),
                canvas.height - value * 2,
                canvas.width / array.length - 2,
                value * 2
            );
        });

        // Draw legend
        if (isSorting) {
            ctx.font = "12px Arial";
            ctx.fillStyle = "#333";
            ctx.fillText("Red: Pivot", 10, 20);
            ctx.fillStyle = "#4ECDC4";
            ctx.fillText("Teal: Current Range", 10, 35);
            ctx.fillStyle = "#FFD93D";
            ctx.fillText("Yellow: Partition Pointer", 10, 50);
        }
    };

    const initializeArray = (size = arraySize) => {
        const newArr = Array.from({ length: size }, () =>
            Math.floor(Math.random() * 100) + 1
        );
        setArr(newArr);
        setSortingState({
            array: [...newArr],
            low: -1,
            high: -1,
            pivotIndex: -1,
            partitionIndex: -1,
            isPartitioning: false,
            stack: []
        });
        setIsSorted(false);
        drawArray(newArr);
    };

    const startSorting = () => {
        if (arr.length === 0) return;

        setIsSorting(true);
        setIsSorted(false);
        setSortingState(prev => ({
            ...prev,
            array: [...arr],
            low: 0,
            high: arr.length - 1,
            pivotIndex: arr.length - 1,
            partitionIndex: 0,
            isPartitioning: true,
            stack: [{ low: 0, high: arr.length - 1 }]
        }));
    };

    const stopSorting = () => {
        setIsSorting(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setSortingState(prev => ({
            ...prev,
            low: -1,
            high: -1,
            pivotIndex: -1,
            partitionIndex: -1,
            isPartitioning: false,
            stack: []
        }));
    };

    const shuffleArray = () => {
        const shuffledArr = [...arr];
        for (let x = shuffledArr.length - 1; x > 0; x--) {
            const y = Math.floor(Math.random() * (x + 1));
            [shuffledArr[x], shuffledArr[y]] = [shuffledArr[y], shuffledArr[x]];
        }
        setArr(shuffledArr);
        setSortingState({
            array: [...shuffledArr],
            low: -1,
            high: -1,
            pivotIndex: -1,
            partitionIndex: -1,
            isPartitioning: false,
            stack: []
        });
        setIsSorted(false);
        drawArray(shuffledArr);
    };

    const handleArraySizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = Number(e.target.value);
        setArraySize(newSize);
        initializeArray(newSize);
    };

    // Partition function for quicksort
    const partition = (array: number[], low: number, high: number): { newArray: number[], pivotPos: number } => {
        const pivot = array[high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
            if (array[j] < pivot) {
                i++;
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
        [array[i + 1], array[high]] = [array[high], array[i + 1]];

        return { newArray: array, pivotPos: i + 1 };
    };

    useEffect(() => {
        if (!isSorting || sortingState.stack.length === 0) {
            if (isSorting && sortingState.stack.length === 0) {
                setIsSorting(false);
                setIsSorted(true);
            }
            return;
        }

        const quickSortStep = () => {
            const currentState = sortingState;
            const { low, high } = currentState.stack[0];

            if (low < high) {
                const newArray = [...currentState.array];
                const { newArray: partitionedArray, pivotPos } = partition(newArray, low, high);

                const newStack = currentState.stack.slice(1);

                // Add right partition first (high to low+1), then left partition
                if (pivotPos + 1 < high) {
                    newStack.unshift({ low: pivotPos + 1, high: high });
                }
                if (low < pivotPos - 1) {
                    newStack.unshift({ low: low, high: pivotPos - 1 });
                }

                setArr(partitionedArray);
                setSortingState({
                    array: partitionedArray,
                    low: newStack.length > 0 ? newStack[0].low : -1,
                    high: newStack.length > 0 ? newStack[0].high : -1,
                    pivotIndex: newStack.length > 0 ? newStack[0].high : -1,
                    partitionIndex: newStack.length > 0 ? newStack[0].low : -1,
                    isPartitioning: newStack.length > 0,
                    stack: newStack
                });

                drawArray(partitionedArray);
            } else {
                // Current partition is done, move to next
                const newStack = currentState.stack.slice(1);
                setSortingState({
                    ...currentState,
                    low: newStack.length > 0 ? newStack[0].low : -1,
                    high: newStack.length > 0 ? newStack[0].high : -1,
                    pivotIndex: newStack.length > 0 ? newStack[0].high : -1,
                    partitionIndex: newStack.length > 0 ? newStack[0].low : -1,
                    isPartitioning: newStack.length > 0,
                    stack: newStack
                });
            }

            timeoutRef.current = setTimeout(quickSortStep, sortDelay);
        };

        timeoutRef.current = setTimeout(quickSortStep, sortDelay);
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [sortingState, isSorting, sortDelay]);

    useEffect(() => {
        initializeArray(arraySize);
        if (autoStart) {
            setTimeout(() => startSorting(), 500);
        }
    }, [autoStart, arraySize]);

    useEffect(() => {
        drawArray(arr);
    }, [arr, sortingState]);

    return (
        <main className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4">
            <div className="flex flex-col items-center gap-6 p-6 bg-yellow-50 rounded-xl shadow-md">
                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-800">QuickSort Visualization</h1>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
                    {/* Array Size */}
                    <label className="flex flex-col text-sm font-medium text-gray-700">
                        Array Size: <span className="font-bold text-gray-900">{arraySize}</span>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">5</span>
                            <input
                                type="range"
                                value={arraySize}
                                onChange={handleArraySizeChange}
                                min="5"
                                max="50"
                                disabled={isSorting}
                                className="w-40 accent-amber-600"
                            />
                            <span className="text-xs text-gray-500">50</span>
                        </div>
                    </label>

                    {/* Sorting Speed */}
                    <label className="flex flex-col text-sm font-medium text-gray-700">
                        Sorting Speed (ms): <span className="font-bold text-gray-900">{sortDelay}</span>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">50</span>
                            <input
                                type="range"
                                value={sortDelay}
                                onChange={(e) => setSortDelay(Number(e.target.value))}
                                min="50"
                                max="2000"
                                step="50"
                                className="w-40 accent-amber-600"
                            />
                            <span className="text-xs text-gray-500">2000</span>
                        </div>
                    </label>

                    {/* Auto-Start */}
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        Auto-Start Sorting
                        <input
                            type="checkbox"
                            checked={autoStart}
                            onChange={(e) => setAutoStart(e.target.checked)}
                            className="w-4 h-4 accent-amber-600"
                        />
                    </label>
                </div>

                {/* Status Display */}
                {isSorting && (
                    <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-md">
                        Sorting range: [{sortingState.low}, {sortingState.high}] |
                        Remaining partitions: {sortingState.stack.length}
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={startSorting}
                        disabled={isSorting || isSorted}
                        className="p-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 rounded-full shadow"
                    >
                        <Image src="/play icon.png" alt="Play" width={24} height={24} />
                    </button>
                    <button
                        onClick={stopSorting}
                        disabled={!isSorting}
                        className="p-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 rounded-full shadow"
                    >
                        <Image src="/stop icon.png" alt="Pause" width={24} height={24} />
                    </button>
                    <button
                        onClick={shuffleArray}
                        disabled={isSorting}
                        className="p-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 rounded-full shadow"
                    >
                        <Image src="/shuffle icon.png" alt="Shuffle" width={24} height={24} />
                    </button>
                    <button
                        onClick={() => initializeArray()}
                        disabled={isSorting}
                        className="p-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 rounded-full shadow"
                    >
                        🔄
                    </button>
                </div>

                {/* Canvas */}
                <canvas
                    ref={canvasRef}
                    width={500}
                    height={300}
                    className="border border-gray-300 rounded-md bg-white"
                ></canvas>
            </div>
        </main>
    )
}

export default QuickSortPage