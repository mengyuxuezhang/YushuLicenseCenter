import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)])
for (const file of ['cloud','src','scripts'].flatMap(walk).filter(p=>p.endsWith('.mjs'))) {
  const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(result.status)process.exit(result.status)
}
console.log('Authorization center syntax checks passed.')
