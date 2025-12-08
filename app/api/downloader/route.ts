import { NextRequest, NextResponse } from 'next/server';
import YTDlpWrap from 'yt-dlp-wrap';
import path from 'path';

// Initialize wrapper with the binary we downloaded
import fs from 'fs';

import os from 'os';

// Helper to get wrapper instance
const getYtDlp = () => {
    // ... existing code ...
    // @ts-ignore
    const YTDlpWrapClass = YTDlpWrap.default || YTDlpWrap;
    const filename = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
    const binaryPath = path.join(process.cwd(), filename);
    
    // Debug logging for Vercel
    if (!fs.existsSync(binaryPath)) {
        console.error(`BINARY MISSING: Could not find yt-dlp binary at ${binaryPath}`);
        console.error(`CWD: ${process.cwd()}`);
        console.error(`Dir contents: ${fs.readdirSync(process.cwd()).join(', ')}`);
    }

    return new YTDlpWrapClass(binaryPath);
}

const ensureCookies = () => {
    const cookies = process.env.YOUTUBE_COOKIES;
    if (!cookies) return undefined;
    
    const tempDir = os.tmpdir();
    const cookiePath = path.join(tempDir, 'youtube_cookies.txt');
    
    // Write if not exists (or overwrite to ensure freshness?) 
    // Overwriting is safer if env var changes
    fs.writeFileSync(cookiePath, cookies);
    return cookiePath;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { url } = await request.json();

    // Basic validation
    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
        return new NextResponse('Invalid URL', { status: 400 });
    }

    const cookiePath = ensureCookies();
    const args = [
        url,
        '--dump-json',
        '--no-warnings',
        '--no-playlist'
    ];
    if (cookiePath) {
        args.push('--cookies', cookiePath);
    }

    // Get metadata using yt-dlp --dump-json
    const metadata = await getYtDlp().execPromise(args);
    
    const info = JSON.parse(metadata);

    const videoOptions: any[] = [];
    const audioOptions: any[] = [];
    const videoOnlyOptions: any[] = [];

    // Formats are usually sorted by yt-dlp, but we process them
    let formats = info.formats || [];
    // Ensure we process best formats? Reverse is often helpful as yt-dlp lists best at end
    formats = formats.reverse();

    formats.forEach((format: any) => {
        // Exclude m3u8 (HLS) formats as they are playlists
        if (format.protocol === 'm3u8' || format.protocol === 'm3u8_native') return;

        // Better quality label parsing
        let qualityLabel = 'Unknown';
        if (format.height) {
            qualityLabel = `${format.height}p`;
        } else if (format.resolution) {
            qualityLabel = format.resolution;
        } else if (format.format_note) {
            qualityLabel = format.format_note;
        }

        const fileSize = format.filesize || format.filesize_approx;
        const fileSizeStr = fileSize ? `${(fileSize / (1024 * 1024)).toFixed(1)} MB` : '';

        const option = {
            quality: qualityLabel,
            mimeType: format.ext,
            url: format.url,
            container: format.ext,
            audioQuality: format.acodec !== 'none' ? 'Has Audio' : undefined,
            itag: format.format_id, 
            hasAudio: format.acodec !== 'none',
            hasVideo: format.vcodec !== 'none',
            height: format.height || 0,
            abr: format.abr || 0,
            size: fileSizeStr,
            bytes: fileSize || 0
        };

        if(option.container !== 'mp4' && option.container !== 'webm' && option.container !== 'm4a') return;

        if (option.hasVideo && option.hasAudio) {
            videoOptions.push(option);
        } else if (!option.hasVideo && option.hasAudio) {
             const kbps = Math.round(option.abr || 0);
             option.audioQuality = `Audio ${kbps > 0 ? kbps + 'kbps' : 'Medium'}`;
             // Override quality label for audio only to be cleaner
             option.quality = option.audioQuality;
             audioOptions.push(option);
        } else if (option.hasVideo && !option.hasAudio) {
            videoOnlyOptions.push(option);
        }
    });

    const cleanup = (opts: any[]) => {
        const unique = new Map();
        opts.forEach(o => {
            // Key by quality to dedupe (e.g. 720p-mp4)
            // Ideally we keep the one with known size?
            const key = o.hasVideo ? `${o.quality}-${o.container}` : `${o.audioQuality}-${o.container}`;
            
            if(!unique.has(key)) {
                 unique.set(key, o);
            } else {
                 // Optimization: If current has file size and stored doesn't, swap
                 const existing = unique.get(key);
                 if (!existing.size && o.size) {
                     unique.set(key, o);
                 }
            }
        });
        
        // Sort
        return Array.from(unique.values()).sort((a: any, b: any) => {
            // Sort by height descending for video
            if (a.hasVideo && b.hasVideo) return b.height - a.height;
            // Sort by bitrate for audio
            if (!a.hasVideo && !b.hasVideo) return b.abr - a.abr;
            return 0;
        });
    };

    return NextResponse.json({
        title: info.title,
        thumbnail: info.thumbnail,
        videoOptions: cleanup(videoOptions),
        audioOptions: cleanup(audioOptions),
        videoOnlyOptions: cleanup(videoOnlyOptions)
    });

  } catch (error: any) {
    console.error('Error fetching video info:', error);
    const msg = error.message || 'Internal Server Error';
    // Return specifics if strictly needed
    if (msg.includes('ENOENT')) {
        return new NextResponse(JSON.stringify({ error: 'Server Configuration Error: yt-dlp binary missing' }), { status: 500, headers: {'Content-Type': 'application/json'} });
    }
    return new NextResponse(JSON.stringify({ error: msg }), { status: 500, headers: {'Content-Type': 'application/json'} });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Allow': 'POST, OPTIONS',
    },
  });
}