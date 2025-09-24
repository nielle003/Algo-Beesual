"use client";

import { useState, useEffect, useRef } from 'react';
import Image from "next/image";

function MergePage() {
    const [arr, setArr] = useState<number[]>([]);
    const [isSorting, setIsSorting] = useState(false);
    const [isSorted, setIsSorted] = useState(false);
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
        setIsSorted(false);
        drawArray(newArr);
    };

    const startSorting = () => {
        setIsSorted(false);
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
        setIsSorted(false);
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
                setIsSorting(false);
                setIsSorted(false);
                if (animationFrameId.current) clearTimeout(animationFrameId.current);
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
            <div className="flex flex-col items-center gap-6 p-6 bg-yellow-50 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold text-gray-800">MergeSort Visualization</h1>
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
                                onChange={(e) => setArraySize(Number(e.target.value))}
                                min="5"
                                max="50"
                                className="w-40 accent-amber-600"
                            />
                            <span className="text-xs text-gray-500">50</span>
                        </div>
                    </label>

                    {/* Sorting Speed */}
                    <label className="flex flex-col text-sm font-medium text-gray-700">
                        Sorting Speed (ms): <span className="font-bold text-gray-900">{sortDelay}</span>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">10</span>
                            <input
                                type="range"
                                value={sortDelay}
                                onChange={(e) => setSortDelay(Number(e.target.value))}
                                min="10"
                                max="1000"
                                step="10"
                                className="w-40 accent-amber-600"
                            />
                            <span className="text-xs text-gray-500">1000</span>
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
                        className="p-3 bg-amber-500 hover:bg-amber-600 rounded-full shadow"
                    >
                        <Image src="/shuffle icon.png" alt="Shuffle" width={24} height={24} />
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

export default MergePage