'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Palette, Sparkles, Download, Copy, RefreshCw, Heart, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ColorPalette {
    id: string
    name: string
    colors: string[]
    industry: string
    vibe: string
    harmony: string
}

const industries = [
    { value: 'tech', label: '💻 Technology' },
    { value: 'fashion', label: '👗 Fashion' },
    { value: 'food', label: '🍔 Food & Beverage' },
    { value: 'health', label: '🏥 Health & Wellness' },
    { value: 'finance', label: '💰 Finance' },
    { value: 'education', label: '📚 Education' },
    { value: 'entertainment', label: '🎬 Entertainment' },
    { value: 'travel', label: '✈️ Travel' },
    { value: 'real-estate', label: '🏠 Real Estate' },
    { value: 'sports', label: '⚽ Sports' },
]

const vibes = [
    { value: 'modern', label: '🔮 Modern' },
    { value: 'vintage', label: '📻 Vintage' },
    { value: 'playful', label: '🎨 Playful' },
    { value: 'professional', label: '💼 Professional' },
    { value: 'minimalist', label: '⚪ Minimalist' },
    { value: 'bold', label: '⚡ Bold' },
    { value: 'luxury', label: '💎 Luxury' },
    { value: 'eco', label: '🌿 Eco-Friendly' },
]

const harmonies = [
    { value: 'complementary', label: 'Complementary' },
    { value: 'analogous', label: 'Analogous' },
    { value: 'triadic', label: 'Triadic' },
    { value: 'tetradic', label: 'Tetradic' },
    { value: 'monochromatic', label: 'Monochromatic' },
]

