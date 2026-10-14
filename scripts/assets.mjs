import sharp from 'sharp';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
const svg = await readFile('assets/branding/icon.svg');
async function png(file, size) { await mkdir(file.slice(0, file.lastIndexOf('/')), { recursive: true }); await sharp(svg).resize(size, size).flatten({ background: '#f9fbfd' }).png().toFile(file); }
await png('assets/branding/icon-1024.png', 1024);
await png('public/icon.png', 192);
await png('store/android/metadata/pl-PL/images/icon.png', 512);
await png('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png', 1024);
for (const [density, size] of Object.entries({ mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 })) {
  for (const name of ['ic_launcher', 'ic_launcher_round']) await png(`android/app/src/main/res/mipmap-${density}/${name}.png`, size);
  // Keep artwork in the adaptive icon safe area; transparent outer padding.
  const foreground = await sharp(svg).resize(size, size).png().toBuffer();
  await sharp({ create: { width: Math.round(size * 2.25), height: Math.round(size * 2.25), channels: 4, background: '#f9fbfd' } }).composite([{ input: foreground, gravity: 'centre' }]).png().toFile(`android/app/src/main/res/mipmap-${density}/ic_launcher_foreground.png`);
}
const small = await sharp(svg).resize(512, 512).png().toBuffer();
const splash = await sharp({ create: { width: 2732, height: 2732, channels: 3, background: '#f9fbfd' } }).composite([{ input: small, gravity: 'centre' }]).png().toBuffer();
for (const suffix of ['', '-1', '-2']) await writeFile(`ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732${suffix}.png`, splash);
const feature = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500"><rect width="1024" height="500" fill="#f9fbfd"/><path d="M0 100H1024M0 400H1024" stroke="#b8c7da" stroke-width="3"/><path d="M0 250H1024" stroke="#df776c" stroke-width="3"/><text x="430" y="205" font-family="sans-serif" font-size="65" font-weight="bold" fill="#1d3f8f">Pajączek</text><text x="430" y="280" font-family="sans-serif" font-size="42" fill="#1d3f8f">Nauka literek</text><text x="430" y="340" font-family="sans-serif" font-size="24" fill="#5c6880">Małe kroki. Wielka radość pisania.</text></svg>`;
await writeFile('assets/branding/feature.svg', feature);
await sharp(Buffer.from(feature)).composite([{ input: await sharp(svg).resize(360, 360).png().toBuffer(), left: 35, top: 65 }]).png().toFile('store/android/metadata/pl-PL/images/featureGraphic.png');
console.log('Ikony i grafiki sklepowe wygenerowane.');

// Replace every generated Android splash density, including pre-Android-12 fallback.
for (const dir of await readdir('android/app/src/main/res')) {
  if (!dir.startsWith('drawable')) continue;
  const target = `android/app/src/main/res/${dir}/splash.png`;
  try {
    const { width, height } = await sharp(target).metadata();
    const logo = await sharp(svg).resize(Math.round(Math.min(width, height) * .28)).png().toBuffer();
    await sharp({ create: { width, height, channels: 3, background: '#f9fbfd' } }).composite([{ input: logo, gravity: 'centre' }]).png().toFile(target + '.tmp');
    await writeFile(target, await readFile(target + '.tmp'));
    await (await import('node:fs/promises')).unlink(target + '.tmp');
  } catch (error) { if (error.code !== 'ENOENT' && !String(error).includes('Input file is missing')) throw error; }
}
