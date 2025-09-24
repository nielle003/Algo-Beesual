"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

function InsertionPage() {
    const [arr, setArr] = useState<number[]>([])
    const [i, setI] = useState(1)
    const [j, setJ] = useState(0)
    const [isSorting, setIsSorting] = useState(false)
    const [isSorted, setIsSorted] = useState(false);
    const [arraySize, setArraySize] = useState(15)
    const [sortDelay, setSortDelay] = useState(100)
    const [autoStart, setAutoStart] = useState(true)

    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const drawArray = (array: number[]) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#FFF9C4'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        array.forEach((value, index) => {
            ctx.fillStyle = index === i || index === j ? '#FFD700' : '#5a3019'
            ctx.fillRect(
                index * (canvas.width / array.length),
                canvas.height - value * 2,
                canvas.width / array.length - 2,
                value * 2
            )
        })
    }

    const initializeArray = (size = arraySize) => {
        const newArr = Array.from({ length: size }, () =>
            Math.floor(Math.random() * 100) + 1
        )
        setArr(newArr)
        setI(1)
        setJ(0)
        setIsSorted(false);
        drawArray(newArr)
    }

    const startSorting = () => {
        setIsSorted(false);
        setIsSorting(true)
    }

    const stopSorting = () => {
        setIsSorting(false)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }

    const shuffleArray = () => {
        const shuffled = [...arr]
        for (let x = shuffled.length - 1; x > 0; x--) {
            const y = Math.floor(Math.random() * (x + 1))
                ;[shuffled[x], shuffled[y]] = [shuffled[y], shuffled[x]]
        }
        setArr(shuffled)
        setI(1)
        setJ(0)
        setIsSorted(false);
        drawArray(shuffled)
    }

    const handleArraySizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const size = Number(e.target.value)
        setArraySize(size)
        initializeArray(size)
    }

    // Sorting loop
    useEffect(() => {
        if (!isSorting) return

        const insertionSortStep = () => {
            const newArr = [...arr]

            if (i < newArr.length) {
                if (j < i) {
                    if (newArr[i] < newArr[j]) {
                        ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
                        setArr(newArr)
                    }
                    setJ(j + 1)
                } else {
                    setI(i + 1)
                    setJ(0)
                }
            } else {
                setIsSorting(false);
                setIsSorted(true);
                if (timeoutRef.current) clearTimeout(timeoutRef.current)
            }

            drawArray(newArr)
            timeoutRef.current = setTimeout(insertionSortStep, sortDelay)
        }

        timeoutRef.current = setTimeout(insertionSortStep, sortDelay)
        return () => timeoutRef.current && clearTimeout(timeoutRef.current)
    }, [arr, i, j, isSorting, sortDelay])

    useEffect(() => {
        initializeArray(arraySize)
        if (autoStart) startSorting()
    }, [autoStart, arraySize])

    useEffect(() => {
        drawArray(arr)
    }, [arr])





    return (
        <main className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4">
            <div className="flex flex-col items-center gap-6 p-6 bg-yellow-50 rounded-xl shadow-md">
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

export default InsertionPage