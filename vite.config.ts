import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base:'./',
  plugins:[react()],
  server:{
    host:'127.0.0.1',
    cors:{origin:/^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?$/},
    fs:{deny:['.env','.env.*','*.{crt,pem}','**/.git/**',
      '**/private-data/**','**/dist-private/**','**/public/private/**']},
  },
  build:{outDir:'dist'},
});
