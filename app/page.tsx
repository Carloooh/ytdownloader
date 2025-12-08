"use client";

import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CircleLoader } from 'react-spinners';

type DownloadOption = {
  quality: string;
  mimeType: string;
  url: string;
  container: string;
  audioQuality?: string;
  itag: number;
  size?: string;
};

type ApiResponse = {
  title: string;
  thumbnail: string;
  videoOptions: DownloadOption[];
  audioOptions: DownloadOption[];
  videoOnlyOptions: DownloadOption[];
}

export default function Home() {
  const [videoLink, setVideoLink] = useState("");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper to group options by quality/label
  const groupOptions = (options: DownloadOption[]) => {
    const grouped = new Map<string, DownloadOption[]>();
    options.forEach(opt => {
      // Use quality label directly now that backend cleans it
      const key = opt.quality;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(opt);
    });
    return Array.from(grouped.entries());
  };

  const handleDownload = async () => {
    if(!videoLink) return;
    setLoading(true);
    setData(null);
    try {
      const res = await axios.post('/api/downloader', { url: videoLink });
      setData(res.data);
    } catch (err) {
      toast.error('Could not find video. Please check the URL.', {
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  }

  const triggerDownload = (url: string, itag: number, container: string) => {
    if (!data) return;
    const downloadUrl = `/api/stream-download?url=${encodeURIComponent(videoLink)}&itag=${itag}&title=${encodeURIComponent(data.title)}&container=${container}`;
    window.open(downloadUrl, '_blank');
  }

  const OptionCard = ({ title, options, icon }: { title: string, options: DownloadOption[], icon: string }) => {
     if (options.length === 0) return null;
     
     const grouped = groupOptions(options);

     return (
       <div className="border-2 border-[mediumspringgreen] p-4 rounded-md w-full bg-black">
          <h3 className="text-xl font-bold text-[mediumspringgreen] mb-4 border-b border-[mediumspringgreen] pb-2 flex items-center gap-2">
            <span>{icon}</span> {title}
          </h3>
          <div className="flex flex-col gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {grouped.map(([label, opts], i) => (
              <div key={i} className="flex flex-col sm:flex-row justify-between items-center bg-gray-900 border border-gray-700 p-3 rounded gap-3">
                 <span className="font-bold text-white uppercase">{label}</span>
                 <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select 
                        className="bg-black text-[mediumspringgreen] border border-[mediumspringgreen] rounded px-2 py-1 outline-none text-sm w-full sm:w-auto"
                        onChange={(e) => {
                             if(e.target.value) {
                                const [itag, container] = e.target.value.split('-');
                                triggerDownload(videoLink, Number(itag), container);
                                e.target.value = ""; // Reset
                             }
                        }}
                    >
                        <option value="">Download...</option>
                        {opts.map((opt, j) => (
                            <option key={j} value={`${opt.itag}-${opt.container}`}>
                                {opt.container.toUpperCase()} {opt.size ? `(${opt.size})` : ''}
                            </option>
                        ))}
                    </select>
                 </div>
              </div>
            ))}
          </div>
       </div>
     )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 flex flex-col items-center min-h-screen py-10 bg-black">
      <header className="text-center w-full max-w-3xl mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 border-b-4 border-[mediumspringgreen] inline-block pb-2">
          YouTube Downloader
        </h1>
        
        <div className="coolinput w-full mt-8">
            <label htmlFor="videoLink" className="text">Paste your YouTube video link:</label>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <input 
                type="text" 
                placeholder="https://youtube.com/watch?..." 
                name="input"
                className="input w-full bg-black text-white"
                value={videoLink} 
                onChange={(e) => setVideoLink(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleDownload()}
              />
              <button 
                onClick={handleDownload} 
                disabled={loading}
                className="button whitespace-nowrap justify-center"
              >
                {loading ? <CircleLoader color="mediumspringgreen" size={20} /> : 'SEARCH'}
              </button>
            </div>
        </div>
      </header>

      <ToastContainer position="top-center" theme="dark" />

      {data && (
        <div className="w-full flex flex-col items-center">
            <div className="flex flex-col md:flex-row gap-6 items-center border-[mediumspringgreen] border-2 p-4 rounded-lg mb-10 max-w-4xl bg-gray-900">
                <img src={data.thumbnail} alt="Thumbnail" className="w-64 rounded border border-[mediumspringgreen]" />
                <div className="text-center md:text-left">
                    <h2 className="text-xl font-bold text-white mb-2">{data.title}</h2>
                    <p className="text-[mediumspringgreen] text-sm">Select format from the lists below.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <OptionCard title="Video + Audio" options={data.videoOptions} icon="🎥" />
                <OptionCard title="Audio Only" options={data.audioOptions} icon="🎵" />
                <OptionCard title="Video Only" options={data.videoOnlyOptions} icon="🔇" />
            </div>
        </div>
      )}
    </main>
  );
}
