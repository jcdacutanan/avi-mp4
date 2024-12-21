import './App.css';
import { useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

function App() {
  const [videoSrc, setVideoSrc] = useState('');
  const [aviFile, setAviFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const ffmpeg = new FFmpeg();

  const handleChangeVideo = (e) => {
    const file = e.target.files[0];
    setAviFile(file);
  };

  const createVideo = async () => {
    if (!aviFile) {
      alert('Please upload an AVI file first.');
      return;
    }
  
    try {
      setIsLoading(true);
      await ffmpeg.load();
  
      ffmpeg.on('log', ({ message }) => console.log('[FFmpeg Log]:', message));
      ffmpeg.on('progress', (progress) => console.log('[FFmpeg Progress]:', progress));
  
      await ffmpeg.writeFile('input.avi', await fetchFile(aviFile));
      console.log('Input file written successfully.');
  
      try {
        await ffmpeg.exec(['-i', 'input.avi', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '96k', 'output.mp4']);
        console.log('FFmpeg command executed successfully.');
      } catch (error) {
        if (error.message.includes('Aborted')) {
          console.warn('FFmpeg reported an "Aborted()" message, but the output file might still be valid.');
        } else {
          throw error;
        }
      }
  
      const data = await ffmpeg.readFile('output.mp4');
      console.log('Output file size:', data.length);
  
      if (data.length === 0) {
        throw new Error('The converted file is empty.');
      }
  
      setVideoSrc(URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' })));
    } catch (error) {
      console.error('Error during video conversion:', error);
      alert('An error occurred during video conversion. Check the console for details.');
    } finally {
      setIsLoading(false);
      await ffmpeg.terminate();
      console.log('FFmpeg terminated.');
    }
  };
  
  
  

  return (
    <div className="App">
      <h1>AVI to MP4 Converter</h1>
      <video src={videoSrc} controls style={{ width: '100%', margin: '10px 0' }}></video>
      <br />
      <input type="file" id="avi" accept="video/avi" onChange={handleChangeVideo}></input>
      <br />
      <button onClick={createVideo} disabled={isLoading}>
        {isLoading ? 'Converting...' : 'Create Video'}
      </button>
    </div>
  );
}

export default App;
