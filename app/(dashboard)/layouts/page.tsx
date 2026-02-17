'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LayoutTemplate, ArrowRight, Settings2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { normalizeHex } from '@/lib/color-utils'

interface PaletteSlots {
  base: string
  background: string
  illustration: string
  accent: string
  textHeading: string
  textBody: string
}

const PALETTE_KEY = 'ch_palette_slots_v1'
const PRESET_KEY = 'ch_layout_preset_v1'

type LayoutType = 'cover' | 'case' | 'grid' | 'full-bleed'

interface LayoutPreset {
  id: string
  name: string
  type: LayoutType
  palette: PaletteSlots
}

const mockLayouts: { id: LayoutType; name: string; description: string }[] = [
  {
    id: 'cover',
    name: 'Cover slide',
    description: 'Big title, single illustration on the side, plenty of negative space.',
  },
  {
    id: 'case',
    name: 'Case study detail',
    description: 'Split layout with text on the left and example work on the right.',
  },
  {
    id: 'grid',
    name: 'Work grid',
    description: '3×2 or 3×3 grid of pieces, subtle background and accent captions.',
  },
  {
    id: 'full-bleed',
    name: 'Full-bleed hero',
    description: 'Large illustration / screenshot with overlayed title and accent tag.',
  },
]

export default function LayoutsPage() {
  const router = useRouter()
  const [palette, setPalette] = useState<PaletteSlots | null>(null)
  const [selected, setSelected] = useState<LayoutType>('cover')

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(PALETTE_KEY)
      if (raw) {
        setPalette(JSON.parse(raw) as PaletteSlots)
        return
      }

      // Default palette fallback to make the page functional immediately
      const defaultPalette: PaletteSlots = {
        base: '#8B5CF6',
        background: '#F9FAFB',
        illustration: '#8B5CF6',
        accent: '#EC4899',
        textHeading: '#111827',
        textBody: '#4B5563',
      }
      setPalette(defaultPalette)
    } catch {
      // ignore
    }
  }, [])

  const updatePalette = (next: PaletteSlots) => {
    setPalette(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PALETTE_KEY, JSON.stringify(next))
    }
  }

  const handleColorChange = (role: keyof PaletteSlots, value: string) => {
    if (!palette) return
    const normalized = normalizeHex(value) ?? value
    const next = { ...palette, [role]: normalized }
    updatePalette(next)
  }

  const handleSavePreset = () => {
    if (!palette) return
    const preset: LayoutPreset = {
      id: `${selected}-${Date.now()}`,
      name: mockLayouts.find((l) => l.id === selected)?.name ?? 'Layout preset',
      type: selected,
      palette,
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PRESET_KEY, JSON.stringify(preset))
    }
    router.push('/presets')
  }

  const renderMockSlide = (type: LayoutType) => {
    if (!palette) {
      return (
        <div className="aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
          Set a palette first on the Palette page.
        </div>
      )
    }

    const bg = palette.background
    const ill = palette.illustration
    const accent = palette.accent
    const heading = palette.textHeading
    const body = palette.textBody

    if (type === 'cover') {
      return (
        <div className="aspect-[4/3] rounded-2xl border shadow-md overflow-hidden" style={{ backgroundColor: bg }}>
          <div className="w-full h-full flex">
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div
                  className="inline-flex px-3 py-1 rounded-full text-[10px] font-semibold mb-3"
                  style={{ backgroundColor: accent, color: bg }}
                >
                  Portfolio 2026
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: heading }}>
                  Illustration & Visual Storytelling
                </h3>
                <p className="text-xs" style={{ color: body }}>
                  High-level concept description and vibe.
                </p>
              </div>
              <div className="h-1 rounded-full opacity-60" style={{ backgroundColor: accent }} />
            </div>
            <div className="flex gap-2 items-center">
              <div
                className="w-32 h-32 rounded-3xl shadow-xl transition-transform hover:scale-105"
                style={{ backgroundColor: ill, borderColor: bg, borderWidth: 4 }}
              />
              {/* Visual accent element */}
              <div className="flex flex-col gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                <div className="w-2 h-8 rounded-full opacity-40" style={{ backgroundColor: accent }} />
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (type === 'case') {
      return (
        <div className="aspect-[4/3] rounded-2xl border shadow-md overflow-hidden" style={{ backgroundColor: bg }}>
          <div className="w-full h-full flex">
            <div className="flex-[1.1] p-6 flex flex-col gap-3">
              <h3 className="text-base font-bold" style={{ color: heading }}>
                Project overview
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: body }}>
                Use this layout to explain the problem, your approach and the outcome alongside a key visual.
              </p>
              <ul className="text-[11px] space-y-2" style={{ color: body }}>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full ring-2 ring-offset-2" style={{ backgroundColor: accent }}></span>
                  Challenge
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }}></span>
                  Solution
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }}></span>
                  Role & tools
                </li>
              </ul>
            </div>
            <div className="flex-[0.9] p-6 flex flex-col gap-3">
              <div className="flex-1 rounded-xl shadow-inner" style={{ backgroundColor: ill }} />
              <div className="flex gap-2 items-center">
                <div className="flex-1 h-2 rounded-full opacity-70" style={{ backgroundColor: accent }} />
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transform translate-y-2 border-2"
                  style={{ borderColor: accent, backgroundColor: accent }}
                >
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (type === 'grid') {
      return (
        <div className="aspect-[4/3] rounded-2xl border shadow-md overflow-hidden" style={{ backgroundColor: bg }}>
          <div className="w-full h-full flex flex-col p-4 gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold" style={{ color: heading }}>
                Selected work
              </h3>
              <div
                className="text-[10px] px-2 py-1 rounded-full font-semibold"
                style={{ backgroundColor: accent, color: bg }}
              >
                Grid layout
              </div>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-lg shadow-sm transition-all ${i === 2 ? 'ring-2 ring-offset-1 ring-opacity-100' : ''}`}
                  style={{
                    backgroundColor: i === 2 ? accent : (i % 2 === 0 ? ill : bg),
                    borderColor: i === 2 ? accent : 'transparent'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )
    }

    // full-bleed
    return (
      <div className="aspect-[4/3] rounded-2xl border shadow-md overflow-hidden relative" style={{ backgroundColor: bg }}>
        <div className="absolute inset-0" style={{ backgroundColor: ill, opacity: 0.9 }} />
        <div className="relative h-full w-full p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-bold mb-1" style={{ color: heading }}>
                Hero illustration
              </h3>
              <p className="text-xs max-w-xs" style={{ color: body }}>
                Great for bold opening slides and full-screen Behance / Dribbble shots.
              </p>
            </div>
            <div
              className="px-3 py-1 rounded-full text-[10px] font-semibold"
              style={{ backgroundColor: accent, color: bg }}
            >
              Full-bleed
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="w-20 h-1 rounded-full opacity-70" style={{ backgroundColor: bg }} />
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: bg }} />
              <div className="w-1.5 h-1.5 rounded-full opacity-60" style={{ backgroundColor: bg }} />
              <div className="w-1.5 h-1.5 rounded-full opacity-40" style={{ backgroundColor: bg }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-16">
      <div className="container mx-auto px-4 max-w-6xl pt-10 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg">
            <LayoutTemplate className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Layout ideas</h1>
            <p className="text-sm text-gray-600">
              See how your palette behaves on different slide types before you commit.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[240px,1fr,240px] gap-6 items-start">
          {/* Left Panel: Layout Selection */}
          <Card className="border-2 shadow-xl">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Layouts</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-4 space-y-2">
              {mockLayouts.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => setSelected(layout.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${selected === layout.id
                    ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <div className="font-semibold">{layout.name}</div>
                  <div className="text-[10px] text-gray-500 leading-tight">{layout.description}</div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Center: Preview */}
          <div className="space-y-4">
            <Card className="border-2 shadow-2xl overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b py-4">
                <CardTitle className="text-lg flex items-center justify-between">
                  Live Preview
                  <span className="text-xs font-normal text-gray-500 px-2 py-0.5 bg-white border rounded">
                    {mockLayouts.find(l => l.id === selected)?.name}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {renderMockSlide(selected)}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 px-8 shadow-lg shadow-purple-100"
                onClick={handleSavePreset}
              >
                Continue to Assets
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Right Panel: Manual Color Adjustments */}
          <Card className="border-2 shadow-xl sticky top-24">
            <CardHeader className="py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-purple-600" />
                Fine-tune
              </CardTitle>
              <CardDescription className="text-xs">Adjust colors manually</CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-4 space-y-4">
              {[
                { label: 'Background', role: 'background' },
                { label: 'Illustration', role: 'illustration' },
                { label: 'Accent', role: 'accent' },
                { label: 'Heading', role: 'textHeading' },
                { label: 'Body Text', role: 'textBody' },
              ].map((item) => (
                <div key={item.role} className="space-y-1.5 group">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500">
                      {item.label}
                    </label>
                    <div className="relative">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-200 cursor-pointer hover:scale-110 transition-transform shadow-sm"
                        style={{ backgroundColor: palette?.[item.role as keyof PaletteSlots] }}
                      />
                      <input
                        type="color"
                        className="absolute inset-0 opacity-0 cursor-pointer w-4 h-4"
                        value={normalizeHex(palette?.[item.role as keyof PaletteSlots] || '#000000') ?? '#000000'}
                        onChange={(e) => handleColorChange(item.role as keyof PaletteSlots, e.target.value)}
                      />
                    </div>
                  </div>
                  <Input
                    className="h-8 text-[11px] font-mono group-hover:border-purple-200 transition-colors"
                    value={palette?.[item.role as keyof PaletteSlots] || ''}
                    onChange={(e) => handleColorChange(item.role as keyof PaletteSlots, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

