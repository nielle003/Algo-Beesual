"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { ModeToggle } from "./DarkButton";
import { SidebarTrigger } from "./ui/sidebar";
import { useState, useRef, useEffect } from "react";
import Chat from "@/components/chat";

function Header() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatHeight, setChatHeight] = useState<number | null>(null);
    const chatRef = useRef<HTMLDivElement>(null);

    const toggleChat = () => setIsChatOpen((prev) => !prev);

    useEffect(() => {
        if (isChatOpen && chatRef.current) {
            // Measure the height of the chatbot content
            setChatHeight(chatRef.current.scrollHeight);
        }
    }, [isChatOpen]);

    return (
        <header className="bg-popover flex h-16 w-full items-center justify-between px-4 border-b">
            <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Link className="flex items-center gap-2" href="/">
                    <Image
                        src="/bee.png"
                        height={40}
                        width={40}
                        alt="logo"
                        className="rounded-full"
                        priority
                    />
                    <h1 className="text-xl font-semibold">
                        BeeSual
                    </h1>
                </Link>
            </div>

            <div className="flex items-center">
                <ModeToggle />
                <Button variant="outline" className="ml-4" onClick={toggleChat}>
                    Chat with Bumblebyte
                </Button>
            </div>

            {isChatOpen && (
                <div
                    className="fixed bottom-3 right-4 z-50 w-96 bg-white shadow-lg rounded-lg overflow-hidden"
                    style={{ height: chatHeight ? `${chatHeight}px` : "auto" }}
                >
                    <div className="flex justify-between items-center p-2 border-b">
                        <h2 className="text-sm font-semibold">Chat with Bumblebyte</h2>
                        <button onClick={toggleChat} className="text-gray-500 hover:text-gray-800">
                            ✕
                        </button>
                    </div>
                    <div ref={chatRef} className="p-4">
                        <Chat />
                    </div>
                </div>
            )}
        </header>
    );
}

export default Header;