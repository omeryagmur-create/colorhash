'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, Search, Maximize2, Layers, Download, Palette, Sparkles, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { parseHexColors } from '@/lib/color-utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function LogoBoardPage() {
    const [hexInput, setHexInput] = useState('')
    const [images, setImages] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [activeBackground, setActiveBackground] = useState('#ffffff')
    const [selectedStyle, setSelectedStyle] = useState('Minimalist')

    const styles = ['Minimalist', 'Vintage', 'Modern', 'Abstract', 'Geometric', 'Typographic']

    const handleSearch = async () => {
        setLoading(true)
        const colors = parseHexColors(hexInput)

        try {
            // Use specific logo related queries
            const searchQuery = `${colors[0] || ''} logo icon design ${selectedStyle}`.trim()

            const response = await fetch('/api/search-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hexColors: hexInput,
                    threshold: 85,
                }),
            })

            const data = await response.json()
            setImages(data.images || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }



    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="container mx-auto px-4 max-w-7xl py-12">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                        <LayoutGrid className="w-4 h-4" />
                        Brand Identity Inspiration
                    </div>
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                        Logo Inspiration Board
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Explore world-class logo designs that match your brand's color DNA. Test them in different environments instantly.
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-8 mb-12">
                    {/* Controls */}
                    <Card className="lg:col-span-4 border-2 shadow-lg overflow-hidden">
                        <CardContent className="p-0 border-none">
                            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x border-b">
                                <div className="flex-1 p-6">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Color Palette</label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="#000000 #FFFFFF"
                                            value={hexInput}
                                            onChange={(e) => setHexInput(e.target.value)}
                                            className="border-gray-200 focus:ring-blue-500"
                                        />
                                        <Button onClick={handleSearch} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                            <Search className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex-1 p-6">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Logo Style</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {styles.map(style => (
                                            <button
                                                key={style}
                                                onClick={() => setSelectedStyle(style)}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedStyle === style
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1 p-6">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Background Simulation</label>
                                    <div className="flex gap-3">
                                        {['#ffffff', '#f8f9fa', '#1a1a1a', '#000000', '#2d3436'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setActiveBackground(color)}
                                                className={`w-8 h-8 rounded-lg border-2 transition-all ${activeBackground === color ? 'border-blue-600 scale-110' : 'border-white'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                        <div className="w-8 h-8 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                                            <Palette size={14} className="text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Board */}
                <div className="space-y-8">
                    {loading ? (
                        <div className="flex justify-center py-24">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : images.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            <TooltipProvider>
                                {images.map((image, i) => (
                                    <motion.div
                                        key={image.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group relative"
                                    >
                                        <div
                                            className="aspect-square rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 flex items-center justify-center p-8"
                                            style={{ backgroundColor: activeBackground }}
                                        >
                                            <img
                                                src={image.urls.small}
                                                alt="Logo inspiration"
                                                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                                style={{
                                                    // Apply white filter if background is dark for simulation
                                                    filter: activeBackground === '#000000' || activeBackground === '#1a1a1a' ? 'invert(1) grayscale(1) brightness(2)' : 'none'
                                                }}
                                            />

                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="icon" variant="secondary" className="rounded-full bg-white/90 hover:bg-white">
                                                            <Maximize2 size={18} />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Preview Full</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="icon" variant="secondary" className="rounded-full bg-white/90 hover:bg-white" asChild>
                                                            <a href={image.links?.html} target="_blank" rel="noreferrer">
                                                                <Download size={18} />
                                                            </a>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Open Source</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full overflow-hidden border">
                                                    <img src={image.user?.profile_image?.small} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-xs font-medium text-gray-500">{image.user?.name}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                {image.dominantColors && Object.values(image.dominantColors).slice(0, 3).map((color: any, idx: number) => (
                                                    <div key={idx} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </TooltipProvider>
                        </div>
                    ) : (
                        <div className="text-center py-24 border-4 border-dashed rounded-3xl border-gray-100">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                <Layers size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-400 mb-2">No Logos Found</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Enter your brand colors and select a style to generate your inspiration board.
                            </p>
                            <Button onClick={handleSearch} className="mt-8 bg-blue-600">
                                Load Sample Designs
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="mt-20 pt-12 border-t text-center">
                    <div className="inline-block p-8 bg-white rounded-3xl shadow-xl border border-blue-50">
                        <Sparkles className="text-blue-500 w-10 h-10 mx-auto mb-4" />
                        <h4 className="font-bold text-xl mb-2">Did you know?</h4>
                        <p className="text-gray-600 max-w-xl">
                            Different background colors can change the emotional impact of a logo. Professional designers always test their logos in "Light Mode", "Dark Mode", and "Monochrome" environments to ensure versatility.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
