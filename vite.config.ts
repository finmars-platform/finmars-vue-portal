/// <reference types="vitest" />

// Configure Vitest (https://vitest.dev/config/)

import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'

export default defineConfig({
	plugins: [
    Vue(),
  ],
  test: {
		globals: true,
		environment: 'jsdom'
  },
})
