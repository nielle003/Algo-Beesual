"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const PRIMARY_COLOR = '#FBBF24'; // Amber-400
const SECONDARY_COLOR = '#F87171'; // Red-400
const PIVOT_COLOR = '#60A5FA'; // Blue-400
const SORTED_COLOR = '#A78BFA'; // Violet-400
const DEFAULT_COLOR = '#4B5563'; // Gray-600

type Animation =
    | ['pivot', number]
    | ['range', number, number]
    | ['compare', number, number]
    | ['swap', number, number, number, number]
    | ['sorted', number];

// Helper function to generate animations
function getQuickSortAnimations(array: number[]): Animation[] {
    const animations: Animation[] = [];
    if (array.length <= 1) {
        if (array.length === 1) animations.push(['sorted', 0]);
        return animations;
    }
    const auxiliaryArray = array.slice();
    quickSortHelper(auxiliaryArray, 0, auxiliaryArray.length - 1, animations);
    return animations;
}

function quickSortHelper(
    mainArray: number[],
    startIdx: number,
    endIdx: number,
    animations: Animation[],
) {
    if (startIdx >= endIdx) {
        if (startIdx === endIdx) {
            animations.push(['sorted', startIdx]);
        }
        return;
    }
    const pivotIdx = startIdx;
    animations.push(['pivot', pivotIdx]);
    let leftIdx = startIdx + 1;
    let rightIdx = endIdx;

    animations.push(['range', startIdx, endIdx]);

    while (rightIdx >= leftIdx) {
        animations.push(['compare', leftIdx, rightIdx]);
        if (mainArray[leftIdx] > mainArray[pivotIdx] && mainArray[rightIdx] < mainArray[pivotIdx]) {
            animations.push(['swap', leftIdx, rightIdx, mainArray[rightIdx], mainArray[leftIdx]]);
            [mainArray[leftIdx], mainArray[rightIdx]] = [mainArray[rightIdx], mainArray[leftIdx]];
        }
        if (mainArray[leftIdx] <= mainArray[pivotIdx]) {
            leftIdx++;
        }
        if (mainArray[rightIdx] >= mainArray[pivotIdx]) {
            rightIdx--;
        }
    }
    animations.push(['swap', pivotIdx, rightIdx, mainArray[rightIdx], mainArray[pivotIdx]]);
    [mainArray[pivotIdx], mainArray[rightIdx]] = [mainArray[rightIdx], mainArray[pivotIdx]];
    animations.push(['sorted', rightIdx]);


    const leftSubarrayIsSmaller = rightIdx - 1 - startIdx < endIdx - (rightIdx + 1);
    if (leftSubarrayIsSmaller) {
        quickSortHelper(mainArray, startIdx, rightIdx - 1, animations);
        quickSortHelper(mainArray, rightIdx + 1, endIdx, animations);
    } else {
        quickSortHelper(mainArray, rightIdx + 1, endIdx, animations);
        quickSortHelper(mainArray, startIdx, rightIdx - 1, animations);
    }
}


