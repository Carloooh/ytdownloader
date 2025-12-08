const YTDlpWrap = require('yt-dlp-wrap').default;
const fs = require('fs');
const path = require('path');
const os = require('os');

async function download() {
    console.log('Detecting OS for yt-dlp download...');
    const platform = os.platform();
    let filename = 'yt-dlp';
    
    if (platform === 'win32') {
        filename = 'yt-dlp.exe';
    }

    const binaryPath = path.join(__dirname, '..', filename);
    console.log(`Downloading ${filename} to ${binaryPath}...`);

    // Always fetch latest to ensure we bypass 403s
    // Explicitly pass platform to ensure we get the standalone binary (yt-dlp_linux) not the zipapp
    await YTDlpWrap.downloadFromGithub(binaryPath, undefined, platform);
    console.log('Downloaded yt-dlp successfully.');

    // Ensure executable permissions on Unix-like systems
    if (platform !== 'win32') {
        try {
            fs.chmodSync(binaryPath, '755');
            console.log('Permissions set to 755.');
        } catch (e) {
            console.error('Failed to set permissions:', e);
        }
    }
}

download().catch(err => {
    console.error(err);
    process.exit(1);
});
