import type { StorybookConfig } from '@storybook/nextjs';
 

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
    framework: '@storybook/nextjs',
    addons: [
      '@storybook/addon-essentials',
      '@storybook/addon-interactions',
    ],
    staticDirs: ['../public'],
  };

export default config;