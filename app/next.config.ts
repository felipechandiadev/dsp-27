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

/**
 * BetterOffice solo declara export "import" (sin "require"/"default").
 * Webpack de Next falla al resolver el package root; apuntamos a dist/*.mjs.
 * package.json no está en "exports", así que localizamos por node_modules.
 */
const monorepoNodeModules = path.resolve(__dirname, '../node_modules');
const betterOfficeDocxReactEntry = path.join(
  monorepoNodeModules,
  '@betteroffice/docx-react/dist/index.mjs',
);
const betterOfficeDocxEntry = path.join(
  monorepoNodeModules,
  '@betteroffice/docx/dist/core.mjs',
);
const betterOfficeDocxI18nEntry = path.join(
  monorepoNodeModules,
  '@betteroffice/docx-i18n/dist/index.mjs',
);
const betterOfficeDocxLayoutEntry = path.join(
  monorepoNodeModules,
  '@betteroffice/docx/dist/layout/index.mjs',
);
const betterOfficeFontsEntry = path.join(
  monorepoNodeModules,
  '@betteroffice/fonts/dist/index.js',
);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(__dirname, '..'),
  transpilePackages: [
    '@felipechandiadev/ui',
    '@betteroffice/docx-react',
    '@betteroffice/docx',
    '@betteroffice/docx-i18n',
    '@betteroffice/fonts',
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Source local para HMR (mismo hábito que kai-admin)
      '@felipechandiadev/ui$': path.join(kaiUiRoot, 'src', 'index.ts'),
      '@betteroffice/docx-react$': betterOfficeDocxReactEntry,
      '@betteroffice/docx$': betterOfficeDocxEntry,
      '@betteroffice/docx/layout$': betterOfficeDocxLayoutEntry,
      '@betteroffice/docx-i18n$': betterOfficeDocxI18nEntry,
      '@betteroffice/fonts$': betterOfficeFontsEntry,
    };
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    return config;
  },
};

export default nextConfig;
