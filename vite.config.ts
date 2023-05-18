import { defineConfig } from 'vitest/config'
import commonjs from 'vite-plugin-commonjs'

export default defineConfig({
	test: {
		environment: 'jsdom',
		deps: {
			inline: [/@nuxt\/test-utils-edge/],
		},
	},
	plugins: [commonjs(/* options */)],
})
