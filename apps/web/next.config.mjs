/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@vocivo/application',
    '@vocivo/contracts',
    '@vocivo/domain',
    '@vocivo/ui',
  ],
};

export default nextConfig;
