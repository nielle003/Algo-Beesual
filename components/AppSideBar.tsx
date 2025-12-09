"use client";
import Link from "next/link";
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar";

const items = [
    {
        title: "Bubble Sort",
        url: "/Visuals/BubbleSort",
    },
    {
        title: "Merge Sort",
        url: "/Visuals/MergeSort",
    },
    {
        title: "Insertion Sort",
        url: "/Visuals/InsertionSort",
    },
    {
        title: "Selection Sort",
        url: "/Visuals/SelectionSort",
    },
    {
        title: "Quick Sort",
        url: "/Visuals/QuickSort",
    },
];

const items2 = [
    {
        title: "Djikstra's Algorithm",
        url: "/Visuals/Djikstra",
    },
    {
        title: "A* Search",
        url: "/Visuals/A",
    },

];

export function AppSidebar() {
    const router = useRouter();
    const [mode, setMode] = useState<'demo' | 'compare'>('demo');
    const [category, setCategory] = useState<'sorting' | 'searching'>('sorting');
    const [algoA, setAlgoA] = useState(items[0].url.split('/').pop() || 'BubbleSort');
    const [algoB, setAlgoB] = useState(items[1].url.split('/').pop() || 'MergeSort');

    const sortingOptions = useMemo(() => items.map(i => ({ label: i.title, value: i.url.split('/').pop() })), []);
    const searchingOptions = useMemo(() => items2.map(i => ({ label: i.title, value: i.url.split('/').pop() })), []);

    const handleCompare = () => {
        const params = new URLSearchParams();
        params.set('category', category);
        params.set('algoA', algoA || '');
        params.set('algoB', algoB || '');
        router.push(`/Visuals/Compare?${params.toString()}`);
    }

    return (
        <Sidebar>
            <SidebarContent>
                {/* Mode Toggle (always visible at the top) */}
                <div className="px-4 py-3">
                    <div className="text-sm text-[#5a3019] font-medium text-center mb-2">Mode:</div>
                    <div className="flex gap-2 justify-center">
                        <button className={`px-3 py-1 rounded-lg ${mode === 'demo' ? 'bg-amber-400 text-white' : 'bg-white/60'}`} onClick={() => setMode('demo')}>Demonstration</button>
                        <button className={`px-3 py-1 rounded-lg ${mode === 'compare' ? 'bg-amber-400 text-white' : 'bg-white/60'}`} onClick={() => setMode('compare')}>Comparison</button>
                    </div>
                </div>

                <SidebarGroup>
                    <SidebarGroupLabel>Algorithms</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mode === 'demo' ? (
                                <>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton>Select Sorting Algorithm</SidebarMenuButton>
                                        <SidebarMenuSub>
                                            {items.map((item) => (
                                                <SidebarMenuSubItem key={item.title}>
                                                    <SidebarMenuSubButton asChild>
                                                        <Link href={item.url}>
                                                            {item.title}
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton>Select Searching Algorithm</SidebarMenuButton>
                                        <SidebarMenuSub>
                                            {items2.map((item) => (
                                                <SidebarMenuSubItem key={item.title}>
                                                    <SidebarMenuSubButton asChild>
                                                        <Link href={item.url}>
                                                            {item.title}
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </SidebarMenuItem>
                                </>
                            ) : null}

                            

                            {mode === 'compare' && (
                                <div className="p-3 space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-[#5a3019] font-medium">
                                        <label className="mr-2">Category:</label>
                                        <select value={category} onChange={(e) => {
                                            const val = e.target.value as 'sorting' | 'searching';
                                            setCategory(val);
                                            // reset algos when category changes
                                            if (val === 'sorting') {
                                                setAlgoA(sortingOptions[0]?.value || 'BubbleSort');
                                                setAlgoB(sortingOptions[1]?.value || sortingOptions[0]?.value || 'MergeSort');
                                            } else {
                                                setAlgoA(searchingOptions[0]?.value || 'Djikstra');
                                                setAlgoB(searchingOptions[1]?.value || searchingOptions[0]?.value || 'A');
                                            }
                                        }} className="rounded-md p-1 bg-white/60">
                                            <option value="sorting">Sorting</option>
                                            <option value="searching">Searching</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm text-[#5a3019]">Algorithm A</div>
                                        <select value={algoA} onChange={(e) => setAlgoA(e.target.value)} className="rounded-md p-1 bg-white/60">
                                            {(category === 'sorting' ? sortingOptions : searchingOptions).map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm text-[#5a3019]">Algorithm B</div>
                                        <select value={algoB} onChange={(e) => setAlgoB(e.target.value)} className="rounded-md p-1 bg-white/60">
                                            {(category === 'sorting' ? sortingOptions : searchingOptions).map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="pt-2">
                                        <button onClick={handleCompare} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg">Compare</button>
                                    </div>
                                </div>
                            )}

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}