import { NextRequest, NextResponse } from 'next/server'
import {
    searchUnsplash,
    searchPexels,
    searchPixabay,
    buildDominantColorsFromUnsplash,
    buildDominantColorsFromPexels,
    buildDominantColorsFromPixabay,
    type ColorSearchResultImage,
} from '@/lib/image-api'
import { parseHexColors, hexToRgb, isColorMatch, getColorName, getUnsplashColorParam } from '@/lib/color-utils'

/**
 * Request body for /api/search-images
 */
interface SearchImagesRequestBody {
    /**
     * String containing one or more HEX codes (e.g. "#FF5733 #000000").
     */
    hexColors: string
    /**
     * Page number for external APIs (1-based).
     */
    page?: number
    /**
     * Match sensitivity (Euclidean distance in RGB space).
     * Lower = stricter color match. Reasonable range: 20–150.
     */
    threshold?: number
}

/**
 * Response shape for /api/search-images
 */
interface SearchImagesResponseBody {
    images: ColorSearchResultImage[]
    page: number
    total: number
    sources: {
        unsplash: number
        pexels: number
        pixabay: number
    }
}

export async function POST(request: NextRequest) {
    try {
        const { hexColors, page = 1, threshold = 80 } = (await request.json()) as SearchImagesRequestBody

        // No auth / no usage limits by design:
        // this endpoint is for personal use with friends only.

        // Parse HEX colors
        const parsedColors = parseHexColors(hexColors)

        if (parsedColors.length === 0) {
            return NextResponse.json({ error: 'No valid HEX colors provided' }, { status: 400 })
        }

        // SMART QUERY: Convert HEX to human-readable names (e.g. "blue ocean" instead of "#0000ff color")
        const primaryHex = parsedColors[0]
        const colorName = getColorName(primaryHex)
        const unsplashColor = getUnsplashColorParam(primaryHex)

        // Search query: Use the color name + a generic term to get better variety
        const searchQuery = `${colorName} nature abstract`

        // Fetch from all sources in parallel
        const [unsplashImages, pexelsImages, pixabayImages] = await Promise.all([
            searchUnsplash(searchQuery, page, 20, unsplashColor),
            searchPexels(`${colorName} color`, page, 20),
            searchPixabay(colorName, page, 30),
        ])

        // Filter images by color matching
        const targetRgbColors = parsedColors.map(hexToRgb)
        const matchedImages: ColorSearchResultImage[] = []

        // Process Unsplash images
        for (const image of unsplashImages) {
            const dominantColors = await buildDominantColorsFromUnsplash(image)
            if (!dominantColors) continue

            const colorValues = Object.values(dominantColors).filter((c) => c !== null)
            const hasMatch = colorValues.some((imageHex) => {
                if (typeof imageHex !== 'string') return false
                try {
                    const imageRgb = hexToRgb(imageHex)
                    return targetRgbColors.some((targetRgb) => isColorMatch(targetRgb, imageRgb, threshold))
                } catch {
                    return false
                }
            })

            if (hasMatch) {
                matchedImages.push({
                    id: image.id,
                    urls: image.urls,
                    user: image.user,
                    links: image.links ?? {
                        html: `https://unsplash.com/photos/${image.id}`,
                    },
                    description: image.description,
                    alt_description: image.alt_description,
                    color: image.color,
                    dominantColors,
                    source: 'unsplash',
                })
            }
        }

        // Process Pexels images
        for (const image of pexelsImages) {
            const dominantColors = await buildDominantColorsFromPexels(image)
            if (!dominantColors) continue

            const colorValues = Object.values(dominantColors).filter((c) => c !== null)
            const hasMatch = colorValues.some((imageHex) => {
                if (typeof imageHex !== 'string') return false
                try {
                    const imageRgb = hexToRgb(imageHex)
                    return targetRgbColors.some((targetRgb) => isColorMatch(targetRgb, imageRgb, threshold))
                } catch {
                    return false
                }
            })

            if (hasMatch) {
                // Transform Pexels image to match Unsplash-like format for UI consistency
                matchedImages.push({
                    id: image.id.toString(),
                    urls: {
                        raw: image.src.original,
                        full: image.src.large2x,
                        regular: image.src.large,
                        small: image.src.medium,
                        thumb: image.src.small,
                    },
                    user: {
                        name: image.photographer,
                        username: image.photographer.toLowerCase().replace(/\s+/g, '-'),
                        profile_image: {
                            small: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                image.photographer,
                            )}&size=32`,
                        },
                    },
                    links: {
                        html: `https://www.pexels.com/photo/${image.id}/`,
                    },
                    description: null,
                    alt_description: `Photo by ${image.photographer}`,
                    color: image.avg_color,
                    dominantColors,
                    source: 'pexels',
                })
            }
        }

        // Process Pixabay images
        for (const image of pixabayImages) {
            const dominantColors = await buildDominantColorsFromPixabay(image)
            if (!dominantColors) continue

            const colorValues = Object.values(dominantColors).filter((c) => c !== null)
            const hasMatch = colorValues.some((imageHex) => {
                if (typeof imageHex !== 'string') return false
                try {
                    const imageRgb = hexToRgb(imageHex)
                    return targetRgbColors.some((targetRgb) => isColorMatch(targetRgb, imageRgb, threshold))
                } catch {
                    return false
                }
            })

            if (hasMatch) {
                matchedImages.push({
                    id: image.id.toString(),
                    urls: {
                        raw: image.largeImageURL,
                        full: image.largeImageURL,
                        regular: image.webformatURL,
                        small: image.webformatURL,
                        thumb: image.previewURL,
                    },
                    user: {
                        name: image.user,
                        username: image.user.toLowerCase().replace(/\s+/g, '-'),
                        profile_image: image.userImageURL
                            ? {
                                small: image.userImageURL,
                            }
                            : undefined,
                    },
                    links: {
                        html: image.pageURL,
                    },
                    description: image.tags,
                    alt_description: image.tags,
                    // We don't have a HEX from the API; we reuse
                    // the first derived color as the "primary".
                    color: (Object.values(dominantColors)[0] as string) ?? '#000000',
                    dominantColors,
                    source: 'pixabay',
                })
            }
        }

        // Filter out Pixabay results that didn't match (Pixabay has null dominantColors now)
        // This ensures Pixabay only shows up if we find a good reason (not yet implemented for real Pixabay pixels)
        // For now, we prefer results from Unsplash/Pexels which give us real HEX metadata.

        // Sort by 'closest' match first (not just random shuffle)
        const scoredImages = matchedImages.map(img => {
            const imgRgb = hexToRgb(img.color)
            const dist = targetRgbColors.reduce((min, target) => {
                const d = Math.sqrt(
                    Math.pow(target.r - imgRgb.r, 2) +
                    Math.pow(target.g - imgRgb.g, 2) +
                    Math.pow(target.b - imgRgb.b, 2)
                )
                return Math.min(min, d)
            }, Infinity)
            return { img, dist }
        })

        const sorted = scoredImages
            .sort((a, b) => a.dist - b.dist)
            .map(item => item.img)

        const responseBody: SearchImagesResponseBody = {
            images: sorted,
            page,
            total: sorted.length,
            sources: {
                unsplash: matchedImages.filter((img) => img.source === 'unsplash').length,
                pexels: matchedImages.filter((img) => img.source === 'pexels').length,
                pixabay: matchedImages.filter((img) => img.source === 'pixabay').length,
            },
        }

        return NextResponse.json(responseBody)
    } catch (error) {
        console.error('Search error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
