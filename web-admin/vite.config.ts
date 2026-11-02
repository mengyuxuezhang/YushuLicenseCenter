import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
export default defineConfig({plugins:[vue()],base:'/license-center/',server:{proxy:{'/api':'http://127.0.0.1:17881'}},test:{environment:'happy-dom',globals:true,setupFiles:['./tests/setup.ts']}})
