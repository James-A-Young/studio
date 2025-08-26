"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Target } from "lucide-react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from "next-auth/react";

const navLinks = [
    { href: "#features", label: "Features", showifLoggedIn: false },
    { href: "/clubs", label: "Clubs", showifLoggedIn: true },
    { href: "/dashboard", label: "Dashboard", showifLoggedIn: true },
];


export function Header() {
    const pathname = usePathname();
    const { data: session, status } = useSession();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <Target className="h-6 w-6 text-primary" />
                        <span className="hidden font-bold sm:inline-block">ShootingMatch.App</span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        {navLinks
                            .filter(link => {
                                if (session && session.user) {
                                    return link.showifLoggedIn;
                                }
                                return !link.showifLoggedIn;
                            })
                            .map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`transition-colors hover:text-foreground/80 ${pathname === link.href ? 'text-foreground' : 'text-foreground/60'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                    </nav>
                </div>

                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="mr-2 md:hidden"
                            aria-label="Open menu"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="pr-0">
                        <Link href="/" className="mr-6 flex items-center space-x-2">
                            <Target className="h-6 w-6 text-primary" />
                            <span className="font-bold">ShootingMatch.App</span>
                        </Link>
                        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                            <div className="flex flex-col space-y-3">
                                {navLinks.filter(link => {
                                if (session && session.user) {
                                    return link.showifLoggedIn;
                                }
                                return !link.showifLoggedIn;
                            }).map(link => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="text-muted-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Centered Logo on Mobile */}
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <Link href="/" className="flex items-center space-x-2 md:hidden">
                            <Target className="h-6 w-6 text-primary" />
                            <span className="font-bold">ShootingMatch.App</span>
                        </Link>
                    </div>

                    <nav className="flex items-center">
                        {session && session.user ? (
                            <>
                                <Link href="/profile" className="hover:bg-accent hover:text-accent-foreground">{session.user.email}</Link>
                                <Button variant="ghost" className="mr-2" onClick={() => signOut()}>Logout</Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" className="mr-2" onClick={() => signIn()}>Login</Button>
                                <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                                    <Link href="/register">Sign Up</Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
