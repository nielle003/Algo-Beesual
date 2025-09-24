
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown-menu"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
} from "@/components/ui/sidebar"


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
]

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Algorithms</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton>
                                        Select Algorithm
                                        <ChevronDown className="ml-auto" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                                    {items.map((item) => (
                                        <DropdownMenuItem key={item.title} asChild>
                                            <Link href={item.url} className="flex items-center gap-2 w-full">
                                                <span>{item.title}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}