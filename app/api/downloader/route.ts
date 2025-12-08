import { NextRequest, NextResponse } from 'next/server';
import YTDlpWrap from 'yt-dlp-wrap';
import path from 'path';
import fs from 'fs';
import https from 'https';

// Cache for the binary path to avoid re-downloading
let cachedBinaryPath: string | null = null;

// Helper to download file from URL
const downloadFile = async (url: string, dest: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            // Follow redirects
            if (response.statusCode === 302 || response.statusCode === 301) {
                const redirectUrl = response.headers.location;
                if (redirectUrl) {
                    file.close();
                    fs.unlinkSync(dest);
                    downloadFile(redirectUrl, dest).then(resolve).catch(reject);
                    return;
                }
            }
            
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlinkSync(dest);
            reject(err);
        });
    });
};

// Helper to get or download yt-dlp binary
const getYtDlpPath = async (): Promise<string> => {
    // Return cached path if available
    if (cachedBinaryPath && fs.existsSync(cachedBinaryPath)) {
        return cachedBinaryPath;
    }

    const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
    const platform = process.platform;
    
    // Determine binary name and download URL
    let binaryName: string;
    let downloadUrl: string;
    
    if (platform === 'win32') {
        binaryName = 'yt-dlp.exe';
        downloadUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';
    } else {
        // Linux - download the standalone binary
        binaryName = 'yt-dlp';
        downloadUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux';
    }
    
    // Use /tmp on Vercel (only writable directory), project root locally
    const binaryPath = isProduction 
        ? path.join('/tmp', binaryName)
        : path.join(process.cwd(), binaryName);
    
    // Check if binary already exists
    if (fs.existsSync(binaryPath)) {
        // Verify it's executable on Linux
        if (platform !== 'win32') {
            try {
                fs.chmodSync(binaryPath, 0o755);
            } catch (error) {
                console.warn('Could not set executable permissions:', error);
            }
        }
        cachedBinaryPath = binaryPath;
        return binaryPath;
    }
    
    console.log(`Downloading yt-dlp standalone binary for ${platform} from ${downloadUrl}...`);
    
    // Download the standalone binary
    await downloadFile(downloadUrl, binaryPath);
    
    // Make executable on Linux
    if (platform !== 'win32') {
        fs.chmodSync(binaryPath, 0o755);
    }
    
    console.log('yt-dlp standalone binary downloaded successfully');
    cachedBinaryPath = binaryPath;
    return binaryPath;
};

// Helper to get wrapper instance
const getYtDlp = async () => {
    const ytDlpPath = await getYtDlpPath();
    // @ts-ignore
    const YTDlpWrapClass = YTDlpWrap.default || YTDlpWrap;
    return new YTDlpWrapClass(ytDlpPath);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { url } = await request.json();

    // Basic validation
    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
        return new NextResponse('Invalid URL', { status: 400 });
    }

    // Get metadata using yt-dlp --dump-json
    const ytDlp = await getYtDlp();
    
    // Strategy: comprehensive browser simulation WITHOUT cookies
    // Cookies cause YouTube to return streaming-only formats (m3u8/mhtml)
    // Instead: simulate Android app thoroughly to get downloadable formats
    const args = [
        url,
        '--dump-json',
        '--no-warnings',
        '--no-playlist',
        // Use Android client with aggressive emulation
        '--extractor-args', 'youtube:player_client=android;player_skip=configs,webpage;skip=authcheck',
        '--user-agent', 'com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip',
        // Add common headers to look more like real request
        '--add-header', 'Accept-Language:en-US,en;q=0.9',
        '--add-header', 'Accept:*/*'
    ];
    
    try {
        const metadata = await ytDlp.execPromise(args);
        
        const info = JSON.parse(metadata);

        const videoOptions: any[] = [];
        const audioOptions: any[] = [];
        const videoOnlyOptions: any[] = [];

        // Formats are usually sorted by yt-dlp, but we process them
        let formats = info.formats || [];
        console.log(`Total formats received: ${formats.length}`);
        
        // Ensure we process best formats? Reverse is often helpful as yt-dlp lists best at end
        formats = formats.reverse();

        formats.forEach((format: any) => {
            // Exclude m3u8 (HLS) formats as they are playlists
            if (format.protocol === 'm3u8' || format.protocol === 'm3u8_native') {
                console.log(`Skipping m3u8 format: ${format.format_id}`);
                return;
            }

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
                size: fileSizeStr
            };

            if(option.container !== 'mp4' && option.container !== 'webm' && option.container !== 'm4a') {
                console.log(`Rejecting format ${format.format_id} with container: ${option.container}`);
                return;
            }

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

        console.log(`Final counts - Video+Audio: ${videoOptions.length}, Audio: ${audioOptions.length}, VideoOnly: ${videoOnlyOptions.length}`);

        return NextResponse.json({
            title: info.title,
            thumbnail: info.thumbnail,
            videoOptions: cleanup(videoOptions),
            audioOptions: cleanup(audioOptions),
            videoOnlyOptions: cleanup(videoOnlyOptions)
        });
    } catch (ytDlpError) {
        throw ytDlpError;
    }

  } catch (error: any) {
    console.error('Error fetching video info:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Allow': 'POST, OPTIONS',
    },
  });
}