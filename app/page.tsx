import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Palette, ArrowRight, Sparkles } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-12 max-w-2xl">
        {/* Logo/Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-2xl animate-pulse">
            <Sparkles size={32} />
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-gray-900 leading-none">
          ColorHash
        </h1>

        {/* Simple Action */}
        <div className="pt-8">
          <Link href="/palette">
            <Button size="lg" className="h-16 px-10 text-xl font-bold rounded-full bg-black hover:bg-gray-800 text-white transition-all hover:scale-105 shadow-xl">
              Get Started <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </Link>
        </div>

        <div className="pt-20 space-y-4">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-[0.3em]">
            Brand Intelligence / Visual Harmony
          </p>
          <p className="text-sm font-medium bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 bg-clip-text text-transparent italic">
            Built with чай and кофе. для Паулы :)
          </p>
        </div>
      </div>
    </div>
  )
}
