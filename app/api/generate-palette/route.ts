import { NextRequest, NextResponse } from 'next/server'
import { generateHarmony, generateShades, generateTints } from '@/lib/color-utils'

// Industry-specific base colors
const industryColors: Record<string, string[]> = {
    tech: ['#667eea', '#764ba2', '#00d4ff', '#5f72bd'],
    fashion: ['#ff6b9d', '#c44569', '#f8b500', '#3c40c6'],
    food: ['#ff6348', '#ffa502', '#26de81', '#fc5c65'],
    health: ['#45aaf2', '#4bcffa', '#20bf6b', '#0fb9b1'],
    finance: ['#2c3e50', '#3498db', '#16a085', '#2980b9'],
    education: ['#f39c12', '#e67e22', '#3498db', '#9b59b6'],
    entertainment: ['#e74c3c', '#fd79a8', '#fdcb6e', '#6c5ce7'],
    travel: ['#00b894', '#0984e3', '#fdcb6e', '#00cec9'],
    'real-estate': ['#2d3436', '#636e72', '#b2bec3', '#74b9ff'],
    sports: ['#00b894', '#ff7675', '#fdcb6e', '#74b9ff'],
}



// Palette name generators
const paletteNames: Record<string, string[]> = {
    tech: ['Digital Dream', 'Future Forward', 'Cyber Pulse', 'Innovation Wave'],
    fashion: ['Runway Ready', 'Chic Essence', 'Style Statement', 'Vogue Vision'],
    food: ['Culinary Delight', 'Taste Sensation', 'Fresh Flavors', 'Gourmet Palette'],
    health: ['Wellness Wave', 'Vital Energy', 'Health Harmony', 'Pure Balance'],
    finance: ['Trust Foundation', 'Wealth Wisdom', 'Secure Growth', 'Financial Focus'],
    education: ['Learning Light', 'Knowledge Path', 'Academic Excellence', 'Bright Minds'],
    entertainment: ['Show Stopper', 'Entertainment Elite', 'Stage Lights', 'Creative Spark'],
    travel: ['Wanderlust', 'Journey Colors', 'Adventure Awaits', 'Globe Trotter'],
    'real-estate': ['Property Pride', 'Home Haven', 'Estate Elegance', 'Foundation Forte'],
    sports: ['Victory Vibe', 'Athletic Energy', 'Championship Colors', 'Team Spirit'],
}

export async function POST(request: NextRequest) {
    try {
        const { industry, vibe, harmony } = await request.json()

        // Get base colors for industry
        const baseColors = industryColors[industry] || industryColors.tech

        // Generate multiple palettes
        const palettes = []

        for (let i = 0; i < 4; i++) {
            const baseColor = baseColors[i % baseColors.length]

            let colors: string[] = []

            // Generate colors based on harmony type
            switch (harmony) {
                case 'complementary':
                    const harmonyColors = generateHarmony(baseColor)
                    colors = [
                        baseColor,
                        harmonyColors.complementary,
                        harmonyColors.analogous[0],
                        harmonyColors.triadic[0],
                        harmonyColors.triadic[1],
                    ]
                    break

                case 'analogous':
                    const analogous = generateHarmony(baseColor).analogous
                    colors = [baseColor, ...analogous, ...generateShades(baseColor, 2)]
                    break

                case 'triadic':
                    const triadic = generateHarmony(baseColor).triadic
                    colors = [baseColor, ...triadic, ...generateTints(baseColor, 2)]
                    break

                case 'tetradic':
                    const tetradicBase = generateHarmony(baseColor)
                    colors = [
                        baseColor,
                        tetradicBase.complementary,
                        tetradicBase.triadic[0],
                        tetradicBase.triadic[1],
                        tetradicBase.analogous[0],
                    ]
                    break

                case 'monochromatic':
                    colors = [baseColor, ...generateShades(baseColor, 2), ...generateTints(baseColor, 2)]
                    break

                default:
                    colors = [baseColor, ...generateShades(baseColor, 4)]
            }

            // Apply vibe adjustments
            if (vibe) {
                colors = colors.map(c => {
                    switch (vibe) {
                        case 'vintage': return adjustSaturation(c, -30)
                        case 'playful': return adjustSaturation(c, 20)
                        case 'professional': return adjustSaturation(adjustBrightness(c, -5), -20)
                        case 'minimalist': return adjustSaturation(adjustBrightness(c, 10), -40)
                        case 'bold': return adjustSaturation(c, 40)
                        case 'luxury': return adjustBrightness(adjustSaturation(c, -10), -15)
                        case 'eco': return shiftTowardsGreen(c)
                        default: return c
                    }
                })
            }

            // Get palette name
            const nameList = paletteNames[industry] || paletteNames.tech
            const paletteName = nameList[i % nameList.length]

            palettes.push({
                id: `palette-${Date.now()}-${i}`,
                name: paletteName,
                colors: colors.slice(0, 5), // Ensure exactly 5 colors
                industry,
                vibe,
                harmony,
            })
        }

        return NextResponse.json({ palettes })
    } catch (error) {
        console.error('Palette generation error:', error)
        return NextResponse.json({ error: 'Failed to generate palettes' }, { status: 500 })
    }
}

// Helper functions
function adjustBrightness(hex: string, percent: number): string {
    const rgb = hexToRgb(hex)
    const adjust = (val: number) => Math.max(0, Math.min(255, val + (val * percent / 100)))

    return rgbToHex(
        Math.round(adjust(rgb.r)),
        Math.round(adjust(rgb.g)),
        Math.round(adjust(rgb.b))
    )
}

function adjustSaturation(hex: string, percent: number): string {
    const rgb = hexToRgb(hex)
    const gray = (rgb.r + rgb.g + rgb.b) / 3
    const adjust = (val: number) => {
        const diff = val - gray
        return Math.max(0, Math.min(255, gray + diff * (1 + percent / 100)))
    }

    return rgbToHex(
        Math.round(adjust(rgb.r)),
        Math.round(adjust(rgb.g)),
        Math.round(adjust(rgb.b))
    )
}

function shiftTowardsGreen(hex: string): string {
    const rgb = hexToRgb(hex)
    return rgbToHex(
        Math.max(0, rgb.r - 10),
        Math.min(255, rgb.g + 20),
        Math.max(0, rgb.b - 10)
    )
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
}

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}
