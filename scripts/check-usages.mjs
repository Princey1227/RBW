import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve('c:/Users/princ/Downloads/frontend-rbw-cinematic/frontend');
const compDir = path.join(projectRoot, 'component');

function getFiles(dir) {
  let res = [];
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) res = res.concat(getFiles(full));
    else if (f.name.endsWith('.tsx') || f.name.endsWith('.ts')) res.push(full);
  }
  return res;
}

const comps = getFiles(compDir);

// Read all source code files in app, component, context, lib
const sourceDirs = ['app', 'component', 'context', 'lib'];
let allSources = [];
for (const d of sourceDirs) {
  allSources = allSources.concat(getFiles(path.join(projectRoot, d)));
}

console.log(`Auditing ${comps.length} components across ${allSources.length} source files...`);

const unused = [];

for (const compPath of comps) {
  const baseName = path.basename(compPath, path.extname(compPath));
  let count = 0;

  for (const srcPath of allSources) {
    if (srcPath === compPath) continue;
    const content = fs.readFileSync(srcPath, 'utf8');
    if (content.includes(baseName)) {
      count++;
    }
  }

  if (count === 0) {
    unused.push(path.relative(projectRoot, compPath));
  }
}

console.log('Unused component files:');
console.log(JSON.stringify(unused, null, 2));
