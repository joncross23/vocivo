/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@vocivo/application',
    '@vocivo/contracts',
    '@vocivo/domain',
    '@vocivo/infrastructure',
    '@vocivo/ui',
  ],
};

export default nextConfig;
