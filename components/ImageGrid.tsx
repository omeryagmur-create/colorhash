'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, ExternalLink, Heart, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ImageGridProps {
    images: any[]
}

export default function ImageGrid({ images }: ImageGridProps) {
    const [copiedColor, setCopiedColor] = useState<string | null>(null)
    const [likedImages, setLikedImages] = useState<Set<string>>(new Set())

    const copyToClipboard = (color: string) => {
        navigator.clipboard.writeText(color)
        setCopiedColor(color)
        setTimeout(() => setCopiedColor(null), 2000)
    }

    const toggleLike = (imageId: string) => {
        setLikedImages(prev => {
            const newSet = new Set(prev)
            if (newSet.has(imageId)) {
                newSet.delete(imageId)
            } else {
                newSet.add(imageId)
            }
            return newSet
        })
    }

    if (images.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <svg className="w-16 h-16 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No images found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                    Try adjusting the sensitivity slider or using different colors to find matching images.
                </p>
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {images.map((image, index) => (
                        <motion.div
                            key={image.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:-translate-y-1">
                                {/* Image Container */}
                                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                                    <img
                                        src={image.urls.small}
                                        alt={image.alt_description || 'Color search result'}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="rounded-full bg-white/90 hover:bg-white"
                                                onClick={() => toggleLike(image.id)}
                                            >
                                                <Heart
                                                    className={`w-4 h-4 ${likedImages.has(image.id) ? 'fill-red-500 text-red-500' : ''}`}
                                                />
                                            </Button>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        variant="secondary"
                                                        className="rounded-full bg-white/90 hover:bg-white"
                                                        asChild
                                                    >
                                                        <a
                                                            href={image.urls.raw}
                                                            download
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Download Image</TooltipContent>
                                            </Tooltip>
                                        </div>

                                        {/* Color Swatches */}
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <div className="flex gap-2 flex-wrap justify-center">
                                                {image.dominantColors && Object.values(image.dominantColors)
                                                    .filter(c => c !== null)
                                                    .slice(0, 5)
                                                    .map((color: any, i: number) => (
                                                        <Tooltip key={i}>
                                                            <TooltipTrigger asChild>
                                                                <motion.button
                                                                    onClick={() => copyToClipboard(color)}
                                                                    className="relative w-10 h-10 rounded-full border-3 border-white shadow-lg hover:scale-125 transition-transform"
                                                                    style={{ backgroundColor: color }}
                                                                    whileHover={{ scale: 1.2 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                >
                                                                    {copiedColor === color && (
                                                                        <motion.div
                                                                            initial={{ scale: 0 }}
                                                                            animate={{ scale: 1 }}
                                                                            className="absolute inset-0 flex items-center justify-center"
                                                                        >
                                                                            <Copy className="w-4 h-4 text-white drop-shadow-lg" />
                                                                        </motion.div>
                                                                    )}
                                                                </motion.button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="font-mono">{color}</p>
                                                                <p className="text-xs text-gray-400">Click to copy</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Image Info */}
                                <div className="p-4 bg-white border-t">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {image.user?.profile_image?.small && (
                                                <img
                                                    src={image.user.profile_image.small}
                                                    alt={image.user.name}
                                                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                                                />
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {image.user?.name || 'Unknown'}
                                                </p>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <a
                                                            href={image.links?.html}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-gray-500 hover:text-purple-600 flex items-center gap-1"
                                                        >
                                                            View on Unsplash
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Open in new tab</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </div>
                                        <div
                                            className="w-8 h-8 rounded-lg border-2 border-gray-200 flex-shrink-0"
                                            style={{ backgroundColor: image.color }}
                                            title="Primary Color"
                                        />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

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
        </TooltipProvider>
    )
}
