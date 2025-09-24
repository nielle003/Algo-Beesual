import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
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

// Menu items.
const items = [
    {
        title: "Bubble Sort",
        url: "/Visuals/BubbleSort",
        icon: Home,
    },
    {
        title: "Merge Sort",
        url: "/Visuals/MergeSort",
        icon: Inbox,
    },
    {
        title: "Insertion Sort",
        url: "/Visuals/InsertionSort",
        icon: Calendar,
    },
    {
        title: "Selection Sort",
        url: "/Visuals/SelectionSort",
        icon: Search,
    },
    {
        title: "Quick Sort",
        url: "/Visuals/QuickSort",
        icon: Settings,
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
                                                <item.icon className="w-4 h-4" />
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