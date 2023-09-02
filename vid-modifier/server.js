const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    // send index.js
    res.sendFile(__dirname + '/index.html');
});

// Set up a storage engine for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/downscale', upload.single('video'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
  
    console.log('Received video:', req.file);
    console.log('Video data length:', req.file.buffer.length);

    const ffmpegInstance = ffmpeg()
        .input(req.file.buffer)
        .inputFormat('mp4')
        .size('320x240') // Change the desired size here
        .toFormat('mp4') // Change the desired output format here
        .on('start', (command) => {
            console.log('ffmpeg command:', command);
        })
        .on('end', () => {
            console.log('ffmpeg processing finished');
            // Send the downscaled video stream
            res.set('Content-Type', 'video/mp4');
            ffmpegInstance.pipe(res, { end: true });
        })
        .on('error', (err) => {
            console.error('Error:', err);
            res.status(500).send('Error processing the video.');
        });

    // Start the FFmpeg processing
    ffmpegInstance.run();
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
