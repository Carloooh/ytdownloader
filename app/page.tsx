'use client'

import { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CircleLoader } from 'react-spinners';

type DownloadOption = {
  quality: string;
  mimeType: string;
  url: string;
  container: string;
  audioQuality: string;
};

export default function Home() {
  const [videoLink, setVideoLink] = useState("");
  const [options, setOptions] = useState<{ videoOptions: DownloadOption[], audioOptions: DownloadOption[], videoOnlyOptions: DownloadOption[] }>({ videoOptions: [], audioOptions: [], videoOnlyOptions: [] });
  const [selectedOption, setSelectedOption] = useState<DownloadOption | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mediaType, setMediaType] = useState<"video" | "audio" | null>(null);


  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/downloader', { url: videoLink });
      setOptions(res.data);
    } catch (err) {
      toast.error('An error occurred.\nTry again later or check the video link.', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleOptionSelect = (option: DownloadOption) => {
    setSelectedOption(option);
    setShowPlayer(true);
    if (option.mimeType.includes('video')) {
      setMediaType('video');
    } else if (option.mimeType.includes('audio')) {
      setMediaType('audio');
    } else {
      setMediaType(null);
    }
  }

  return (
    <main className="mx-auto max-w-screen-lg px-4">
      <header className="text-center mt-8">
        <h1 className="text-3xl font-bold text-white">YouTube Media Downloader</h1>
        <div className="mt-4 coolinput">
          <label htmlFor="videoLink" className="text">Paste your YouTube video link:</label>
          <input type="text" placeholder="Write here..." name="input" className="input w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-gray-300 text-center" value={videoLink} onChange={(e) => setVideoLink(e.target.value)} />
        </div>
        <button className="mt-4 bg-white text-black px-4 py-2 rounded-md hover:bg-green-500 border-green-500 border-solid border-r-2 border-l-2 border-t-2 border-b-2" onClick={handleDownload}>
          {loading ? <CircleLoader color="#00FA9A" size={24} /> : <>Search</>}
        </button>
      </header>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="colored"
      />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          {options.videoOptions.length > 0 &&
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white text-center flex items-center justify-center gap-2">Video</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {options.videoOptions.map((option, index) => (
                  <button key={index} className="px-4 py-2 rounded-md flex items-center gap-2 button" onClick={() => handleOptionSelect(option)}>
                    {option.quality} - {option.container}
                  </button>
                ))}
              </div>
            </div>
          }
        </div>

        <div className="sm:col-span-1">
          {options.audioOptions.length > 0 &&
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white text-center flex items-center justify-center gap-2">Audio Only</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {options.audioOptions.map((option, index) => (
                  <button key={index} className="button px-4 py-2 rounded-md flex items-center gap-2" onClick={() => handleOptionSelect(option)}>
                    {option.audioQuality.split('_').pop()?.toLowerCase()} - {option.container}
                  </button>
                ))}
              </div>
            </div>
          }
        </div>

        <div className="sm:col-span-1">
          {options.videoOnlyOptions.length > 0 &&
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white text-center flex items-center justify-center gap-2">Video Only</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {options.videoOnlyOptions.map((option, index) => (
                  <button key={index} className="px-4 py-2 rounded-md flex items-center gap-2 button" onClick={() => handleOptionSelect(option)}>
                    {option.quality} - {option.container}
                  </button>
                ))}
              </div>
            </div>
          }
        </div>
      </div>

      {showPlayer && selectedOption &&
        <div className="mt-8 flex justify-center">
          <div className={mediaType === "audio" ? "audio-player-size" : "video-player-size"}>
            <video src={selectedOption.url} className="object-cover" controls width={mediaType === "audio" ? "300" : "640"} height={mediaType === "audio" ? "0" : "360"}></video>
          </div>
        </div>
      }

      <div className="mt-8 mb-4">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">How to use</h2>
        <div className="flex justify-center items-center text-white text-wrap flex-col">
          <p><span className="text-green-500">1.</span> Paste a valid YouTube video URL and press Search<span className="text-green-500">.</span></p>
          <p><span className="text-green-500">2.</span> Select a quality and format option<span className="text-green-500">.</span></p>
          <p><span className="text-green-500">3.</span> Click on the media player's options menu and then choose <span className="text-green-500">"</span>Download<span className="text-green-500">".</span></p>
        </div>
      </div>

    </main>
  );
}