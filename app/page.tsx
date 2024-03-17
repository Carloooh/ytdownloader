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
  }

  return (
    <main className="mx-auto max-w-screen-lg px-4">
      <header className="text-center mt-8">
        <h1 className="text-3xl font-bold text-white">YouTube Media Downloader</h1>
        <div className="mt-4">
          <input type="text" placeholder="Paste your YouTube video link here..." className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-gray-300 text-center" value={videoLink} onChange={(e) => setVideoLink(e.target.value)} />
        </div>
        <button className="mt-4 bg-white text-black px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:bg-gray-300" onClick={handleDownload}>
          {loading ? <CircleLoader color="black" size={24} /> : <>Search</>}
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
                  <button key={index} className="bg-white text-black px-4 py-2 rounded-md hover:bg-bg-gray-300 focus:outline-none focus:bg-bg-gray-300 flex items-center gap-2" onClick={() => handleOptionSelect(option)}>
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
                  <button key={index} className="bg-white text-black px-4 py-2 rounded-md hover:bg-bg-gray-300 focus:outline-none focus:bg-bg-gray-300 flex items-center gap-2" onClick={() => handleOptionSelect(option)}>
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
                  <button key={index} className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:bg-gray-300 flex items-center gap-2" onClick={() => handleOptionSelect(option)}>
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
          <div className="aspect-w-16 aspect-h-9">
            <video src={selectedOption.url} className="object-cover" controls width="640" height="360"></video>
          </div>
        </div>
      }

      <div className="mt-8 mb-4">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">How to use</h2>
        <div className="flex justify-center items-center">
          <img src="/downloader.png" alt="Step 1" className="mx-auto max-w-full h-auto" style={{maxHeight: '300px'}} />
        </div>
      </div>

    </main>
  );
}


// import { useState } from 'react';
// import axios from 'axios';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// type DownloadOption = {
//   quality: string;
//   mimeType: string;
//   url: string;
//   container: string;
//   audioQuality: string;
// };

// export default function Home() {
//   const [videoLink, setVideoLink] = useState("");
//   const [options, setOptions] = useState<{ videoOptions: DownloadOption[], audioOptions: DownloadOption[], videoOnlyOptions: DownloadOption[] }>({ videoOptions: [], audioOptions: [], videoOnlyOptions: [] });
//   const [selectedOption, setSelectedOption] = useState<DownloadOption | null>(null);
//   const [showPlayer, setShowPlayer] = useState(false);

//   const handleDownload = async () => {
//     try {
//       const res = await axios.post('/api/downloader', { url: videoLink });
//       setOptions(res.data);
//     } catch (err) {
//       toast.error('An error occurred.\nTry again later or check the video link.', {
//         position: "top-center",
//         autoClose: 5000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: false,
//         draggable: false,
//         progress: undefined,
//         theme: "colored",
//         });
//     }
//   }

//   const handleOptionSelect = (option: DownloadOption) => {
//     setSelectedOption(option);
//     setShowPlayer(true);
//   }

//   return (
//     <main className="mx-auto max-w-screen-lg px-4">
//       <header className="text-center mt-8">
//         <h1 className="text-3xl font-bold text-blue-500">YouTube Media Downloader</h1>
//         <div className="mt-4">
//           <input type="text" placeholder="Paste your YouTube video link here..." className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500 text-center" value={videoLink} onChange={(e) => setVideoLink(e.target.value)} />
//         </div>
//         <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600" onClick={handleDownload}>Search</button>
//       </header>

//       <ToastContainer
//       position="top-center"
//       autoClose={5000}
//       hideProgressBar={false}
//       newestOnTop={false}
//       closeOnClick
//       rtl={false}
//       pauseOnFocusLoss={false}
//       draggable={false}
//       pauseOnHover={false}
//       theme="colored"
//       />
      
//       <div className="mt-8">
//         {options.videoOptions.length > 0 &&
//           <div className="mt-8">
//             <h3 className="text-lg font-semibold text-blue-500 text-center">Video</h3>
//             <div className="flex flex-wrap justify-center gap-4">
//               {options.videoOptions.map((option, index) => (
//                 <button key={index} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600" onClick={() => handleOptionSelect(option)}>{option.quality} - {option.container}</button>
//               ))}
//             </div>
//           </div>
//         }

//         {options.audioOptions.length > 0 &&
//           <div className="mt-8">
//             <h3 className="text-lg font-semibold text-blue-500 text-center">Audio Only</h3>
//             <div className="flex flex-wrap justify-center gap-4">
//               {options.audioOptions.map((option, index) => (
//                 <button key={index} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600" onClick={() => handleOptionSelect(option)}>
//                   {option.audioQuality.split('_').pop()?.toLowerCase()} - {option.container}
//                 </button>
//               ))}
//             </div>
//           </div>
//         }

//         {options.videoOnlyOptions.length > 0 &&
//           <div className="mt-8">
//             <h3 className="text-lg font-semibold text-blue-500 text-center">Video Only</h3>
//             <div className="flex flex-wrap justify-center gap-4">
//               {options.videoOnlyOptions.map((option, index) => (
//                 <button key={index} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600" onClick={() => handleOptionSelect(option)}>{option.quality} - {option.container}</button>
//               ))}
//             </div>
//           </div>
//         }
//       </div>

//       {showPlayer && selectedOption &&
//         <div className="mt-8 flex justify-center">
//           <div className="aspect-w-16 aspect-h-9">
//             <video src={selectedOption.url} className="object-cover" controls width="640" height="360"></video>
//           </div>
//         </div>
//       }

//       <div className="mt-8 mb-4">
//         <h2 className="text-2xl font-bold text-blue-500 mb-4 text-center">How to use</h2>
//         <div className="grid grid-cols-2 justify-center items-center">
//           <img src="/search.png" alt="Step 1" className="mx-auto" />
//           <img src="/download.png" alt="Step 2" className="mx-auto" />
//         </div>
//       </div>

//     </main>
//   );
// }