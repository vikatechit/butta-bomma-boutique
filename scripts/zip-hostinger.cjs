/**
 * Creates butta-bomma-hostinger.zip for Hostinger "Upload your files" deploy.
 * Excludes node_modules, dist, .git, and local env files.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const outZip = path.join(root, 'butta-bomma-hostinger.zip');

if (fs.existsSync(outZip)) fs.unlinkSync(outZip);

const exclude = [
  'node_modules',
  'dist',
  '.git',
  '.env',
  '.env.local',
  'butta-bomma-hostinger.zip',
  'boutique.db-shm',
  'boutique.db-wal',
];

const isWin = process.platform === 'win32';

if (isWin) {
  // PowerShell Compress-Archive can't easily exclude; use tar if available, else robocopy temp
  const staging = path.join(root, '.hostinger-staging');
  fs.rmSync(staging, { recursive: true, force: true });
  fs.mkdirSync(staging, { recursive: true });

  const copyRecursive = (src, dest) => {
    const base = path.basename(src);
    if (exclude.includes(base)) return;
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      for (const name of fs.readdirSync(src)) {
        copyRecursive(path.join(src, name), path.join(dest, name));
      }
    } else {
      fs.copyFileSync(src, dest);
    }
  };

  for (const name of fs.readdirSync(root)) {
    if (exclude.includes(name)) continue;
    if (name === '.hostinger-staging') continue;
    copyRecursive(path.join(root, name), path.join(staging, name));
  }

  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '${staging}\\*' -DestinationPath '${outZip}' -Force"`,
    { stdio: 'inherit' }
  );
  fs.rmSync(staging, { recursive: true, force: true });
} else {
  const excludes = exclude.map((e) => `--exclude=${e}`).join(' ');
  execSync(`cd "${root}" && zip -r "${outZip}" . ${excludes}`, { stdio: 'inherit' });
}

console.log('\nCreated:', outZip);
console.log('Upload this ZIP in Hostinger → Add Website → Node.js → Upload your files\n');
