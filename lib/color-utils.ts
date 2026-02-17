import tinycolor from 'tinycolor2'

export interface ColorRGB {
    r: number
    g: number
    b: number
}

/**
 * Validate and normalize HEX color
 * Supports #RGB and #RRGGBB formats
 */
export function normalizeHex(hex: string): string | null {
    const cleaned = hex.trim().replace(/^#/, '')

    // Validate RGB format (3 chars)
    if (/^[0-9A-Fa-f]{3}$/.test(cleaned)) {
        return `#${cleaned.split('').map(c => c + c).join('')}`
    }

    // Validate RRGGBB format (6 chars)
    if (/^[0-9A-Fa-f]{6}$/.test(cleaned)) {
        return `#${cleaned}`
    }

    return null
}

/**
 * Parse multiple HEX colors from input
 * Example: "#FF5733 #000000 #FFD700"
 */
export function parseHexColors(input: string): string[] {
    const hexPattern = /#?[0-9A-Fa-f]{3,6}/g
    const matches = input.match(hexPattern) || []

    return matches
        .map(normalizeHex)
        .filter((hex): hex is string => hex !== null)
}

/**
 * Convert HEX to RGB
 */
export function hexToRgb(hex: string): ColorRGB {
    const color = tinycolor(hex)
    const rgb = color.toRgb()
    return { r: rgb.r, g: rgb.g, b: rgb.b }
}

/**
 * Calculate color distance using Euclidean distance in RGB space
 */
export function colorDistance(color1: ColorRGB, color2: ColorRGB): number {
    const rDiff = color1.r - color2.r
    const gDiff = color1.g - color2.g
    const bDiff = color1.b - color2.b

    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff)
}

/**
 * Check if color is close enough (within threshold)
 * Default threshold: 80 (out of max ~441)
 */
export function isColorMatch(
    targetColor: ColorRGB,
    imageColor: ColorRGB,
    threshold: number = 80
): boolean {
    return colorDistance(targetColor, imageColor) <= threshold
}

/**
 * Calculate WCAG contrast ratio between two colors
 */
export function getContrastRatio(fg: string, bg: string): number {
    return tinycolor.readability(fg, bg)
}

/**
 * Adjust a color to ensure it meets a target contrast ratio against a background
 */
export function ensureContrast(fg: string, bg: string, targetRatio: number = 4.5): string {
    const fgColor = tinycolor(fg)
    const bgColor = tinycolor(bg)

    // If already meets ratio, return as is
    if (tinycolor.readability(fg, bg) >= targetRatio) {
        return fg
    }

    // Determine if we should lighten or darken
    // If background is dark, we should likely lighten the foreground, and vice versa
    const isBgDark = bgColor.isDark()

    let result = fgColor.clone()
    let step = 1
    let iterations = 0

    while (tinycolor.readability(result.toHexString(), bg) < targetRatio && iterations < 100) {
        if (isBgDark) {
            result = result.lighten(step)
        } else {
            result = result.darken(step)
        }
        iterations++
    }

    return result.toHexString()
}

/**
 * Generate color harmonies
 */
export function generateHarmony(baseHex: string) {
    const color = tinycolor(baseHex)

    return {
        complementary: color.complement().toHexString(),
        analogous: color.analogous(3).map(c => c.toHexString()),
        triadic: color.triad().map(c => c.toHexString()),
        splitComplementary: color.splitcomplement().map(c => c.toHexString()),
        monochromatic: color.monochromatic(5).map(c => c.toHexString()),
    }
}

export type Vibe = 'minimal' | 'vibrant' | 'playful' | 'serious' | 'editorial' | 'retro'

/**
 * Adjust a base color and its derivatives based on a design vibe
 */
export function applyVibeToPalette(hex: string, vibe: Vibe): {
    base: string
    saturationShift: number
    brightnessShift: number
} {
    const color = tinycolor(hex)
    let saturationShift = 0
    let brightnessShift = 0

    switch (vibe) {
        case 'minimal':
            saturationShift = -20
            brightnessShift = 10
            break
        case 'vibrant':
            saturationShift = 30
            brightnessShift = 5
            break
        case 'playful':
            saturationShift = 15
            brightnessShift = 10
            break
        case 'serious':
            saturationShift = -10
            brightnessShift = -10
            break
        case 'editorial':
            saturationShift = -5
            brightnessShift = 0
            break
        case 'retro':
            saturationShift = -10
            brightnessShift = -5
            break
    }

    const adjusted = color.clone()
    if (saturationShift > 0) adjusted.saturate(saturationShift)
    else adjusted.desaturate(Math.abs(saturationShift))

    if (brightnessShift > 0) adjusted.lighten(brightnessShift)
    else adjusted.darken(Math.abs(brightnessShift))

    return {
        base: adjusted.toHexString(),
        saturationShift,
        brightnessShift
    }
}

/**
 * Convert HEX to a generic color name for human-readable search queries
 */
export function getColorName(hex: string): string {
    const color = tinycolor(hex)
    const hsl = color.toHsl()
    const { h, s, l } = hsl

    if (l < 0.15) return 'black'
    if (l > 0.85) return 'white'
    if (s < 0.15) return 'gray'

    if (h < 30) return 'red'
    if (h < 60) return 'orange'
    if (h < 90) return 'yellow'
    if (h < 150) return 'green'
    if (h < 210) return 'teal'
    if (h < 270) return 'blue'
    if (h < 300) return 'purple'
    if (h < 330) return 'pink'
    return 'red'
}

/**
 * Map generic color names to Unsplash-supported color parameters
 */
export function getUnsplashColorParam(hex: string): string | undefined {
    const name = getColorName(hex)
    const supported = [
        'black', 'white', 'yellow', 'orange', 'red',
        'purple', 'magenta', 'green', 'teal', 'blue'
    ]
    if (name === 'pink') return 'magenta'
    if (supported.includes(name)) return name
    return undefined
}

/**
 * Generate shades and tints with more professional spacing
 */
export function generateShades(baseHex: string, count: number = 5): string[] {
    const shades: string[] = []
    for (let i = 1; i <= count; i++) {
        // Use a non-linear darken to get better professional tones (900, 800, etc)
        const amount = i * 12 // Slightly tighter steps
        shades.push(tinycolor(baseHex).darken(amount).toHexString())
    }
    return shades
}

export function generateTints(baseHex: string, count: number = 5): string[] {
    const tints: string[] = []
    for (let i = 1; i <= count; i++) {
        const amount = i * 12
        tints.push(tinycolor(baseHex).lighten(amount).toHexString())
    }
    return tints
}
