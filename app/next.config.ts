import type { NextConfig } from 'next';
import path from 'path';
import { createRequire } from 'module';

const requireFromConfig = createRequire(__filename);

/** Clone local vía file: (node_modules/@felipechandiadev/ui → kai-ui). */
function resolveKaiUiRoot(): string {
  try {
    return path.dirname(
      requireFromConfig.resolve('@felipechandiadev/ui/package.json'),
    );
  } catch {
    return path.resolve(__dirname, '../../kai-ui');
  }
}

const kaiUiRoot = resolveKaiUiRoot();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(__dirname, '..'),
  transpilePackages: ['@felipechandiadev/ui'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Source local para HMR (mismo hábito que kai-admin)
      '@felipechandiadev/ui$': path.join(kaiUiRoot, 'src', 'index.ts'),
    };
    return config;
  },
};

export default nextConfig;
