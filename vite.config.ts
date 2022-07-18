import path from 'path';
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig(({ mode }) => {
	console.log('⚓ ' + mode)
	return {
		root: './src',
		base: mode === 'development' ? '/' : '/sp-sensor2/',
		plugins: [glsl()],
		build: {
			rollupOptions: {
				input: {
					home: path.resolve(__dirname, './src/index.html')
				}
			},
			outDir: '../dist'
		}
	}
})
