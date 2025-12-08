const fs = require('fs');
const path = require('path');
const os = require('os');

async function download() {
    console.log('Starting manual yt-dlp download...');
    const platform = os.platform();
    let url = '';
    let filename = '';

    if (platform === 'win32') {
        filename = 'yt-dlp.exe';
        url = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';
    } else {
        filename = 'yt-dlp'; // We save it as just 'yt-dlp' for simplicity
        // IMPORTANT: Download the STANDALONE Linux binary which includes Python
        url = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux';
    }

    const binaryPath = path.join(__dirname, '..', filename);
    console.log(`Platform: ${platform}`);
    console.log(`Downloading standalone binary from: ${url}`);
    console.log(`Saving to: ${binaryPath}`);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const fileStream = fs.createWriteStream(binaryPath);
    const stream = require('stream');
    const { promisify } = require('util');
    const pipeline = promisify(stream.pipeline);

    await pipeline(response.body, fileStream);
    console.log('Download complete.');

    if (platform !== 'win32') {
        try {
            fs.chmodSync(binaryPath, '755');
            console.log('Permissions set to 755 (executable).');
        } catch (e) {
            console.error('Failed to set permissions:', e);
        }
    }
}

download().catch(err => {
    console.error('Fatal error during download:', err);
    process.exit(1);
});
