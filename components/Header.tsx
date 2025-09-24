
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { ModeToggle } from "./DarkButton";
import { SidebarTrigger } from "./ui/sidebar";

function Header() {
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
            </div>
        </header>
    );
}

export default Header;