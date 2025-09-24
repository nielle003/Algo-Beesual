import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import Link from "next/link"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
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
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}