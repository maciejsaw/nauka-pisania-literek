import test from 'node:test';
import assert from 'node:assert/strict';
import { parseReleaseTag } from '../scripts/release-version.mjs';
test('builds increase from beta to production and across versions', () => {
  const tags=['v1.0.0-beta.1','v1.0.0-beta.2','v1.0.0-beta.98','v1.0.0','v1.0.1-beta.1','v1.0.1','v1.1.0','v2.0.0'];
  const builds=tags.map(parseReleaseTag);
  for(let i=1;i<builds.length;i++) assert.ok(builds[i].build > builds[i-1].build);
  for(const v of [...builds,parseReleaseTag('v99.99.99')]) {
    assert.ok(v.build<2100000000);
    assert.match(v.iosBuild,/^\d{1,4}\.\d{1,2}\.\d{1,2}$/);
  }
});
test('invalid tags never reach build scripts',()=> {
  for(const tag of ['main','v1.2','v1.2.3-beta.99','v1.2.3;echo x','v100.0.0','v1.100.0']) assert.throws(()=>parseReleaseTag(tag));
});
