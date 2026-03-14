import fs from 'fs/promises';
import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp({
  binaryPath: '/usr/local/bin/yt-dlp',
  ffmpegPath: '/usr/local/bin/ffmpeg',
});

// // Fluent builder API (recommended)
// const result = await ytdlp
//   .download('https://www.youtube.com/embed/F1mqrCTFoz4')
//   .format({ filter: 'mergevideo', quality: '1080p', type: 'mp4' })
//   .output('./downloads')
//   .embedThumbnail()
//   .on('progress', (p) => console.log(`${p.percentage_str}`))
//   .run();

// console.log('Downloaded:', result.filePaths);

const downloadYTVids = async () => {
  const data = await fs.readFile('./public/dist/youtube-videos.json', 'utf8');
  const jsonData = JSON.parse(data);

  //   const result = await ytdlp.downloadAsync(url, {
  //   format: { filter: 'mergevideo', type: 'mp4', quality: '1080p' },
  //   output: './downloads/%(title)s.%(ext)s',
  //   onProgress: (progress) => console.log(progress),
  // });

  jsonData.forEach(async (entry) => {
    // console.log('Downloading post id:', entry.postId);
    const savePath = `./public/content/2/${entry.postId}`;

    try {
      const result = await ytdlp
        .download(entry.src)
        .format({ filter: 'mergevideo', quality: '1080p', type: 'mp4' })
        .output(savePath)
        .embedThumbnail()

        // .cookies('./scripts/youtube-cookies.txt')
        // .cookiesFromBrowser('brave')
        // .on('progress', (p) => console.log(`${p.percentage_str}`))
        .on('beforeDownload', (info) => console.log(`Downloading: ${info.title} to ${savePath}`))
        .on('finish', (finish) => console.log('finished'))
        .run();
      console.log('Downloaded post id:', entry.postId, result.filePaths[0]);
    } catch (error) {
      console.log('Error:', error.message);
    }
  });
};

await downloadYTVids();

// Get video info
// const info = await ytdlp.getInfoAsync(
//   'https://www.youtube.com/embed/F1mqrCTFoz4',
// );
// console.log(info.title);
