// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/api/download',
          destination: 'https://rr4---sn-uxgg5-njal7.googlevideo.com/videoplayback',
        },
      ];
    },
  };
  
  export default nextConfig;
  