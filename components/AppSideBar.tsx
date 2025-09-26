import Link from "next/link";
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
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Algorithms</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
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
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}