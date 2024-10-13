import { defineConfig, loadEnv } from 'vite';
import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from "fs"
import ip from "ip"
export default defineConfig(({ mode }) => {
  const localenv = loadEnv(process.env.NODE_ENV, process.cwd() + "\\config");
  const env = loadEnv(mode, process.cwd());
  env.VITE_API_URL = `${"http://" + ip.address()}`;
  env.VITE_PORT = `${localenv.VITE_PORT}`;
  let API_URL
  let PORT
  if (process.env.NODE_ENV != "raspberry") {
    let text = "VITE_API_URL = " + env.VITE_API_URL
    text += "\n" + "VITE_PORT = " + env.VITE_PORT
    fs.writeFileSync(".env", text)

    API_URL = `${env.VITE_API_URL ?? 'http://localhost:3000'}`;
    PORT = `${env.VITE_PORT ?? '3000'}`;
  } else {
    API_URL = 'http://localhost:5174';
    PORT = '5174';
  }
  return {
    server: {
      proxy: {
        '/api': API_URL,
      },
      port: PORT,
      host: true
    },
    build: {
      outDir: 'public',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      // include: ["vue"]
    },
    plugins: [
      vue(),
      legacy(),],
  };
});