'use client'

import { useEffect, useState } from 'react'
import { parseHexColors } from '@/lib/color-utils'
import ImageGrid from '@/components/ImageGrid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Search, Sparkles, AlertCircle, Images } from 'lucide-react'

const PALETTE_KEY = 'ch_palette_slots_v1'

interface PaletteSlots {
  base: string
  background: string
  illustration: string
  accent: string
  textHeading: string
  textBody: string
}

export default function AssetsPage() {
  const [hexInput, setHexInput] = useState('')
  const [validColors, setValidColors] = useState<string[]>([])
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [threshold, setThreshold] = useState([80])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(PALETTE_KEY)
      let palette: PaletteSlots

      if (raw) {
        palette = JSON.parse(raw) as PaletteSlots
      } else {
        // Default fallback
        palette = {
          base: '#8B5CF6',
          background: '#F9FAFB',
          illustration: '#8B5CF6',
          accent: '#EC4899',
          textHeading: '#111827',
          textBody: '#4B5563',
        }
      }

      const basis = [palette.illustration, palette.accent].filter(Boolean).join(' ')
      setHexInput(basis)
      setValidColors(parseHexColors(basis))
    } catch {
      // ignore
    }
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    setError('')
    setImages([])

    const colors = parseHexColors(hexInput)

    if (colors.length === 0) {
      setError('Please enter at least one valid HEX color')
      setLoading(false)
      return
    }

    setValidColors(colors)

    try {
      const response = await fetch('/api/search-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hexColors: hexInput,
          threshold: threshold[0],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to search')
      } else {
        setImages(data.images)
      }
    } catch (err) {
      setError('Failed to search images')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-20">
      <div className="container mx-auto px-4 max-w-7xl py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Palette-aware asset suggestions
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
            Find Supporting Assets
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Search Unsplash, Pexels and Pixabay for backgrounds and illustrations that match your current palette.
          </p>
        </div>

        {/* Search Card */}
        <Card className="mb-12 border-2 shadow-xl max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Images className="w-6 h-6 text-purple-600" />
              Palette colors
            </CardTitle>
            <CardDescription className="text-base">
              We pre-fill illustration + accent from your Palette page, but you can edit freely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input Area */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={hexInput}
                  onChange={(e) => setHexInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="#8B5CF6 #EC4899"
                  className="text-lg h-14 border-2 focus-visible:ring-purple-500"
                />
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 px-8 h-14"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Color Preview */}
            {validColors.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Using these colors:</p>
                <div className="flex gap-3 flex-wrap">
                  {validColors.map((color, i) => (
                    <div key={i} className="group relative">
                      <div
                        className="w-16 h-16 rounded-xl shadow-md border-4 border-white ring-2 ring-gray-200 hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: color }}
                      />
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {color}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Threshold Slider */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Match sensitivity</label>
                <span className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                  {threshold[0]}
                </span>
              </div>
              <Slider
                value={threshold}
                onValueChange={setThreshold}
                min={20}
                max={150}
                step={5}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-600" />
                  Strict
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-pink-500" />
                  Loose
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-lg font-medium text-gray-600">Searching for matching assets...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {images.length > 0 && (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Results</h2>
                <p className="text-gray-600">
                  Click color swatches on each image to copy HEX codes while designing your slides.
                </p>
              </div>
            )}
            <ImageGrid images={images} />
          </div>
        )}
      </div>
    </div>
  )
}