export default function QuickSortPage() {
    const [array, setArray] = useState<number[]>([]);
    const [arraySize, setArraySize] = useState(15);
    const [animationSpeed, setAnimationSpeed] = useState(50);
    const [isSorting, setIsSorting] = useState(false);
    const [isSorted, setIsSorted] = useState(false);
    const [colorKey, setColorKey] = useState<string[]>([]);
    const animationTimeout = useRef<NodeJS.Timeout | null>(null);

    const generateArray = (size = arraySize) => {
        if (isSorting) return;
        setIsSorted(false);
        const newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 80) + 10);
        setArray(newArray);
        setColorKey(new Array(size).fill(DEFAULT_COLOR));
    };

    useEffect(() => {
        generateArray();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [arraySize]);

    const stopSorting = () => {
        if (animationTimeout.current) {
            clearTimeout(animationTimeout.current);
        }
        setIsSorting(false);
        setIsSorted(false);
        setColorKey(new Array(array.length).fill(DEFAULT_COLOR));
    };

    const startSorting = () => {
        if (isSorting) return;
        setIsSorting(true);
        setIsSorted(false);

        const animations = getQuickSortAnimations(array);
        const initialColorKey = new Array(array.length).fill(DEFAULT_COLOR);
        setColorKey(initialColorKey);

        animations.forEach((animation, i) => {
            animationTimeout.current = setTimeout(() => {
                const newColorKey = [...colorKey];
                const [type, ...values] = animation;

                switch (type) {
                    case 'range': {
                        const [start, end] = values as [number, number];
                        for (let j = 0; j < newColorKey.length; j++) {
                            if (newColorKey[j] !== SORTED_COLOR) {
                                newColorKey[j] = (j >= start && j <= end) ? DEFAULT_COLOR : '#D1D5DB'; // Gray-300
                            }
                        }
                        break;
                    }
                    case 'pivot': {
                        const [pivotIdx] = values as [number];
                        newColorKey[pivotIdx] = PIVOT_COLOR;
                        break;
                    }
                    case 'compare': {
                        const [idx1, idx2] = values as [number, number];
                        if (newColorKey[idx1] !== PIVOT_COLOR) newColorKey[idx1] = PRIMARY_COLOR;
                        if (newColorKey[idx2] !== PIVOT_COLOR) newColorKey[idx2] = SECONDARY_COLOR;
                        break;
                    }
                    case 'swap': {
                        const [idx1, idx2, val1, val2] = values as [number, number, number, number];
                        setArray(prev => {
                            const newArr = [...prev];
                            newArr[idx1] = val1;
                            newArr[idx2] = val2;
                            return newArr;
                        });
                        if (newColorKey[idx1] !== PIVOT_COLOR) newColorKey[idx1] = SECONDARY_COLOR;
                        if (newColorKey[idx2] !== PIVOT_COLOR) newColorKey[idx2] = PRIMARY_COLOR;
                        break;
                    }
                    case 'sorted': {
                        const [idx] = values as [number];
                        newColorKey[idx] = SORTED_COLOR;
                        break;
                    }
                }
                setColorKey(newColorKey);

                // Reset comparison colors after a short delay
                if (type === 'compare' || type === 'swap') {
                    setTimeout(() => {
                        setColorKey(prevKey => {
                            const resetKey = [...prevKey];
                            const [idx1, idx2] = values as [number, number];
                            if (resetKey[idx1] === PRIMARY_COLOR || resetKey[idx1] === SECONDARY_COLOR) {
                                resetKey[idx1] = DEFAULT_COLOR;
                            }
                            if (resetKey[idx2] === PRIMARY_COLOR || resetKey[idx2] === SECONDARY_COLOR) {
                                resetKey[idx2] = DEFAULT_COLOR;
                            }
                            return resetKey;
                        });
                    }, 100);
                }


                if (i === animations.length - 1) {
                    setIsSorting(false);
                    setIsSorted(true);
                    // Final sweep to mark all as sorted
                    setTimeout(() => {
                        setColorKey(new Array(array.length).fill(SORTED_COLOR));
                    }, 500);
                }
            }, i * (3000 / animationSpeed));
        });
    };

    return (
        <main className="flex min-h-screen w-full bg-[#FFF9C4] p-4 lg:p-8">
            <div className="grid w-full grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Controls and Description */}
                <div className="lg:col-span-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 flex flex-col justify-between border-2 border-amber-300">
                    <div>
                        <h1 className="text-3xl font-bold text-[#5a3019] mb-4 font-serif">Quick Sort Quest</h1>
                        <p className="text-[#5a3019]/80 mb-6">
                            The Queen Bee demands order! Your task is to sort the flowers by height using the &quot;divide and conquer&quot; strategy of Quick Sort. Pick a flower as a pivot, and move all smaller flowers to its left and larger ones to its right. Repeat this in the sub-gardens until all flowers are in perfect order!
                        </p>

                        <div className="space-y-6">
                            {/* Array Size */}
                            <div>
                                <label className="text-sm font-medium text-[#5a3019]">Garden Size: {arraySize} Flowers</label>
                                <Slider
                                    value={[arraySize]}
                                    onValueChange={(value) => setArraySize(value[0])}
                                    min={5}
                                    max={25}
                                    step={1}
                                    disabled={isSorting}
                                    className="mt-2"
                                />
                            </div>

                            {/* Animation Speed */}
                            <div>
                                <label className="text-sm font-medium text-[#5a3019]">Sorting Speed: {animationSpeed}</label>
                                <Slider
                                    value={[animationSpeed]}
                                    onValueChange={(value) => setAnimationSpeed(value[0])}
                                    min={10}
                                    max={100}
                                    step={5}
                                    disabled={isSorting}
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4 mt-6">
                        <div className="flex justify-center gap-4">
                            <Button onClick={startSorting} disabled={isSorting || isSorted} className="w-28 bg-amber-500 hover:bg-amber-600 text-white">
                                <Image src="/play icon.png" alt="Play" width={20} height={20} className="mr-2" />
                                Sort
                            </Button>
                            <Button onClick={stopSorting} disabled={!isSorting} className="w-28 bg-red-500 hover:bg-red-600 text-white">
                                <Image src="/stop icon.png" alt="Stop" width={20} height={20} className="mr-2" />
                                Stop
                            </Button>
                        </div>
                        <Button onClick={() => generateArray()} disabled={isSorting} className="w-full bg-green-500 hover:bg-green-600 text-white">
                            <Image src="/shuffle icon.png" alt="Shuffle" width={20} height={20} className="mr-2" />
                            New Garden
                        </Button>
                    </div>
                </div>

                {/* Right Panel: Visualization */}
                <div className="lg:col-span-2 bg-white/50 backdrop-blur-sm rounded-2xl shadow-inner p-4 lg:p-6 border-2 border-amber-200 flex items-end justify-center min-h-[300px] lg:min-h-0">
                    <div className="flex items-end h-full w-full justify-center gap-1">
                        {array.map((value, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col items-center justify-end"
                                style={{ width: `${100 / arraySize}%` }}
                            >
                                <div
                                    className="relative transition-all duration-300 ease-in-out"
                                    style={{
                                        height: `${value * 4}px`,
                                        width: '80%',
                                        backgroundColor: colorKey[idx],
                                        borderRadius: '5px 5px 0 0',
                                        boxShadow: `0 0 10px ${colorKey[idx]}, 0 0 20px ${colorKey[idx]}`
                                    }}
                                >
                                    <Image
                                        src="/flower.png"
                                        alt="Flower"
                                        width={40}
                                        height={40}
                                        className="absolute -top-8 left-1/2 -translate-x-1/2"
                                        style={{
                                            width: 'auto',
                                            height: `${Math.max(20, value / 2)}px`,
                                            filter: isSorted ? 'saturate(1.5)' : 'saturate(1)'
                                        }}
                                    />
                                </div>
                                <div
                                    className="w-full h-4 rounded-b-md"
                                    style={{ backgroundColor: colorKey[idx] }}
                                ></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}