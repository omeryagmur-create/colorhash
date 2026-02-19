'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  parseHexColors,
  generateHarmony,
  generateShades,
  generateTints,
  normalizeHex,
  ensureContrast,
  getContrastRatio,
  applyVibeToPalette,
  type Vibe
} from '@/lib/color-utils'
import { useRouter } from 'next/navigation'
import { Palette, AlertCircle, Wand2, Info } from 'lucide-react'
import tinycolor from 'tinycolor2'

interface ProjectSettings {
  name: string
  vibe: Vibe
  brightness: 'light' | 'dark' | 'mixed'
}

type SlotKey = 'background' | 'illustration' | 'accent' | 'textHeading' | 'textBody'

interface PaletteSlots {
  base: string
  background: string
  illustration: string
  accent: string
  textHeading: string
  textBody: string
}

const STORAGE_KEY = 'ch_palette_slots_v1'

export default function PalettePage() {
  const router = useRouter()
  const [rawInput, setRawInput] = useState('')
  const [base, setBase] = useState('#8B5CF6')
  const [slots, setSlots] = useState<PaletteSlots>({
    base: '#8B5CF6',
    background: '#F9FAFB',
    illustration: '#8B5CF6',
    accent: '#EC4899',
    textHeading: '#111827',
    textBody: '#4B5563',
  })
  const [error, setError] = useState('')
  const [contrastThreshold, setContrastThreshold] = useState([4.5])
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>({
    name: '',
    vibe: 'minimal',
    brightness: 'light',
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      // Load Project Settings
      const projectRaw = window.localStorage.getItem('ch_project_settings_v1')
      let currentVibe: Vibe = 'minimal'
      if (projectRaw) {
        const parsed = JSON.parse(projectRaw) as ProjectSettings
        setProjectSettings(parsed)
        currentVibe = parsed.vibe
      }

      // Load Palette
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as PaletteSlots
        setSlots(parsed)
        setBase(parsed.base || '#8B5CF6')
        setRawInput(parsed.base || '#8B5CF6')
      } else {
        // First time initialization: Apply logic based on vibe if available
        applyFromBase(slots.base, currentVibe)
        setRawInput(slots.base)
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateSettings = <K extends keyof ProjectSettings>(key: K, value: ProjectSettings[K]) => {
    const next = { ...projectSettings, [key]: value }
    setProjectSettings(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ch_project_settings_v1', JSON.stringify(next))
    }
    // Re-generate if settings change
    applyFromBase(base, next.vibe, next.brightness, contrastThreshold[0])
  }

  const saveSlots = (next: PaletteSlots) => {
    setSlots(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    }
  }

  const applyFromBase = (
    hex: string,
    vibe: Vibe = projectSettings.vibe,
    brightness: ProjectSettings['brightness'] = projectSettings.brightness,
    threshold: number = contrastThreshold[0]
  ) => {
    // 1. Apply Vibe Shift to the base color
    const { base: vibeBase } = applyVibeToPalette(hex, vibe)

    // 2. Generate harmonics from the vibe-adjusted base
    const harmony = generateHarmony(vibeBase)
    const shades = generateShades(vibeBase, 8)
    const tints = generateTints(vibeBase, 8)

    // 3. Smart Background based on Project Brightness + Vibe
    const prefBrightness = brightness
    let background = '#F9FAFB' // Default

    const baseColor = tinycolor(vibeBase)
    const hsl = baseColor.toHsl()

    if (prefBrightness === 'dark') {
      // Create a very dark version of the base color for the background
      background = tinycolor({ h: hsl.h, s: Math.min(hsl.s, 0.2), l: 0.08 }).toHexString()
    } else if (prefBrightness === 'mixed') {
      // A middle ground or vibe-specific
      if (vibe === 'retro') background = '#FDF8F1'
      else if (vibe === 'minimal') background = '#F3F4F6'
      else background = '#F9FAFB'
    } else {
      // Mostly Light: Create a very subtle tint of the base color
      background = tinycolor({ h: hsl.h, s: Math.min(hsl.s, 0.1), l: 0.98 }).toHexString()
    }

    // 4. Role Assignment
    // Illustration should pop - if background is dark, lighten it; if light, keep or saturate
    const isBgDark = tinycolor(background).isDark()
    const illustration = isBgDark
      ? tints[2] || vibeBase // Use a slightly lighter tint for dark mode
      : vibeBase

    // Accent should contrast with base and background
    const accentCandidate = vibe === 'playful'
      ? (harmony.triadic[1] || harmony.complementary)
      : harmony.complementary

    const accent = ensureContrast(accentCandidate, background, Math.max(threshold, 3.0))

    // 5. Contrast-aware text
    const targetHeadingCandidate = isBgDark ? tints[7] || '#FFFFFF' : shades[7] || '#111827'
    const targetBodyCandidate = isBgDark ? tints[5] || '#E5E7EB' : shades[5] || '#374151'

    const next: PaletteSlots = {
      base: hex,
      background,
      illustration,
      accent,
      textHeading: ensureContrast(targetHeadingCandidate, background, threshold),
      textBody: ensureContrast(targetBodyCandidate, background, threshold),
    }
    saveSlots(next)
  }

  const handleParse = () => {
    setError('')
    const parsed = parseHexColors(rawInput)
    if (parsed.length === 0) {
      setError('Please enter at least one valid HEX color.')
      return
    }
    const primary = parsed[0]
    setBase(primary)
    applyFromBase(primary, projectSettings.vibe, projectSettings.brightness)
  }

  const handleSlotChange = (slot: SlotKey, value: string) => {
    const normalized = normalizeHex(value) ?? value
    const next = { ...slots, [slot]: normalized }
    saveSlots(next)
  }

  const contrastWarnings = useMemo(() => {
    const pairs: Array<[string, string, string]> = [
      [slots.background, slots.textHeading, 'Heading on background'],
      [slots.background, slots.textBody, 'Body on background'],
    ]
    const results: string[] = []

    const luminance = (hex: string) => {
      const n = normalizeHex(hex) || '#000000'
      const r = parseInt(n.slice(1, 3), 16) / 255
      const g = parseInt(n.slice(3, 5), 16) / 255
      const b = parseInt(n.slice(5, 7), 16) / 255
      const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
      const R = toLinear(r)
      const G = toLinear(g)
      const B = toLinear(b)
      return 0.2126 * R + 0.7152 * G + 0.0722 * B
    }

    const contrast = (a: string, b: string) => {
      const L1 = luminance(a)
      const L2 = luminance(b)
      const lighter = Math.max(L1, L2)
      const darker = Math.min(L1, L2)
      return (lighter + 0.05) / (darker + 0.05)
    }

    const minRatio = contrastThreshold[0]

    for (const [bg, text, label] of pairs) {
      const ratio = contrast(bg, text)
      if (ratio < minRatio) {
        results.push(`${label} contrast is low (${ratio.toFixed(2)}:1). Try darkening text or lightening background.`)
      }
    }

    return results
  }, [slots, contrastThreshold])

  const handleContrastChange = (val: number[]) => {
    setContrastThreshold(val)
    // Re-apply contrast enforcement to current text roles
    const next = {
      ...slots,
      textHeading: ensureContrast(slots.textHeading, slots.background, val[0]),
      textBody: ensureContrast(slots.textBody, slots.background, val[0]),
    }
    saveSlots(next)
  }

  const handleFixContrast = () => {
    handleContrastChange(contrastThreshold)
  }

  const handleContinue = () => {
    router.push('/layouts')
  }

  const renderSwatch = (label: string, value: string, slot: SlotKey) => (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span className="font-medium">{label}</span>
        <span className="font-mono">{normalizeHex(value) ?? value}</span>
      </div>
      <div className="relative">
        <label className="cursor-pointer block">
          <div
            className="w-full h-16 rounded-xl border-2 border-transparent group-hover:border-purple-200 transition-all shadow-sm overflow-hidden relative"
            style={{ backgroundColor: normalizeHex(value) ?? value }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/10 backdrop-blur-[2px] transition-opacity">
              <div className="bg-white/90 p-1.5 rounded-lg shadow-sm border text-[10px] font-bold text-gray-600">
                Click to pick
              </div>
            </div>
            <input
              type="color"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              value={normalizeHex(value) ?? '#000000'}
              onChange={(e) => handleSlotChange(slot, e.target.value)}
            />
          </div>
        </label>
      </div>
      <Input
        value={value}
        onChange={(e) => handleSlotChange(slot, e.target.value)}
        placeholder="#RRGGBB"
        className="text-xs font-mono h-8"
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-16">
      <div className="container mx-auto px-4 max-w-5xl pt-10 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg">
            <Palette className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold">Palette & Roles</h1>
            <p className="text-sm text-gray-600">
              Assign colors to background, illustration, accent and text roles.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border-2 rounded-2xl shadow-sm">
            <Info className="w-4 h-4 text-purple-600" />
            <div className="text-xs">
              <span className="text-gray-500 font-medium">Context:</span>{' '}
              <span className="font-bold text-purple-700 capitalize">{projectSettings.vibe}</span>
              <span className="mx-1 text-gray-300">|</span>
              <span className="font-bold text-purple-700 capitalize">{projectSettings.brightness}</span>
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-xl">
          <CardHeader>
            <CardTitle>Base color or palette</CardTitle>
            <CardDescription>Paste your HEX colors; the first one becomes the base.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="#8B5CF6 #EC4899 #111827"
                className="flex-1"
              />
              <Button onClick={handleParse}>Generate from input</Button>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            <div className="pt-2 space-y-4">
              <div className="grid md:grid-cols-2 gap-4 border-t pt-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 flex items-center gap-1">
                    Vibe / Mood <Info className="w-2.5 h-2.5" />
                  </label>
                  <Select
                    value={projectSettings.vibe}
                    onValueChange={(v) => updateSettings('vibe', v as Vibe)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select vibe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="vibrant">Vibrant</SelectItem>
                      <SelectItem value="playful">Playful</SelectItem>
                      <SelectItem value="serious">Serious</SelectItem>
                      <SelectItem value="editorial">Editorial</SelectItem>
                      <SelectItem value="retro">Retro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500">
                    Light / Dark Balance
                  </label>
                  <Select
                    value={projectSettings.brightness}
                    onValueChange={(v) => updateSettings('brightness', v as ProjectSettings['brightness'])}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Mostly Light</SelectItem>
                      <SelectItem value="dark">Mostly Dark</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-2">Current base color</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full border shadow-md"
                    style={{ backgroundColor: normalizeHex(base) ?? base }}
                  />
                  <code className="px-2 py-1 rounded bg-gray-100 text-[10px] font-mono">
                    {normalizeHex(base) ?? base}
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-xl">
          <CardHeader>
            <CardTitle>Assign roles</CardTitle>
            <CardDescription>Tell the system which colors to use for each part of your slides.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {renderSwatch('Background', slots.background, 'background')}
              {renderSwatch('Illustration base', slots.illustration, 'illustration')}
              {renderSwatch('Accent', slots.accent, 'accent')}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {renderSwatch('Heading text', slots.textHeading, 'textHeading')}
              {renderSwatch('Body text', slots.textBody, 'textBody')}
            </div>
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Minimum contrast for text</p>
                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                  {contrastThreshold[0].toFixed(1)}:1
                </span>
              </div>
              <Slider
                value={contrastThreshold}
                onValueChange={handleContrastChange}
                min={3}
                max={7}
                step={0.5}
              />
              {contrastWarnings.length > 0 && (
                <div className="space-y-3 p-4 text-xs text-amber-700 bg-amber-50 border-2 border-amber-200 rounded-xl relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Contrast Issues Detected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFixContrast}
                      className="h-7 text-[10px] bg-white border-amber-200 hover:bg-amber-100 text-amber-800"
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      Auto-fix Accessibility
                    </Button>
                  </div>
                  {contrastWarnings.map((msg, i) => (
                    <p key={i} className="flex gap-1">
                      <span>•</span>
                      <span>{msg}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 px-8"
            onClick={handleContinue}
          >
            Continue to Layouts
          </Button>
        </div>
      </div>
    </div>
  )
}

