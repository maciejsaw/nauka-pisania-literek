export function parseReleaseTag(tag) {
  const match = /^v([1-9]\d?)\.(\d{1,2})\.(\d{1,2})(?:-beta\.([1-9]\d?))?$/.exec(tag);
  if (!match) throw new Error('Użyj taga v1.2.3 lub v1.2.3-beta.1; major 1–99, minor/patch 0–99.');
  const [,a,b,c,beta] = match;
  if (beta && +beta > 98) throw new Error('Dla jednej wersji obsługujemy beta.1 do beta.98.');
  const version = `${+a}.${+b}.${+c}`;
  const build = (+a * 10000 + +b * 100 + +c) * 100 + (beta ? +beta : 99);
  // Same monotonically increasing number, formatted within Apple's 4.2.2 digit limits.
  const iosBuild = `${Math.floor(build / 10000)}.${Math.floor(build / 100) % 100}.${build % 100}`;
  return { version, build, iosBuild, channel: beta ? 'beta' : 'production' };
}
