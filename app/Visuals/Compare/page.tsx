"use client";

import React, { useRef, useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PathfindingView, { PathfindingHandle } from '@/components/PathfindingView';
import SortingVisualizer, { SortingHandle } from '@/components/SortingVisualizer';
import useSharedPathfindingGrid from '@/hooks/useSharedPathfindingGrid';

export default function ComparePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const category = searchParams.get('category') || 'sorting';
    const algoA = searchParams.get('algoA') || '';
    const algoB = searchParams.get('algoB') || '';

    // Only show centralized controls for searching comparisons
    const isSearching = category === 'searching';
    const isSorting = category === 'sorting';

    const viewARef = useRef<PathfindingHandle | null>(null);
    const viewBRef = useRef<PathfindingHandle | null>(null);
    const sortARef = useRef<SortingHandle | null>(null);
    const sortBRef = useRef<SortingHandle | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Compute canvas size from container
    const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);
    const [gridDimensions, setGridDimensions] = useState<{ rows: number; cols: number } | null>(null);
    const [isSearching_, setIsSearching_] = useState(false);
    const [isSorting_, setIsSorting_] = useState(false);
    const [arraySize, setArraySize] = useState(15);
    const [animationSpeed, setAnimationSpeed] = useState(50);

    useEffect(() => {
        const computeSize = () => {
            if (containerRef.current) {
                const size = Math.min(containerRef.current.offsetWidth / 2.5, window.innerHeight * 0.6);
                setCanvasSize({ width: size, height: size });
                // Compute grid dimensions based on actual canvas size
                const cellSize = 20;
                const rows = Math.floor(size / cellSize);
                const cols = Math.floor(size / cellSize);
                setGridDimensions({ rows, cols });
            }
        };

        computeSize();
        window.addEventListener('resize', computeSize);
        return () => window.removeEventListener('resize', computeSize);
    }, []);

    // For searching, use shared grid state with explicit dimensions
    const sharedGridState = useSharedPathfindingGrid(gridDimensions || undefined);

    // Poll search progress every 100ms
    useEffect(() => {
        if (!isSearching) return;
        const interval = setInterval(() => {
            const aSearching = viewARef.current?.isSearching() || false;
            const bSearching = viewBRef.current?.isSearching() || false;
            setIsSearching_(aSearching || bSearching);
        }, 100);
        return () => clearInterval(interval);
    }, [isSearching]);

    // Search algorithm controls
    const runBoth = async () => {
        setIsSearching_(true);
        viewARef.current?.run();
        viewBRef.current?.run();
    };
    const stopBoth = () => {
        viewARef.current?.stop();
        viewBRef.current?.stop();
        setIsSearching_(false);
    };
    const clearBoth = () => {
        viewARef.current?.clearWalls();
        viewBRef.current?.clearWalls();
    };
    const shuffleBoth = () => {
        viewARef.current?.shuffleWalls();
        viewBRef.current?.shuffleWalls();
    };

    // Sorting algorithm controls
    const [sharedSortArray, setSharedSortArray] = useState<number[]>([]);

    const generateSharedArray = (size: number = arraySize) => {
        const newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 80) + 10);
        setSharedSortArray(newArray);
        // Notify both visualizers of the new array
        setTimeout(() => {
            sortARef.current?.setSharedArray(newArray);
            sortBRef.current?.setSharedArray(newArray);
        }, 0);
    };

    useEffect(() => {
        if (isSorting) generateSharedArray(arraySize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [arraySize, isSorting]);

    // Initialize shared array on page load for sorting
    useEffect(() => {
        if (isSorting && sharedSortArray.length === 0) {
            generateSharedArray(arraySize);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSorting]);
    const sortBothStart = () => {
        if (sharedSortArray.length === 0) {
            generateSharedArray(arraySize);
        }
        setIsSorting_(true);
        sortARef.current?.startSort();
        sortBRef.current?.startSort();
    };

    const sortBothStop = () => {
        sortARef.current?.stopSort();
        sortBRef.current?.stopSort();
        setIsSorting_(false);
    };

    const generateBothArrays = () => {
        generateSharedArray(arraySize);
    }; return (
        <Suspense fallback={<div className="min-h-screen p-6 bg-[#FFFDF2] flex items-center justify-center">Loading...</div>}>
            <main className="min-h-screen p-6 bg-[#FFFDF2]">
                <div className="max-w-full mx-auto space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-[#5a3019]">Comparison Mode</h2>
                            <p className="text-sm text-[#5a3019]/80">Category: {isSearching ? 'Searching' : 'Sorting'}</p>
                            <p className="text-sm text-[#5a3019]/80">Comparing: {algoA || '—'} vs {algoB || '—'}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => router.back()} className="px-3 py-1 rounded bg-white/70 border">Back</button>
                            <Link href="/" className="px-3 py-1 rounded bg-amber-400 text-white">Home</Link>
                        </div>
                    </div>

                    {(!algoA || !algoB) ? (
                        <div className="p-6 bg-white/80 rounded shadow text-[#5a3019]">Please pick two algorithms from the sidebar and click Compare.</div>
                    ) : (
                        isSearching ? (
                            <div className="space-y-4">
                                <div className="bg-white/80 rounded shadow p-4">
                                    <div className="flex gap-2 flex-wrap">
                                        <button onClick={runBoth} disabled={isSearching_} className="bg-[#FFD54F] text-[#3E2723] px-4 py-2 rounded flex items-center gap-2 hover:bg-[#FFC107] hover:shadow-md transition-all font-semibold disabled:bg-[#FFE082] disabled:opacity-70 disabled:cursor-not-allowed">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                                            Find Path
                                        </button>
                                        <button onClick={stopBoth} disabled={!isSearching_} className="bg-white border-2 border-[#FFD54F] text-[#3E2723] px-4 py-2 rounded flex items-center gap-2 hover:bg-[#FFF9C4] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><rect x="4" y="4" width="12" height="12" rx="2" /></svg>
                                            Stop
                                        </button>
                                        <button onClick={clearBoth} disabled={isSearching_} className="bg-white border-2 border-gray-300 text-[#3E2723] px-4 py-2 rounded hover:bg-gray-50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                                            Clear Walls
                                        </button>
                                        <button onClick={shuffleBoth} disabled={isSearching_} className="bg-white border-2 border-gray-300 text-[#3E2723] px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4.5 15a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H4.5z" /></svg>
                                            Shuffle Walls
                                        </button>
                                    </div>
                                </div>

                                <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {canvasSize && (
                                        <>
                                            <div className="bg-white/70 rounded shadow overflow-hidden">
                                                <div className="p-2 border-b bg-white/80 text-sm font-medium text-[#5a3019]">{algoA}</div>
                                                <PathfindingView
                                                    ref={viewARef}
                                                    algo={algoA === 'A' ? 'A' : 'Djikstra'}
                                                    compact
                                                    gridState={sharedGridState}
                                                    externalCanvasSize={canvasSize}
                                                />
                                            </div>

                                            <div className="bg-white/70 rounded shadow overflow-hidden">
                                                <div className="p-2 border-b bg-white/80 text-sm font-medium text-[#5a3019]">{algoB}</div>
                                                <PathfindingView
                                                    ref={viewBRef}
                                                    algo={algoB === 'A' ? 'A' : 'Djikstra'}
                                                    compact
                                                    gridState={sharedGridState}
                                                    externalCanvasSize={canvasSize}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <main className="flex min-h-[60vh] w-full bg-[#FFF9C4] p-4 lg:p-6 rounded-lg">
                                <div className="grid w-full grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Left Panel: Controls */}
                                    <div className="lg:col-span-1 bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col justify-between border-2 border-amber-300">
                                        <div>
                                            <h1 className="text-3xl font-bold text-[#5a3019] mb-4 font-serif">Comparison Controls</h1>
                                            <p className="text-[#5a3019]/80 mb-6">Garden Size and Sorting Speed apply to both visualizers.</p>

                                            <div className="space-y-6">
                                                <div>
                                                    <label className="text-sm font-medium text-[#5a3019]">Garden Size: {arraySize}</label>
                                                    <Slider
                                                        value={[arraySize]}
                                                        onValueChange={(v) => { setArraySize(v[0]); sortARef.current?.setArraySize(v[0]); sortBRef.current?.setArraySize(v[0]); }}
                                                        min={5}
                                                        max={100}
                                                        step={1}
                                                        disabled={isSorting_}
                                                        className="mt-2"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-sm font-medium text-[#5a3019]">Sorting Speed: {animationSpeed}</label>
                                                    <Slider
                                                        value={[animationSpeed]}
                                                        onValueChange={(v) => { setAnimationSpeed(v[0]); sortARef.current?.setAnimationSpeed(v[0]); sortBRef.current?.setAnimationSpeed(v[0]); }}
                                                        min={10}
                                                        max={100}
                                                        step={1}
                                                        disabled={isSorting_}
                                                        className="mt-2"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col space-y-4 mt-6">
                                            <div className="flex justify-center gap-4">
                                                <Button onClick={sortBothStart} disabled={isSorting_} className="w-28 bg-amber-500 hover:bg-amber-600 text-white">
                                                    <Image src="/play icon.png" alt="Play" width={18} height={18} className="mr-2" />
                                                    Start
                                                </Button>
                                                <Button onClick={sortBothStop} disabled={!isSorting_} className="w-28 bg-red-500 hover:bg-red-600 text-white">
                                                    <Image src="/stop icon.png" alt="Stop" width={18} height={18} className="mr-2" />
                                                    Stop
                                                </Button>
                                            </div>
                                            <Button onClick={() => generateBothArrays()} disabled={isSorting_} className="w-full bg-green-500 hover:bg-green-600 text-white">
                                                <Image src="/shuffle icon.png" alt="Shuffle" width={18} height={18} className="mr-2" />
                                                New Garden
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Right Panel: Two visualizers side-by-side */}
                                    <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-inner p-4 border-2 border-amber-200 flex items-end justify-center min-h-[380px]">
                                            <div className="w-full h-full">
                                                <div className="p-2 bg-white/80 text-sm font-medium text-[#5a3019] mb-3 text-center border-b rounded">{algoA}</div>
                                                <div className="h-[calc(100% - 36px)] flex items-end">
                                                    <SortingVisualizer
                                                        ref={sortARef}
                                                        algo={algoA as 'BubbleSort' | 'QuickSort' | 'MergeSort' | 'InsertionSort' | 'SelectionSort'}
                                                        arraySize={arraySize}
                                                        animationSpeed={animationSpeed}
                                                        sharedArray={sharedSortArray}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-inner p-4 border-2 border-amber-200 flex items-end justify-center min-h-[380px]">
                                            <div className="w-full h-full">
                                                <div className="p-2 bg-white/80 text-sm font-medium text-[#5a3019] mb-3 text-center border-b rounded">{algoB}</div>
                                                <div className="h-[calc(100% - 36px)] flex items-end">
                                                    <SortingVisualizer
                                                        ref={sortBRef}
                                                        algo={algoB as 'BubbleSort' | 'QuickSort' | 'MergeSort' | 'InsertionSort' | 'SelectionSort'}
                                                        arraySize={arraySize}
                                                        animationSpeed={animationSpeed}
                                                        sharedArray={sharedSortArray}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </main>
                        )
                    )}
                </div>
            </main>
        </Suspense>
    );
}
