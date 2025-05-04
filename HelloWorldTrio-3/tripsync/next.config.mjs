import path from 'path';
import { fileURLToPath } from 'url';

// __dirname を自前で作る
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
export default {
  webpack(config) {
    // "@/..." → src/ に解決
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};
