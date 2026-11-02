import fs from 'node:fs'
import path from 'node:path'
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)])
for(const p of walk('web-admin/src')) {
  const text=fs.readFileSync(p,'utf8')
  if (/admin\.js|admin\.css|window\.(?:alert|confirm|prompt)\s*\(/.test(text))throw Error(`禁止旧版资源或浏览器原生反馈弹窗：${p}`)
  const limit=p.endsWith('App.vue')?32000:16000
  if(/\.vue$/.test(p)&&Buffer.byteLength(text)>limit)throw Error(`请按职责拆分组件：${p}`)
}
console.log('Independent authorization frontend architecture checks passed.')
