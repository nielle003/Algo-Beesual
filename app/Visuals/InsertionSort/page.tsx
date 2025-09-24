"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

function InsertionPage() {
    const [arr, setArr] = useState<number[]>([])
    const [i, setI] = useState(1)
    const [j, setJ] = useState(0)
    const [isSorting, setIsSorting] = useState(false)
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
        drawArray(newArr)
    }

    const startSorting = () => {
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
            <div className="flex flex-col items-center space-y-6 p-6 bg-gray-900 text-white rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row md:space-x-6 w-full max-w-3xl justify-between space-y-6 md:space-y-0">

                    <div className="flex flex-col space-y-4 w-full md:w-1/3">
                        <label className="flex flex-col text-sm">
                            Array Size: {arraySize}
                            <div className="flex items-center space-x-2 mt-1">
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

                        <label className="flex flex-col text-sm">
                            Sorting Speed (ms): {sortDelay}
                            <div className="flex items-center space-x-2 mt-1">
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

                        <label className="flex items-center space-x-2 text-sm">
                            <span>Auto-Start Sorting:</span>
                            <input
                                type="checkbox"
                                checked={autoStart}
                                onChange={e => setAutoStart(e.target.checked)}
                                className="accent-yellow-400"
                            />
                        </label>

                        <div className="flex justify-center space-x-4 pt-2">
                            <button
                                onClick={startSorting}
                                disabled={isSorting}
                                className="p-2 bg-blue-600 rounded-lg disabled:opacity-40"
                            >
                                <Image src="/play icon.png" alt="Play" width={24} height={24} />
                            </button>
                            <button
                                onClick={stopSorting}
                                disabled={!isSorting}
                                className="p-2 bg-red-600 rounded-lg disabled:opacity-40"
                            >
                                <Image src="/stop icon.png" alt="Pause" width={24} height={24} />
                            </button>
                            <button
                                onClick={shuffleArray}
                                className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                            >
                                <Image src="/shuffle icon.png" alt="Shuffle" width={24} height={24} />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center items-center bg-gray-800 rounded-lg p-2 w-full md:w-2/3">
                        <canvas
                            ref={canvasRef}
                            width={500}
                            height={500}
                            className="border border-gray-700 rounded-lg"
                        ></canvas>
                    </div>
                </div>
            </div>

        </main>
    )
}

export default InsertionPage