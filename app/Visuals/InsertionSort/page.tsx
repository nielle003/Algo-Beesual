"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const PRIMARY_COLOR = '#FBBF24'; // Amber-400 - The key being inserted
const SECONDARY_COLOR = '#F87171'; // Red-400 - Element being compared against
const SORTED_COLOR = '#A78BFA'; // Violet-400
const DEFAULT_COLOR = '#4B5563'; // Gray-600

type Animation =
    | ['key', number] // The key element for the current iteration
    | ['compare', number] // The element `j` being compared
    | ['overwrite', number, number] // index `j+1` gets value from index `j`
    | ['insert', number, number] // index `j+1` gets the key value
    | ['sorted', number]; // Mark the element as sorted

function getInsertionSortAnimations(array: number[]): Animation[] {
    const animations: Animation[] = [];
    if (array.length <= 1) return animations;

    const auxiliaryArray = [...array];
    animations.push(['sorted', 0]);

    for (let i = 1; i < auxiliaryArray.length; i++) {
        const key = auxiliaryArray[i];
        animations.push(['key', i]);
        let j = i - 1;

        while (j >= 0) {
            animations.push(['compare', j]);
            if (auxiliaryArray[j] > key) {
                animations.push(['overwrite', j + 1, auxiliaryArray[j]]);
                auxiliaryArray[j + 1] = auxiliaryArray[j];
                j = j - 1;
            } else {
                break; // Exit loop if element is in correct place
            }
        }
        animations.push(['insert', j + 1, key]);
        auxiliaryArray[j + 1] = key;

        // Mark the currently sorted portion
        for (let k = 0; k <= i; k++) {
            animations.push(['sorted', k]);
        }
    }
    return animations;
}

export default function InsertionSortPage() {
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

        const animations = getInsertionSortAnimations(array);
        let currentKeyIdx = -1;

        animations.forEach((animation, i) => {
            animationTimeout.current = setTimeout(() => {
                const newColorKey = [...colorKey];
                const [type, ...values] = animation;

                // Reset comparison colors but not the key or sorted colors
                for (let k = 0; k < newColorKey.length; k++) {
                    if (newColorKey[k] === SECONDARY_COLOR) {
                        newColorKey[k] = SORTED_COLOR;
                    }
                }

                switch (type) {
                    case 'key': {
                        const [keyIdx] = values as [number];
                        currentKeyIdx = keyIdx;
                        newColorKey[keyIdx] = PRIMARY_COLOR;
                        break;
                    }
                    case 'compare': {
                        const [j] = values as [number];
                        newColorKey[j] = SECONDARY_COLOR;
                        break;
                    }
                    case 'overwrite': {
                        const [idx, val] = values as [number, number];
                        setArray(prev => {
                            const newArr = [...prev];
                            newArr[idx] = val;
                            return newArr;
                        });
                        newColorKey[idx] = SORTED_COLOR;
                        if (idx - 1 >= 0) newColorKey[idx - 1] = SECONDARY_COLOR;
                        break;
                    }
                    case 'insert': {
                        const [idx, val] = values as [number, number];
                        setArray(prev => {
                            const newArr = [...prev];
                            newArr[idx] = val;
                            return newArr;
                        });
                        newColorKey[idx] = SORTED_COLOR;
                        currentKeyIdx = -1;
                        break;
                    }
                    case 'sorted': {
                        const [idx] = values as [number];
                        if (idx !== currentKeyIdx) {
                            newColorKey[idx] = SORTED_COLOR;
                        }
                        break;
                    }
                }
                setColorKey(newColorKey);

                if (i === animations.length - 1) {
                    setIsSorting(false);
                    setIsSorted(true);
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
                        <h1 className="text-3xl font-bold text-[#5a3019] mb-4 font-serif">Insertion Sort Quest</h1>
                        <p className="text-[#5a3019]/80 mb-6">
                            The Queen Bee requires a perfectly ordered garden, one flower at a time. Take each flower from the unsorted section and insert it into its correct position within the sorted section. Grow the sorted garden until no flowers remain unsorted!
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