"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from 'react';

function SelectionPage() {
    const [arr, setArr] = useState<number[]>([]);
    const [i, setI] = useState(0);
    const [j, setJ] = useState(1);
    const [minIdx, setMinIdx] = useState(0);
    const [isSorting, setIsSorting] = useState(false);
    const [isSorted, setIsSorted] = useState(false);
    const [arraySize, setArraySize] = useState(15);
    const [sortDelay, setSortDelay] = useState(100);
    const [autoStart, setAutoStart] = useState(true);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameId = useRef<any>(null);

    const drawArray = (array: number[]) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#FFF9C4';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        array.forEach((value, index) => {
            ctx.fillStyle = index === minIdx ? '#FFD700' : '#5a3019';
            ctx.fillRect(
                index * (canvas.width / array.length),
                canvas.height - value * 2,
                (canvas.width / array.length) - 2,
                value * 2
            );
        });
    };

    const initializeArray = (size = arraySize) => {
        const newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
        setArr(newArr);
        setI(0);
        setJ(1);
        setMinIdx(0);
        setIsSorted(false);
        drawArray(newArr);
    };

    const shuffleArray = () => {
        const shuffledArr = [...arr];
        for (let k = shuffledArr.length - 1; k > 0; k--) {
            const rand = Math.floor(Math.random() * (k + 1));
            [shuffledArr[k], shuffledArr[rand]] = [shuffledArr[rand], shuffledArr[k]];
        }
        setArr(shuffledArr);
        setI(0);
        setJ(1);
        setMinIdx(0);
        setIsSorted(false);
        drawArray(shuffledArr);
    };

    const startSorting = () => {
        setIsSorting(true);
        setIsSorted(false);
    };
    const stopSorting = () => {
        setIsSorting(false);
        clearTimeout(animationFrameId.current);
    };

    useEffect(() => {
        if (!isSorting) return;

        const selectionSortStep = () => {
            const newArr = [...arr];

            if (i < newArr.length - 1) {
                if (j < newArr.length) {
                    if (newArr[j] < newArr[minIdx]) setMinIdx(j);
                    setJ(j + 1);
                } else {
                    [newArr[i], newArr[minIdx]] = [newArr[minIdx], newArr[i]];
                    setArr(newArr);
                    setI(i + 1);
                    setJ(i + 2);
                    setMinIdx(i + 1);
                }
            } else {
                clearTimeout(animationFrameId.current);
                setIsSorting(false);
                setIsSorted(true)
            }

            drawArray(newArr);
            animationFrameId.current = setTimeout(selectionSortStep, sortDelay);
        };

        animationFrameId.current = setTimeout(selectionSortStep, sortDelay);
        return () => clearTimeout(animationFrameId.current);
    }, [arr, i, j, minIdx, isSorting, sortDelay]);

    const handleArraySizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = Number(e.target.value);
        setArraySize(newSize);
        initializeArray(newSize);
    };

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
                <h1 className="text-2xl font-bold text-gray-800">Selection Sort Visualization</h1>
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

export default SelectionPage