export default function BrandGeneratorPage() {
    const [industry, setIndustry] = useState('tech')
    const [vibe, setVibe] = useState('modern')
    const [harmony, setHarmony] = useState('complementary')
    const [palettes, setPalettes] = useState<ColorPalette[]>([])
    const [loading, setLoading] = useState(false)
    const [copiedColor, setCopiedColor] = useState<string | null>(null)
    const [likedPalettes, setLikedPalettes] = useState<Set<string>>(new Set())

    const generatePalettes = async () => {
        setLoading(true)

        try {
            const response = await fetch('/api/generate-palette', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ industry, vibe, harmony }),
            })

            const data = await response.json()
            setPalettes(data.palettes)
        } catch (error) {
            console.error('Failed to generate palettes:', error)
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (color: string) => {
        navigator.clipboard.writeText(color)
        setCopiedColor(color)
        setTimeout(() => setCopiedColor(null), 2000)
    }

    const toggleLike = (paletteId: string) => {
        setLikedPalettes(prev => {
            const newSet = new Set(prev)
            if (newSet.has(paletteId)) {
                newSet.delete(paletteId)
            } else {
                newSet.add(paletteId)
            }
            return newSet
        })
    }

    const exportPalette = (palette: ColorPalette, format: 'css' | 'json' | 'svg') => {
        let content = ''
        let filename = ''

        switch (format) {
            case 'css':
                content = `:root {\n${palette.colors.map((color, i) => `  --color-${i + 1}: ${color};`).join('\n')}\n}`
                filename = `${palette.name.toLowerCase().replace(/\s+/g, '-')}.css`
                break
            case 'json':
                content = JSON.stringify(palette, null, 2)
                filename = `${palette.name.toLowerCase().replace(/\s+/g, '-')}.json`
                break
            case 'svg':
                const svgContent = `<svg width="500" height="100" xmlns="http://www.w3.org/2000/svg">
  ${palette.colors.map((color, i) => `<rect x="${i * 100}" width="100" height="100" fill="${color}"/>`).join('\n  ')}
</svg>`
                content = svgContent
                filename = `${palette.name.toLowerCase().replace(/\s+/g, '-')}.svg`
                break
        }

        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-20">


            <div className="container mx-auto px-4 max-w-7xl py-12">
                {/* Page Title */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />
                        AI-Powered Brand Generator
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                        Create Your Brand Palette
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Generate professional color palettes tailored to your industry and brand vibe
                    </p>
                </div>

                {/* Controls */}
                <Card className="mb-12 border-2 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">Customize Your Palette</CardTitle>
                        <CardDescription className="text-base">
                            Select your brand preferences and let AI create the perfect color scheme
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Industry */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Industry</label>
                                <Select value={industry} onValueChange={setIndustry}>
                                    <SelectTrigger className="h-12 border-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {industries.map(ind => (
                                            <SelectItem key={ind.value} value={ind.value}>
                                                {ind.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Vibe */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Brand Vibe</label>
                                <Select value={vibe} onValueChange={setVibe}>
                                    <SelectTrigger className="h-12 border-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vibes.map(v => (
                                            <SelectItem key={v.value} value={v.value}>
                                                {v.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Harmony */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Color Harmony</label>
                                <Select value={harmony} onValueChange={setHarmony}>
                                    <SelectTrigger className="h-12 border-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {harmonies.map(h => (
                                            <SelectItem key={h.value} value={h.value}>
                                                {h.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button
                            onClick={generatePalettes}
                            disabled={loading}
                            size="lg"
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 h-14 text-lg"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Generating Magic...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Generate Palettes
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Results */}
                <AnimatePresence>
                    {palettes.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    Your Brand Palettes
                                </h2>
                                <p className="text-gray-600">Click on colors to copy • Export in multiple formats</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <TooltipProvider>
                                    {palettes.map((palette, idx) => (
                                        <motion.div
                                            key={palette.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <Card className="group hover:shadow-2xl transition-all duration-300 border-2">
                                                <CardHeader>
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <CardTitle className="text-xl mb-1">{palette.name}</CardTitle>
                                                            <CardDescription>
                                                                {industries.find(i => i.value === palette.industry)?.label} • {vibes.find(v => v.value === palette.vibe)?.label}
                                                            </CardDescription>
                                                        </div>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => toggleLike(palette.id)}
                                                            className="rounded-full"
                                                        >
                                                            <Heart
                                                                className={`w-5 h-5 ${likedPalettes.has(palette.id) ? 'fill-red-500 text-red-500' : ''}`}
                                                            />
                                                        </Button>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    {/* Color Swatches */}
                                                    <div className="grid grid-cols-5 gap-2">
                                                        {palette.colors.map((color, i) => (
                                                            <Tooltip key={i}>
                                                                <TooltipTrigger asChild>
                                                                    <motion.button
                                                                        onClick={() => copyToClipboard(color)}
                                                                        className="relative aspect-square rounded-xl border-2 border-gray-200 hover:scale-110 transition-transform overflow-hidden group"
                                                                        style={{ backgroundColor: color }}
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                    >
                                                                        {copiedColor === color && (
                                                                            <motion.div
                                                                                initial={{ scale: 0 }}
                                                                                animate={{ scale: 1 }}
                                                                                className="absolute inset-0 bg-black/50 flex items-center justify-center"
                                                                            >
                                                                                <Check className="w-6 h-6 text-white" />
                                                                            </motion.div>
                                                                        )}
                                                                    </motion.button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="font-mono">{color}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ))}
                                                    </div>

                                                    {/* Export Options */}
                                                    <div className="flex gap-2 pt-2 border-t">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => exportPalette(palette, 'css')}
                                                            className="flex-1"
                                                        >
                                                            <Download className="w-4 h-4 mr-1" />
                                                            CSS
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => exportPalette(palette, 'json')}
                                                            className="flex-1"
                                                        >
                                                            <Download className="w-4 h-4 mr-1" />
                                                            JSON
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => exportPalette(palette, 'svg')}
                                                            className="flex-1"
                                                        >
                                                            <Download className="w-4 h-4 mr-1" />
                                                            SVG
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </TooltipProvider>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Copied Toast */}
                <AnimatePresence>
                    {copiedColor && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50"
                        >
                            <div className="w-6 h-6 rounded" style={{ backgroundColor: copiedColor }} />
                            <div>
                                <p className="font-semibold">Copied!</p>
                                <p className="text-sm text-gray-300 font-mono">{copiedColor}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
