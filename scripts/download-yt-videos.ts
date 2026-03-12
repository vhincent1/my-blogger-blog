import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp({
  binaryPath: '/usr/local/bin/yt-dlp',
  ffmpegPath: '/usr/local/bin/ffmpeg',
});


// Fluent builder API (recommended)
const result = await ytdlp
  .download('https://www.youtube.com/embed/F1mqrCTFoz4')
  .format({ filter: 'mergevideo', quality: '1080p', type: 'mp4' })
  .output('./downloads')
  .embedThumbnail()
  .on('progress', (p) => console.log(`${p.percentage_str}`))
  .run();

console.log('Downloaded:', result.filePaths);

// Get video info
// const info = await ytdlp.getInfoAsync(
//   'https://www.youtube.com/embed/F1mqrCTFoz4',
// );
// console.log(info.title);
