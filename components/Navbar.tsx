'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Palette,
    Search,
    LayoutGrid,
    Menu,
    X,
    Sparkles,
    Presentation,
    Layers,
    Images,
    Star,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Palette', href: '/palette', icon: Palette },
    { name: 'Layouts', href: '/layouts', icon: Layers },
    { name: 'Assets', href: '/assets', icon: Images },
    { name: 'Presets', href: '/presets', icon: Star },
]

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <nav className={cn(
            "sticky top-0 z-[100] transition-all duration-300 border-b",
            scrolled ? "bg-white/80 backdrop-blur-md py-2 shadow-sm" : "bg-white py-4"
        )}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
                            <Sparkles size={24} />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent hidden sm:inline">
                            ColorHash AI
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl border">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link key={item.href} href={item.href}>
                                    <button className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                                        isActive
                                            ? "bg-white text-purple-600 shadow-sm"
                                            : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                                    )}>
                                        <item.icon size={18} />
                                        {item.name}
                                    </button>
                                </Link>
                            )
                        })}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/palette">
                            <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-lg shadow-purple-200 uppercase tracking-wider font-bold">
                                Start a Palette
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className="lg:hidden p-2 text-gray-600" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Nav */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden overflow-hidden bg-white border-t mt-4"
                        >
                            <div className="flex flex-col gap-2 py-6">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                                            <div className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-colors",
                                                isActive ? "bg-purple-50 text-purple-600" : "text-gray-600 hover:bg-gray-50"
                                            )}>
                                                <item.icon size={20} />
                                                {item.name}
                                            </div>
                                        </Link>
                                    )
                                })}
                                <div className="pt-4 px-4 flex flex-col gap-3">
                                    <Link href="/palette" onClick={() => setIsOpen(false)}>
                                        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 h-12 text-lg font-bold">
                                            Start a Palette
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    )
}
