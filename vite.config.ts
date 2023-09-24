import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vitejs.dev/config/
export default defineConfig({
  //Base must be set in .env.prod since when discribed here it makes inlining css and styles impossible
  // base: "/m.foerster/programmieren/",
  plugins: [react(), viteSingleFile()],
})
