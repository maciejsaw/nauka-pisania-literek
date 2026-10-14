import { readFile, writeFile, appendFile } from 'node:fs/promises';
const ref = process.env.RELEASE_TAG || process.env.GITHUB_REF_NAME || 'v1.0.0-beta.1';
const match = /^v(\d+)\.(\d+)\.(\d+)(?:-beta\.([1-9]\d{0,2}))?$/.exec(ref);
if (!match) throw new Error('Użyj taga v1.2.3 lub v1.2.3-beta.1');
const [, a, b, c, beta] = match;
if (+a > 99 || +b > 99 || +c > 99) throw new Error('Składniki wersji muszą mieścić się w 0–99.');
const version = `${a}.${b}.${c}`;
// beta.1 < beta.2 < production; deterministic and safely below Google Play's limit.
const number = (+a * 10000 + +b * 100 + +c) * 1000 + (beta ? +beta : 999);
if (number > 2100000000 || number < 1) throw new Error('Nieprawidłowy versionCode');
const channel = beta ? 'beta' : 'production';
const env = `APP_VERSION=${version}\nBUILD_NUMBER=${number}\nRELEASE_CHANNEL=${channel}\n`;
if (process.env.GITHUB_ENV) await appendFile(process.env.GITHUB_ENV, env);
if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `version=${version}\nbuild=${number}\nchannel=${channel}\n`);
const file = 'ios/App/App.xcodeproj/project.pbxproj';
let pbx = await readFile(file, 'utf8');
pbx = pbx.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${version};`).replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${number};`);
await writeFile(file, pbx);
console.log(env);
