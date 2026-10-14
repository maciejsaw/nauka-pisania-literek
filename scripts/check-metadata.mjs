import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
for (const [file, max] of [
  ['store/ios/metadata/pl/name.txt',30], ['store/ios/metadata/pl/subtitle.txt',30], ['store/ios/metadata/pl/keywords.txt',100],
  ['store/android/metadata/pl-PL/title.txt',30], ['store/android/metadata/pl-PL/short_description.txt',80],
  ['store/android/metadata/pl-PL/full_description.txt',4000],
]) {
  const text = (await readFile(file,'utf8')).trim();
  if (!text || [...text].length > max) throw new Error(`${file}: przekroczony limit ${max} znaków lub brak tekstu`);
}
for (const [file,w,h,opaque] of [
  ['assets/branding/icon-1024.png',1024,1024,true],
  ['store/android/metadata/pl-PL/images/icon.png',512,512,true],
  ['store/android/metadata/pl-PL/images/featureGraphic.png',1024,500,true],
  ['store/ios/screenshots/pl/1-iphone.png',1320,2868,false],
  ['store/ios/screenshots/pl/1-ipad.png',2064,2752,false],
]) {
  const m = await sharp(file).metadata();
  if(m.width!==w || m.height!==h || (opaque && m.hasAlpha)) throw new Error(`Nieprawidłowy format grafiki: ${file}`);
}
console.log('Opisy, ikony i rozdzielczości zrzutów poprawne.');
