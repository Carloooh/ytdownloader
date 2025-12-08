# YouTube Downloader

A modern, fast YouTube video downloader built with Next.js and yt-dlp.

## Features

- 🚀 Fast video metadata retrieval
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS
- 🔒 Bot detection bypass
- ☁️ Optimized for Vercel deployment

## Deployment

### Prerequisites

- Node.js 24.x or higher
- pnpm (recommended) or npm

### Vercel Deployment

1. Fork and clone this repository
2. Deploy to Vercel:

   ```bash
   vercel
   ```

3. **Configure YouTube Cookies** (Required for Vercel):
   - YouTube blocks Vercel IPs as bot traffic
   - You need to provide YouTube cookies for authentication
   - See [Cookie Setup Guide](./COOKIES_SETUP.md) for detailed instructions

#### Quick Cookie Setup:

1. Install [Get cookies.txt LOCALLY](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc) extension
2. Go to YouTube.com and sign in
3. Export cookies using the extension (Netscape format)
4. In Vercel Dashboard:
   - Go to Settings → Environment Variables
   - Add new variable:
     - Name: `YOUTUBE_COOKIES`
     - Value: (paste entire cookie file content)
5. Redeploy

## Local Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## How It Works

- Uses `yt-dlp` standalone binary (no Python required)
- Automatically downloads correct binary for platform (Windows/Linux)
- Android player client emulation to reduce bot detection
- Cookie-based authentication for Vercel deployments

## Tech Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS 4
- **Downloader**: yt-dlp
- **Deployment**: Vercel

## Environment Variables

| Variable          | Required          | Description                                       |
| ----------------- | ----------------- | ------------------------------------------------- |
| `YOUTUBE_COOKIES` | Yes (Vercel only) | YouTube cookies in Netscape format for bot bypass |

## License

MIT
