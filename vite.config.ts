import { defineConfig } from 'vitest/config'
import commonjs from 'vite-plugin-commonjs'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
	plugins: [commonjs(/* options */)],
})
