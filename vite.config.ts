import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// const noAttr = () => {
//   return {
//     name: "no-attribute",
//     transformIndexHtml(html) {
//       return html.replace(`type="module" crossorigin`, `type="module"`);
//     }
//   }
// }

//add noAttr() in plugins
//problem: absolute pathing with file:// and not relative to the directory of index.html

// https://vitejs.dev/config/
export default defineConfig({
  //Base must be set in .env.prod since when discribed here it makes inlining css and styles impossible
  // base: "/m.foerster/programmieren/",
  plugins: [react(), viteSingleFile()],
})
