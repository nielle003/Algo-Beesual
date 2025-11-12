"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
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
        <header className="bg-amber-50 flex h-16 w-full items-center justify-between px-4 border-b border-amber-200">
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
                    <h1 className="text-xl font-semibold text-amber-900">
                        BeeSual
                    </h1>
                </Link>
            </div>

            <div className="flex items-center">
                <Button variant="outline" className="ml-4 border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900" onClick={toggleChat}>
                    Chat with Bumblebyte
                </Button>
            </div>

            {isChatOpen && (
                <div
                    className="fixed bottom-3 right-4 z-50 w-96 bg-amber-50 shadow-lg rounded-lg overflow-hidden border border-amber-200"
                    style={{ height: chatHeight ? `${chatHeight}px` : "auto" }}
                >
                    <div className="flex justify-between items-center p-2 border-b border-amber-200">
                        <h2 className="text-sm font-semibold text-amber-900">Chat with Bumblebyte</h2>
                        <button onClick={toggleChat} className="text-amber-700 hover:text-amber-900">
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