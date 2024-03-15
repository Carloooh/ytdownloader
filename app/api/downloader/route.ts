import ytdl from 'ytdl-core';
import { NextRequest, NextResponse } from 'next/server';

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

    const videoFormats = ytdl.filterFormats(info.formats, 'video');
    const audioFormats = ytdl.filterFormats(info.formats, 'audio');

    const videoOptions = videoFormats.map((format) => ({
      quality: format.qualityLabel,
      mimeType: format.mimeType,
      url: format.url,
      container: format.container,
    }));

    const audioOptions = audioFormats.map((format) => ({
      quality: format.qualityLabel,
      mimeType: format.mimeType,
      url: format.url,
      container: format.container,
    }));

    const videoOnlyOptions = videoFormats.filter((format) => format.hasVideo && !format.hasAudio).map((format) => ({
      quality: format.qualityLabel,
      mimeType: format.mimeType,
      url: format.url,
      container: format.container,
    }));

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
