import axios from 'axios'

/**
 * Public image types returned by external APIs
 * These are kept close to the raw API responses but only
 * include the fields we actually use in the app.
 */
export interface UnsplashImage {
    id: string
    urls: {
        raw: string
        full: string
        regular: string
        small: string
        thumb: string
    }
    user: {
        name: string
        username: string
        profile_image?: {
            small: string
        }
    }
    links?: {
        html: string
    }
    description: string | null
    alt_description: string | null
    /**
     * Primary color provided by Unsplash for this image (HEX).
     * We treat this as our base color and derive a simple palette from it.
     */
    color: string
}

export interface PexelsImage {
    id: number
    src: {
        original: string
        large2x: string
        large: string
        medium: string
        small: string
    }
    photographer: string
    /**
     * Average color provided by Pexels for this image (HEX).
     * We treat this as our base color and derive a simple palette from it.
     */
    avg_color: string
}

export interface PixabayImage {
    id: number
    pageURL: string
    type: string
    tags: string
    previewURL: string
    webformatURL: string
    largeImageURL: string
    user: string
    userImageURL: string
    /**
     * Pixabay does not provide a HEX color; we'll approximate
     * using a lightweight heuristic on demand.
     */
}

/**
 * Internal, high-level color descriptor used across the app.
 * NOTE: This is not a "true" multi-sample palette; we derive it
 * deterministically from the single HEX color that the APIs give us.
 */
export interface DominantColors {
    vibrant: string
    darkVibrant: string
    lightVibrant: string
    muted: string
    darkMuted: string
    lightMuted: string
    complementary: string
    analogous1: string
    analogous2: string
}

/**
 * Unified image shape returned by /api/search-images.
 * This is what the UI (ImageGrid) expects.
 */
export interface ColorSearchResultImage {
    id: string
    urls: {
        raw: string
        full: string
        regular: string
        small: string
        thumb: string
    }
    user: {
        name: string
        username: string
        profile_image?: {
            small: string
        }
    }
    links: {
        html: string
    }
    description: string | null
    alt_description: string | null
    color: string
    dominantColors: DominantColors
    /**
     * Source of the image, used only for debugging/metrics.
     */
    source: 'unsplash' | 'pexels' | 'pixabay'
}

/**
 * Search Unsplash for images.
 *
 * This is a thin wrapper over the HTTP API; all "smart" logic
 * happens in the API route, not here.
 */
export async function searchUnsplash(
    query: string,
    page: number = 1,
    perPage: number = 30,
    color?: string
): Promise<UnsplashImage[]> {
    try {
        const response = await axios.get('https://api.unsplash.com/search/photos', {
            params: {
                query,
                page,
                per_page: perPage,
                order_by: 'relevant',
                color: color || (query.startsWith('#') ? undefined : query),
            },
            headers: {
                Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
            },
        })

        return response.data.results as UnsplashImage[]
    } catch (error) {
        console.error('Unsplash API error:', error)
        return []
    }
}

/**
 * Search Pexels for images (fallback).
 */
export async function searchPexels(
    query: string,
    page: number = 1,
    perPage: number = 30
): Promise<PexelsImage[]> {
    try {
        const response = await axios.get('https://api.pexels.com/v1/search', {
            params: {
                query,
                page,
                per_page: perPage,
            },
            headers: {
                Authorization: process.env.PEXELS_API_KEY,
            },
        })

        return response.data.photos as PexelsImage[]
    } catch (error) {
        console.error('Pexels API error:', error)
        return []
    }
}

/**
 * Search Pixabay for images (photos + illustrations + vectors).
 * Requires PIXABAY_API_KEY in env; if it's missing, this function
 * safely returns an empty array so the rest of the pipeline still works.
 */
export async function searchPixabay(
    query: string,
    page: number = 1,
    perPage: number = 30,
): Promise<PixabayImage[]> {
    const key = process.env.PIXABAY_API_KEY
    if (!key) {
        // Graceful no-op when key is not configured.
        return []
    }

    try {
        const response = await axios.get('https://pixabay.com/api/', {
            params: {
                key,
                q: query,
                page,
                per_page: perPage,
                safesearch: true,
                image_type: 'all', // photos + illustrations + vectors
                orientation: 'horizontal',
            },
        })

        return (response.data.hits ?? []) as PixabayImage[]
    } catch (error) {
        console.error('Pixabay API error:', error)
        return []
    }
}

/**
 * Derive a simple palette from the single HEX color Unsplash gives us.
 * This is intentionally lightweight and deterministic – no heavy image
 * processing, suitable for a free personal tool without auth/limits.
 */
export async function buildDominantColorsFromUnsplash(image: UnsplashImage): Promise<DominantColors | null> {
    try {
        const primaryColor = image.color || '#000000'
        return buildDerivedPalette(primaryColor)
    } catch (error) {
        console.error('Color extraction error (Unsplash):', error)
        return null
    }
}

/**
 * Derive a simple palette from the single HEX color Pexels gives us.
 */
export async function buildDominantColorsFromPexels(image: PexelsImage): Promise<DominantColors | null> {
    try {
        const primaryColor = image.avg_color || '#000000'
        return buildDerivedPalette(primaryColor)
    } catch (error) {
        console.error('Color extraction error (Pexels):', error)
        return null
    }
}

/**
 * Derive a simple palette for Pixabay images.
 * Since Pixabay does not provide a ready-made HEX color, we
 * approximate by sampling from a fixed small set of "neutral"
 * base colors based on the image ID hash. This keeps it
 * deterministic and cheap until we add real pixel analysis.
 */
export async function buildDominantColorsFromPixabay(image: PixabayImage): Promise<DominantColors | null> {
    // Pixabay doesn't give colors. To avoid "feeling random", 
    // we return null here which signals the API route 
    // to skip this image if strict color matching is required.
    return null
}

/**
 * Shared helper to build a "fake palette" from one HEX color.
 * We slightly adjust brightness and saturation to get a spread
 * of related swatches that feel like a small system.
 */
function buildDerivedPalette(primaryColor: string): DominantColors {
    const complementary = getComplementaryColor(primaryColor)
    const analogous = getAnalogousColors(primaryColor)

    return {
        vibrant: primaryColor,
        darkVibrant: adjustBrightness(primaryColor, -30),
        lightVibrant: adjustBrightness(primaryColor, 30),
        muted: adjustSaturation(primaryColor, -30),
        darkMuted: adjustBrightness(adjustSaturation(primaryColor, -30), -30),
        lightMuted: adjustBrightness(adjustSaturation(primaryColor, -30), 30),
        complementary,
        analogous1: analogous[0],
        analogous2: analogous[1],
    }
}

// Helper functions for color manipulation (kept local to this module)
function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : { r: 0, g: 0, b: 0 }
}

function rgbToHex(r: number, g: number, b: number): string {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

function adjustBrightness(hex: string, percent: number): string {
    const rgb = hexToRgb(hex)
    const adjust = (val: number) => Math.max(0, Math.min(255, val + (val * percent) / 100))

    return rgbToHex(Math.round(adjust(rgb.r)), Math.round(adjust(rgb.g)), Math.round(adjust(rgb.b)))
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
        Math.round(adjust(rgb.b)),
    )
}

function getComplementaryColor(hex: string): string {
    const rgb = hexToRgb(hex)
    return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b)
}

function getAnalogousColors(hex: string): [string, string] {
    // Very lightweight "analogous" approximation using brightness shifts.
    return [adjustBrightness(hex, 15), adjustBrightness(hex, -15)]
}
