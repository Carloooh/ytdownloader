import ytdl from 'ytdl-core';
import { NextRequest, NextResponse } from 'next/server';

interface Option {
  quality: string;
  mimeType: string;
  url: string;
  container: string;
  audioQuality: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const requestBody = await request.json();
    const url: string = requestBody.url;

    if (!ytdl.validateURL(url)) {
      throw new Error('Invalid YouTube URL');
    }

    const info = await ytdl.getInfo(url);

    if (!info) {
      throw new Error('Video not found');
    }

    const formats = info.formats;

    const videoOptions: Option[] = [];
    const audioOptions: Option[] = [];
    const videoOnlyOptions: Option[] = [];

    formats.forEach((format) => {
      const option: Option = {
        quality: format.qualityLabel || '',
        mimeType: format.mimeType || '',
        url: format.url,
        container: format.container || '',
        audioQuality: format.audioQuality || '',
      };
      if (format.hasVideo && format.hasAudio) {
        videoOptions.push(option);
      } else if (format.hasVideo && !format.hasAudio) {
        videoOnlyOptions.push(option);
      } else if (!format.hasVideo && format.hasAudio) {
        audioOptions.push(option);
      }
    });

    videoOptions.sort((a, b) => {
      if (a.quality === b.quality) {
        return a.container.localeCompare(b.container);
      }
      return b.quality.localeCompare(a.quality);
    });

    audioOptions.sort((a, b) => {
      if (a.quality === b.quality) {
        return a.container.localeCompare(b.container);
      }
      return b.quality.localeCompare(a.quality);
    });

    videoOnlyOptions.sort((a, b) => {
      if (a.quality === b.quality) {
        return a.container.localeCompare(b.container);
      }
      return b.quality.localeCompare(a.quality);
    });

    return NextResponse.json({ videoOptions, audioOptions, videoOnlyOptions });
  } catch (error: any) {
    console.error(error);
    return new NextResponse(error.message, {
      status: 400,
      statusText: 'Bad Request',
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Allow': 'POST, OPTIONS',
    },
  });
}