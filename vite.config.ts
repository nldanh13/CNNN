import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base:'./',
  plugins:[react()],
  server:{
    host:'0.0.0.0',
    port:3000,
    cors:true,
    fs:{deny:['.env','.env.*','*.{crt,pem}','**/.git/**',
      '**/private-data/**','**/dist-private/**','**/public/private/**']},
  },
  preview:{
    host:'0.0.0.0',
    port:3000,
  },
  build:{outDir:'dist'},
});
