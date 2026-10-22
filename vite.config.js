import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// `vite build --mode web`: itch.io / CrazyGames gibi sitelere yüklenecek
// tarayıcı sürümü. Alt klasörden servis edildiği için göreli yollar kullanılır;
// bu siteler başka reklam ağlarına izin vermediği için AdSense betiği çıkarılır.
const stripAdSense = () => ({
  name: 'strip-adsense',
  transformIndexHtml: (html) => html.replace(/\s*<!-- Google AdSense Kodu -->\s*<script[^>]*adsbygoogle[^>]*><\/script>/, ''),
})

export default defineConfig(({ mode }) => ({
  base: mode === 'web' ? './' : '/',
  build: mode === 'web' ? { outDir: 'dist-web' } : {},
  plugins: [react(), tailwindcss(), ...(mode === 'web' ? [stripAdSense()] : [])],
}))
