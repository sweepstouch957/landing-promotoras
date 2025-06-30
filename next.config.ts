import nextI18NextConfig from './next-i18next.config';

const nextConfig = {
  i18n: nextI18NextConfig.i18n, // usa directamente el objeto i18n
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
