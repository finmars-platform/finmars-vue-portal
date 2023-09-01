import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
	test: {
		globals: true,
		environment: 'happy-dom',
	},
	plugins: [
		vue(),
		AutoImport({
			include: [
				/\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
				/\.vue$/,
				/\.vue\?vue/, // .vue
				/\.md$/,
			],

			// global imports to register
			imports: [
				'vue',
				{
					'@vueuse/core': [
						// named imports
						'useMouse', // import { useMouse } from '@vueuse/core',
						// alias
						['useFetch', 'useMyFetch'], // import { useFetch as useMyFetch } from '@vueuse/core',
					],
				},
			],
			// Enable auto import by filename for default module exports under directories
			defaultExportByFilename: false,

			// Auto import for module exports under directories
			// by default it only scan one level of modules under the directory
			dirs: [
				// './hooks',
				// './composables' // only root modules
				// './composables/**', // all nested modules
				// ...
			],
		}),
		Components({
			// relative paths to the directory to search for components.
			dirs: ['src/components'],

			// valid file extensions for components.
			extensions: ['vue'],
			directoryAsNamespace: true,
			globalNamespaces: [],
			directives: true,
			allowOverrides: false,

			// filters for transforming targets
			include: [/\.vue$/, /\.vue\?vue/],
			exclude: [
				/[\\/]node_modules[\\/]/,
				/[\\/]\.git[\\/]/,
				/[\\/]\.nuxt[\\/]/,
			],
		}),
	],
})
