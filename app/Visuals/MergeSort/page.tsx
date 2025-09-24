"use client";

import { useState, useEffect, useRef } from 'react';
import Image from "next/image";

function MergePage() {
    const [arr, setArr] = useState<number[]>([]);
    const [isSorting, setIsSorting] = useState(false);
    const [arraySize, setArraySize] = useState(15);
    const [sortDelay, setSortDelay] = useState(100);
    const [autoStart, setAutoStart] = useState(true);
    const [step, setStep] = useState(0);
    const [animations, setAnimations] = useState<any[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<any>(null);

    const drawArray = (array: number[], leftIdx: number | null = null, rightIdx: number | null = null) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = "#FFF9C4";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        array.forEach((value, index) => {
            if (index === leftIdx || index === rightIdx) {
                ctx.fillStyle = "#FFD700"; // highlight
            } else {
                ctx.fillStyle = "#5a3019";
            }
            ctx.fillRect(
                index * (canvas.width / array.length),
                canvas.height - value * 2,
                canvas.width / array.length - 2,
                value * 2
            );
        });
    };

    const initializeArray = (size = arraySize) => {
        const newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
        setArr(newArr);
        setStep(0);
        setAnimations([]);
        drawArray(newArr);
    };

    const startSorting = () => {
        setIsSorting(true);
        const newAnimations: any[] = [];
        mergeSort([...arr], newAnimations);
        setAnimations(newAnimations);
        setStep(0);
    };

    const stopSorting = () => {
        setIsSorting(false);
        if (animationFrameId.current) clearTimeout(animationFrameId.current);
    };

    const shuffleArray = () => {
        const shuffledArr = [...arr];
        for (let i = shuffledArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArr[i], shuffledArr[j]] = [shuffledArr[j], shuffledArr[i]];
        }
        setArr(shuffledArr);
        setStep(0);
        setAnimations([]);
        drawArray(shuffledArr);
    };

    const handleArraySizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = Number(event.target.value);
        setArraySize(newSize);
        initializeArray(newSize);
    };

    const mergeSort = (array: number[], animations: any[]): number[] => {
        if (array.length <= 1) return array;
        const mid = Math.floor(array.length / 2);
        const left = array.slice(0, mid);
        const right = array.slice(mid);
        const sortedLeft = mergeSort(left, animations);
        const sortedRight = mergeSort(right, animations);
        return merge(sortedLeft, sortedRight, animations);
    };

    const merge = (left: number[], right: number[], animations: any[]): number[] => {
        let result: number[] = [];
        let leftIndex = 0;
        let rightIndex = 0;

        while (leftIndex < left.length && rightIndex < right.length) {
            animations.push({
                leftIdx: leftIndex,
                rightIdx: rightIndex,
                result: [...result, left[leftIndex], right[rightIndex]]
            });

            if (left[leftIndex] < right[rightIndex]) {
                result.push(left[leftIndex]);
                leftIndex++;
            } else {
                result.push(right[rightIndex]);
                rightIndex++;
            }
        }

        result = result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
        animations.push({
            leftIdx: -1,
            rightIdx: -1,
            result: [...result]
        });

        return result;
    };

    useEffect(() => {
        if (!isSorting || animations.length === 0) return;

        const animate = () => {
            if (step < animations.length) {
                const { leftIdx, rightIdx, result } = animations[step];
                setArr(result);
                drawArray(result, leftIdx, rightIdx);
                setStep((prev) => prev + 1);
            } else {
                if (animationFrameId.current) clearTimeout(animationFrameId.current);
                setIsSorting(false);
            }

            animationFrameId.current = setTimeout(animate, sortDelay);
        };

        animationFrameId.current = setTimeout(animate, sortDelay);
        return () => {
            if (animationFrameId.current) clearTimeout(animationFrameId.current);
        };
    }, [animations, isSorting, step, sortDelay]);

    useEffect(() => {
        initializeArray(arraySize);
        if (autoStart) startSorting();
    }, [autoStart, arraySize]);

    useEffect(() => {
        drawArray(arr);
    }, [arr]);
    return (
        <main className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4">
            <div className="flex flex-col items-center space-y-6 p-6 bg-gray-900 text-white rounded-xl shadow-md">
                <div className="flex flex-col space-y-4 w-full max-w-md">
                    {/* Array Size */}
                    <label className="flex flex-col text-sm">
                        Array Size: {arraySize}
                        <div className="flex items-center space-x-2">
                            <span className="text-xs">5</span>
                            <input
                                type="range"
                                value={arraySize}
                                onChange={handleArraySizeChange}
                                min="5"
                                max="50"
                                className="flex-1 accent-blue-500"
                            />
                            <span className="text-xs">50</span>
                        </div>
                    </label>

                    {/* Sorting Speed */}
                    <label className="flex flex-col text-sm">
                        Sorting Speed (ms): {sortDelay}
                        <div className="flex items-center space-x-2">
                            <span className="text-xs">10</span>
                            <input
                                type="range"
                                value={sortDelay}
                                onChange={e => setSortDelay(Number(e.target.value))}
                                min="10"
                                max="1000"
                                step="10"
                                className="flex-1 accent-green-500"
                            />
                            <span className="text-xs">1000</span>
                        </div>
                    </label>

                    {/* Auto Start */}
                    <label className="flex items-center space-x-2 text-sm">
                        <span>Auto-Start Sorting:</span>
                        <input
                            type="checkbox"
                            checked={autoStart}
                            onChange={e => setAutoStart(e.target.checked)}
                            className="accent-yellow-400"
                        />
                    </label>

                    {/* Control Buttons */}
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={startSorting}
                            disabled={isSorting}
                            className="p-2 bg-blue-600 rounded-lg disabled:opacity-40"
                        >
                            <img src="/play icon.png" alt="Play" className="w-6 h-6" />
                        </button>
                        <button
                            onClick={stopSorting}
                            disabled={!isSorting}
                            className="p-2 bg-red-600 rounded-lg disabled:opacity-40"
                        >
                            <img src="/stop icon.png" alt="Pause" className="w-6 h-6" />
                        </button>
                        <button
                            onClick={shuffleArray}
                            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                        >
                            <img src="/shuffle icon.png" alt="Shuffle" className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <canvas
                    ref={canvasRef}
                    width={500}
                    height={300}
                    className="border border-gray-700 rounded-lg"
                ></canvas>
            </div>
        </main>
    )
}

export default MergePage