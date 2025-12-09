"use client";

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import Image from 'next/image';

export type SortingHandle = {
    startSort: () => void;
    stopSort: () => void;
    generateArray: () => void;
    setArraySize: (size: number) => void;
    setAnimationSpeed: (speed: number) => void;
    setSharedArray: (arr: number[]) => void;
};

type Animation =
    | ['compare', number, number]
    | ['swap', number, number, number, number]
    | ['overwrite', number, number]
    | ['sorted', number];

const PRIMARY_COLOR = '#FBBF24';
const SECONDARY_COLOR = '#F87171';
const SORTED_COLOR = '#A78BFA';
const DEFAULT_COLOR = '#4B5563';

interface Props {
    algo: 'BubbleSort' | 'QuickSort' | 'MergeSort' | 'InsertionSort' | 'SelectionSort';
    arraySize?: number;
    animationSpeed?: number;
    sharedArray?: number[] | null;
    onArrayUpdate?: (arr: number[]) => void;
    onArraySizeChange?: (size: number) => void;
    onAnimationSpeedChange?: (speed: number) => void;
}

const SortingVisualizer = forwardRef<SortingHandle, Props>(
    ({ algo, arraySize: initialSize = 15, animationSpeed: initialSpeed = 50, sharedArray = null, onArrayUpdate }, ref
    ) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const [array, setArray] = useState<number[]>([]);
        const [arraySize, setArraySize] = useState(initialSize);
        const [animationSpeed, setAnimationSpeed] = useState(initialSpeed);
        const [isSorting, setIsSorting] = useState(false);
        const [isSorted, setIsSorted] = useState(false);
        const [colorKey, setColorKey] = useState<string[]>([]);
        const animationTimeout = useRef<NodeJS.Timeout | null>(null);
        const sortingInProgressRef = useRef(false);
        const animationIndexRef = useRef(0);
        const arrayRef = useRef<number[]>([]);

        // Get sort animation function based on algorithm
        const getSortAnimations = (arr: number[], algorithm: string): Animation[] => {
            const animations: Animation[] = [];

            // Bubble Sort
            const bubble = (input: number[]) => {
                const a = [...input];
                const n = a.length;
                for (let i = 0; i < n - 1; i++) {
                    for (let j = 0; j < n - i - 1; j++) {
                        animations.push(['compare', j, j + 1]);
                        if (a[j] > a[j + 1]) {
                            animations.push(['swap', j, j + 1, a[j + 1], a[j]]);
                            [a[j], a[j + 1]] = [a[j + 1], a[j]];
                        }
                    }
                    animations.push(['sorted', n - 1 - i]);
                }
                animations.push(['sorted', 0]);
            };

            // Selection Sort
            const selection = (input: number[]) => {
                const a = [...input];
                const n = a.length;
                for (let i = 0; i < n - 1; i++) {
                    let minIndex = i;
                    animations.push(['compare', i, i]);
                    for (let j = i + 1; j < n; j++) {
                        animations.push(['compare', i, j]);
                        if (a[j] < a[minIndex]) minIndex = j;
                    }
                    if (minIndex !== i) {
                        animations.push(['swap', i, minIndex, a[minIndex], a[i]]);
                        [a[i], a[minIndex]] = [a[minIndex], a[i]];
                    }
                    animations.push(['sorted', i]);
                }
                animations.push(['sorted', n - 1]);
            };

            // Insertion Sort
            const insertion = (input: number[]) => {
                const a = [...input];
                const n = a.length;
                for (let i = 1; i < n; i++) {
                    const key = a[i];
                    let j = i - 1;
                    while (j >= 0 && a[j] > key) {
                        animations.push(['compare', j, i]);
                        // represent the shift as an overwrite of position j+1 with a[j]
                        animations.push(['overwrite', j + 1, a[j]]);
                        a[j + 1] = a[j];
                        j--;
                    }
                    // finally write the key into position j+1
                    animations.push(['overwrite', j + 1, key]);
                    a[j + 1] = key;
                }
                for (let i = 0; i < n; i++) animations.push(['sorted', i]);
            };

            // Merge Sort (produces place animations as 'swap' with target index and value)
            const mergeSort = (input: number[]) => {
                const a = [...input];

                const merge = (l: number, m: number, r: number) => {
                    const left = a.slice(l, m + 1);
                    const right = a.slice(m + 1, r + 1);
                    let i = 0, j = 0, k = l;
                    while (i < left.length && j < right.length) {
                        animations.push(['compare', l + i, m + 1 + j]);
                        if (left[i] <= right[j]) {
                            // write left[i] into position k
                            animations.push(['overwrite', k, left[i]]);
                            a[k] = left[i];
                            i++; k++;
                        } else {
                            // write right[j] into position k
                            animations.push(['overwrite', k, right[j]]);
                            a[k] = right[j];
                            j++; k++;
                        }
                    }
                    while (i < left.length) {
                        animations.push(['overwrite', k, left[i]]);
                        a[k] = left[i];
                        i++; k++;
                    }
                    while (j < right.length) {
                        animations.push(['overwrite', k, right[j]]);
                        a[k] = right[j];
                        j++; k++;
                    }
                };

                const ms = (l: number, r: number) => {
                    if (l >= r) return;
                    const m = Math.floor((l + r) / 2);
                    ms(l, m);
                    ms(m + 1, r);
                    merge(l, m, r);
                };

                ms(0, a.length - 1);
                for (let i = 0; i < a.length; i++) animations.push(['sorted', i]);
            };

            // Quick Sort (produces compare and swap animations)
            const quickSort = (input: number[]) => {
                const a = [...input];

                const partition = (low: number, high: number): number => {
                    const pivot = a[high];
                    let i = low - 1;
                    for (let j = low; j <= high - 1; j++) {
                        animations.push(['compare', j, high]);
                        if (a[j] < pivot) {
                            i++;
                            animations.push(['swap', i, j, a[j], a[i]]);
                            [a[i], a[j]] = [a[j], a[i]];
                        }
                    }
                    animations.push(['swap', i + 1, high, a[high], a[i + 1]]);
                    [a[i + 1], a[high]] = [a[high], a[i + 1]];
                    return i + 1;
                };

                const qs = (low: number, high: number) => {
                    if (low < high) {
                        const pi = partition(low, high);
                        qs(low, pi - 1);
                        qs(pi + 1, high);
                    }
                };

                qs(0, a.length - 1);
                for (let i = 0; i < a.length; i++) animations.push(['sorted', i]);
            };

            // Dispatch by algorithm
            if (algorithm === 'BubbleSort') bubble(arr);
            else if (algorithm === 'SelectionSort') selection(arr);
            else if (algorithm === 'InsertionSort') insertion(arr);
            else if (algorithm === 'MergeSort') mergeSort(arr);
            else if (algorithm === 'QuickSort') quickSort(arr);

            return animations;
        };

        const generateArray = useCallback((size = arraySize) => {
            if (isSorting) return;
            setIsSorted(false);
            const newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 80) + 10);
            setArray(newArray);
            setColorKey(new Array(size).fill(DEFAULT_COLOR));
            if (onArrayUpdate) {
                onArrayUpdate(newArray);
            }
        }, [arraySize, isSorting, onArrayUpdate]);

        // Use shared array if provided
        useEffect(() => {
            if (sharedArray && sharedArray.length > 0) {
                setArray([...sharedArray]);
                setColorKey(new Array(sharedArray.length).fill(DEFAULT_COLOR));
            }
        }, [sharedArray]);

        const drawBars = (arr: number[], colors: string[]) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const context = canvas.getContext('2d');
            if (!context) return;

            context.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = canvas.width / arr.length;

            for (let i = 0; i < arr.length; i++) {
                const barHeight = (arr[i] / 100) * canvas.height;
                context.fillStyle = colors[i];
                context.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
            }
        };

        useEffect(() => {
            drawBars(array, colorKey);
            arrayRef.current = array;
        }, [array, colorKey]);

        const stopSorting = useCallback(() => {
            if (animationTimeout.current) {
                clearTimeout(animationTimeout.current);
            }
            sortingInProgressRef.current = false;
            setIsSorting(false);
            setIsSorted(false);
            setColorKey(new Array(array.length).fill(DEFAULT_COLOR));
        }, [array.length]);

        const startSorting = useCallback(() => {
            if (sortingInProgressRef.current) return;
            
            sortingInProgressRef.current = true;
            setIsSorting(true);
            setIsSorted(false);
            animationIndexRef.current = 0;

            const animations = getSortAnimations(array, algo);
            const speedDelay = 101 - animationSpeed;

            const runAnimation = (index: number) => {
                if (index >= animations.length || !sortingInProgressRef.current) {
                        if (index >= animations.length && sortingInProgressRef.current) {
                        sortingInProgressRef.current = false;
                        setIsSorting(false);
                        setIsSorted(true);
                        // Ensure all bars are visually marked as sorted when the run finishes
                        const len = arrayRef.current?.length ?? array.length;
                        setColorKey(new Array(len).fill(SORTED_COLOR));
                    }
                    return;
                }

                const animation = animations[index];
                const [type, ...values] = animation;

                setColorKey(prevColorKey => {
                    const newColorKey = [...prevColorKey];
                    
                    // Reset colors except sorted
                    for (let k = 0; k < newColorKey.length; k++) {
                        if (newColorKey[k] !== SORTED_COLOR) {
                            newColorKey[k] = DEFAULT_COLOR;
                        }
                    }

                    switch (type) {
                        case 'compare': {
                            const [idx1, idx2] = values as [number, number];
                            if (newColorKey[idx1] !== SORTED_COLOR) newColorKey[idx1] = PRIMARY_COLOR;
                            if (newColorKey[idx2] !== SORTED_COLOR) newColorKey[idx2] = SECONDARY_COLOR;
                            break;
                        }
                        case 'swap': {
                            const [idx1, idx2, val1, val2] = values as [number, number, number, number];
                            setArray(prev => {
                                const newArr = [...prev];
                                newArr[idx1] = val1;
                                newArr[idx2] = val2;
                                if (onArrayUpdate) {
                                    onArrayUpdate(newArr);
                                }
                                return newArr;
                            });
                            newColorKey[idx1] = SECONDARY_COLOR;
                            newColorKey[idx2] = PRIMARY_COLOR;
                            break;
                        }
                            case 'overwrite': {
                                const [idx, val] = values as [number, number];
                                setArray(prev => {
                                    const newArr = [...prev];
                                    newArr[idx] = val;
                                    if (onArrayUpdate) {
                                        onArrayUpdate(newArr);
                                    }
                                    return newArr;
                                });
                                if (newColorKey[idx] !== SORTED_COLOR) newColorKey[idx] = PRIMARY_COLOR;
                                break;
                            }
                        case 'sorted': {
                            const [idx] = values as [number];
                            newColorKey[idx] = SORTED_COLOR;
                            break;
                        }
                    }

                    return newColorKey;
                });

                animationTimeout.current = setTimeout(() => {
                    runAnimation(index + 1);
                }, speedDelay);
            };

            runAnimation(0);
        }, [algo, animationSpeed, array, onArrayUpdate]);

        useImperativeHandle(ref, () => ({
            startSort: startSorting,
            stopSort: stopSorting,
            generateArray,
            setArraySize,
            setAnimationSpeed,
            setSharedArray: (arr: number[]) => {
                setArray([...arr]);
                setColorKey(new Array(arr.length).fill(DEFAULT_COLOR));
            },
        }), [startSorting, stopSorting, generateArray]);

        return (
            <div className="w-full flex items-end justify-center">
                <div className="flex items-end w-full justify-center gap-1">
                    {array.map((value, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col items-center justify-end"
                            style={{ width: `${100 / Math.max(1, array.length)}%`, transform: 'translateY(0.6em)' }}
                        >
                            <div
                                className="relative transition-all duration-300 ease-in-out"
                                style={{
                                    // reduce multiplier so bars sit lower in the panel
                                    height: `${value * 6}px`,
                                    width: '80%',
                                    backgroundColor: colorKey[idx] || DEFAULT_COLOR,
                                    borderRadius: '8px 8px 4px 4px',
                                    boxShadow: `0 6px 10px rgba(0,0,0,0.15), inset 0 -6px 8px rgba(0,0,0,0.06)`,
                                }}
                            >
                                <Image
                                    src="/flower.png"
                                    alt="Flower"
                                    width={40}
                                    height={40}
                                    className="absolute -top-4 left-1/2 -translate-x-1/2"
                                    style={{
                                        width: 'auto',
                                        // slightly smaller flower height and lower placement
                                        height: `${Math.max(14, value / 3)}px`,
                                        filter: isSorted ? 'saturate(1.5)' : 'saturate(1)'
                                    }}
                                />
                            </div>
                            <div
                                className="w-full h-4 rounded-b-md"
                                style={{ backgroundColor: colorKey[idx] || DEFAULT_COLOR }}
                            ></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
);

SortingVisualizer.displayName = 'SortingVisualizer';

export default SortingVisualizer;
