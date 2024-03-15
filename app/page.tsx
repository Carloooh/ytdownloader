'use client'

import { useState } from 'react';
import axios from 'axios';

const IndexPage = () => {
  const [url, setUrl] = useState<string>('');
  const [downloadOptions, setDownloadOptions] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleDownload = async () => {
    try {
      const response = await axios.post('/api/downloader', { url });
      const { videoOptions, audioOptions, videoOnlyOptions } = response.data;
      setDownloadOptions([...videoOptions, ...audioOptions, ...videoOnlyOptions]);
    } catch (error: any) {
      setErrorMessage(error.response.data);
    }
  };

  const handleFormatSelection = async (format: any) => {
    try {
      const response = await axios.post('/api/downloader', { url: format.url }, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: format.mimeType });
      const title = document.title.replace(/[^a-z0-9]/gi, '_');
      const filename = `${title}.${format.mimeType.split('/')[1]}`;
      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.setAttribute('download', filename);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.parentNode?.removeChild(downloadLink);
    } catch (error) {
      console.error('Failed to download video:', error);
    }
  };
  

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">YouTube Video Downloader</h1>
      {errorMessage && <div className="text-red-600 mb-4">{errorMessage}</div>}
      <input
        type="text"
        placeholder="Enter YouTube URL"
        className="border border-gray-300 rounded px-2 py-1 mb-4"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={handleDownload}
      >
        Get Video Info
      </button>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Download Options</h2>
        <ul>
          {downloadOptions.map((option, index) => (
            <li key={index} className="mb-2">
              <button
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => handleFormatSelection(option)}
              >
                {option.quality}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default IndexPage;


// import { useState } from 'react';
// import axios from 'axios';

// const IndexPage = () => {
//   const [url, setUrl] = useState<string>('');
//   const [downloadOptions, setDownloadOptions] = useState<any[]>([]);
//   const [errorMessage, setErrorMessage] = useState<string>('');

//   const handleDownload = async () => {
//     try {
//       const response = await axios.post('/api/downloader', { url });
//       const { videoOptions, audioOptions, videoOnlyOptions } = response.data;
//       setDownloadOptions([...videoOptions, ...audioOptions, ...videoOnlyOptions]);
//     } catch (error: any) {
//       setErrorMessage(error.response.data);
//     }
//   };

//   const handleFormatSelection = (format: any) => {
//     const { quality, mimeType, url } = format;
//     const title = document.title.replace(/[^a-z0-9]/gi, '_'); // Remove special characters from video title
//     const filename = `${title}.${mimeType.split('/')[1]}`;
//     fetch(url)
//       .then((res) => res.blob())
//       .then((blob) => {
//         const downloadLink = document.createElement('a');
//         downloadLink.href = window.URL.createObjectURL(new Blob([blob]));
//         downloadLink.setAttribute('download', filename);
//         document.body.appendChild(downloadLink);
//         downloadLink.click();
//         downloadLink.parentNode?.removeChild(downloadLink);
//       });
//   };

//   return (
//     <div className="container mx-auto mt-8">
//       <h1 className="text-2xl font-bold mb-4">YouTube Video Downloader</h1>
//       {errorMessage && <div className="text-red-600 mb-4">{errorMessage}</div>}
//       <input
//         type="text"
//         placeholder="Enter YouTube URL"
//         className="border border-gray-300 rounded px-2 py-1 mb-4"
//         value={url}
//         onChange={(e) => setUrl(e.target.value)}
//       />
//       <button
//         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//         onClick={handleDownload}
//       >
//         Get Video Info
//       </button>

//       <div className="mt-8">
//         <h2 className="text-lg font-semibold mb-2">Download Options</h2>
//         <ul>
//           {downloadOptions.map((option, index) => (
//             <li key={index} className="mb-2">
//               <button
//                 className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
//                 onClick={() => handleFormatSelection(option)}
//               >
//                 {option.quality}
//               </button>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default IndexPage;


// import { useState } from 'react';
// import axios from 'axios';

// const IndexPage = () => {
//   const [url, setUrl] = useState<string>('');
//   const [videoOptions, setVideoOptions] = useState<any[]>([]);
//   const [audioOptions, setAudioOptions] = useState<any[]>([]);
//   const [videoOnlyOptions, setVideoOnlyOptions] = useState<any[]>([]);
//   const [errorMessage, setErrorMessage] = useState<string>('');

//   const handleDownload = async (url: string) => {
//     try {
//       const response = await axios.post('/api/downloader', { url });
//       const { videoOptions, audioOptions, videoOnlyOptions } = response.data;
//       setVideoOptions(videoOptions);
//       setAudioOptions(audioOptions);
//       setVideoOnlyOptions(videoOnlyOptions);
//     } catch (error: any) {
//       setErrorMessage(error.response.data);
//     }
//   };

//   const handleFormatSelection = (format: any) => {
//     const { quality, mimeType, url } = format;
//     const title = document.title.replace(/[^a-z0-9]/gi, '_'); // Remove special characters from video title
//     const filename = `${title}.${mimeType.split('/')[1]}`;
//     fetch(url)
//       .then((res) => res.blob())
//       .then((blob) => {
//         const downloadLink = document.createElement('a');
//         downloadLink.href = window.URL.createObjectURL(new Blob([blob]));
//         downloadLink.setAttribute('download', filename);
//         document.body.appendChild(downloadLink);
//         downloadLink.click();
//         downloadLink.parentNode?.removeChild(downloadLink);
//       });
//   };

//   return (
//     <div className="container mx-auto mt-8">
//       <h1 className="text-2xl font-bold mb-4">YouTube Video Downloader</h1>
//       {errorMessage && <div className="text-red-600 mb-4">{errorMessage}</div>}
//       <input
//         type="text"
//         placeholder="Enter YouTube URL"
//         className="border border-gray-300 rounded px-2 py-1 mb-4"
//         value={url}
//         onChange={(e) => setUrl(e.target.value)}
//       />
//       <button
//         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//         onClick={() => handleDownload(url)}
//       >
//         Get Video Info
//       </button>

//       <div className="mt-8">
//         <h2 className="text-lg font-semibold mb-2">Video with Audio</h2>
//         <ul>
//           {videoOptions.map((option, index) => (
//             <li key={index} className="mb-2">
//               <button
//                 className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
//                 onClick={() => handleFormatSelection(option)}
//               >
//                 {option.quality}
//               </button>
//             </li>
//           ))}
//         </ul>
//       </div>

//       <div className="mt-8">
//         <h2 className="text-lg font-semibold mb-2">Video Only</h2>
//         <ul>
//           {videoOnlyOptions.map((option, index) => (
//             <li key={index} className="mb-2">
//               <button
//                 className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
//                 onClick={() => handleFormatSelection(option)}
//               >
//                 {option.quality}
//               </button>
//             </li>
//           ))}
//         </ul>
//       </div>

//       <div className="mt-8">
//         <h2 className="text-lg font-semibold mb-2">Audio Only</h2>
//         <ul>
//           {audioOptions.map((option, index) => (
//             <li key={index} className="mb-2">
//               <button
//                 className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
//                 onClick={() => handleFormatSelection(option)}
//               >
//                 {option.quality}
//               </button>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default IndexPage;
