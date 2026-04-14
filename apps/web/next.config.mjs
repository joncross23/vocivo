/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@vocivo/application',
    '@vocivo/content-pipeline',
    '@vocivo/contracts',
    '@vocivo/domain',
    '@vocivo/infrastructure',
    '@vocivo/ui',
  ],
};

export default nextConfig;
