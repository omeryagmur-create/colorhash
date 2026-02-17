# ColorHash AI - Visual Identity Reimagined

ColorHash AI is a powerful, AI-driven platform for designers and brand strategists to explore, generate, and visualize color identities.

## 🚀 Features

- **HEX Color Image Search**: Find high-quality images that match your palette from Unsplash, Pexels and Pixabay.
- **Presentation Style Helper (WIP)**: Help for mapping background, illustration, accent and text colors to a consistent slide style.
- **Palette & Layout Suggestions (WIP)**: Simple tools (in progress) to turn a palette into slide/layout suggestions.
- **100% Free**: No logins, no subscriptions, no hidden fees. Built as a personal tool for you and your friends.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Color Logic**: TinyColor2 + lightweight custom helpers
- **Image APIs**: Unsplash, Pexels, Pixabay (extensible)

## 🚦 Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Setup Environment Variables**:
    Create a `.env.local` file with the following keys:
    ```env
    UNSPLASH_ACCESS_KEY=your_unsplash_key
    PEXELS_API_KEY=your_pexels_key
    PIXABAY_API_KEY=your_pixabay_key   # optional, enables extra results
    ```
4.  **Run the development server**:
    ```bash
    npm run dev
    ```
5.  **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## 🌈 License

MIT License - feel free to use and modify for your own projects!
