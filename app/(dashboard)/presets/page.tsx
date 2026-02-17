'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, Trash2, Download, FileText } from 'lucide-react'

interface PaletteSlots {
  base: string
  background: string
  illustration: string
  accent: string
  textHeading: string
  textBody: string
}

type LayoutType = 'cover' | 'case' | 'grid' | 'full-bleed'

interface LayoutPreset {
  id: string
  name: string
  type: LayoutType
  palette: PaletteSlots
}

const PRESET_KEY = 'ch_layout_preset_v1'

export default function PresetsPage() {
  const [preset, setPreset] = useState<LayoutPreset | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(PRESET_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as LayoutPreset
      setPreset(parsed)
    } catch {
      // ignore
    }
  }, [])

  const handleDelete = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(PRESET_KEY)
    }
    setPreset(null)
  }

  const handleExportTxt = () => {
    if (!preset) return
    const text = `COLORHASH PRESET: ${preset.name}
Layout: ${preset.type}

PALETTE:
Base: ${preset.palette.base}
Background: ${preset.palette.background}
Illustration: ${preset.palette.illustration}
Accent: ${preset.palette.accent}
Heading Text: ${preset.palette.textHeading}
Body Text: ${preset.palette.textBody}

Generated with ColorHash AI`

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'colorhash-preset.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExport = () => {
    if (!preset) return
    const data = JSON.stringify(
      {
        layout: preset.type,
        palette: preset.palette,
      },
      null,
      2
    )
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'colorhash-preset.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderPaletteRow = (label: string, hex: string) => (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded border" style={{ backgroundColor: hex }} />
        <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{hex}</code>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-16">
      <div className="container mx-auto px-4 max-w-4xl pt-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Preset</h1>
            <p className="text-sm text-gray-600">
              For now we keep a single layout + palette preset in your browser. You can export it as JSON and use it in
              Figma, Keynote, etc.
            </p>
          </div>
        </div>

        {!preset ? (
          <Card className="border-2 shadow-xl">
            <CardHeader>
              <CardTitle>No preset saved yet</CardTitle>
              <CardDescription>
                Go to the Layouts page, pick a layout and click &quot;Save layout & continue&quot; to create one.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card className="border-2 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                {preset.name}
              </CardTitle>
              <CardDescription>
                Layout type: <span className="font-mono">{preset.type}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700">Palette</h3>
                  <div className="space-y-1">
                    {renderPaletteRow('Base', preset.palette.base)}
                    {renderPaletteRow('Background', preset.palette.background)}
                    {renderPaletteRow('Illustration', preset.palette.illustration)}
                    {renderPaletteRow('Accent', preset.palette.accent)}
                    {renderPaletteRow('Heading text', preset.palette.textHeading)}
                    {renderPaletteRow('Body text', preset.palette.textBody)}
                  </div>
                </div>
                <div className="space-y-3 text-xs text-gray-600">
                  <p className="font-semibold text-gray-800">How to use this preset</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Export as JSON and attach it to your project.</li>
                    <li>Recreate these roles as color styles in Figma / Sketch.</li>
                    <li>Use background + illustration + accent for slide blocks and shapes.</li>
                    <li>Keep heading/body contrast high for readability.</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 border-red-200">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete preset
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportTxt} className="font-bold">
                    <FileText className="w-4 h-4 mr-1 text-blue-500" />
                    Export TXT
                  </Button>
                  <Button size="sm" onClick={handleExport} className="bg-gradient-to-r from-purple-600 to-pink-500 font-bold">
                    <Download className="w-4 h-4 mr-1" />
                    Export JSON
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

