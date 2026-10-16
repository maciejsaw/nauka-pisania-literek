import test from 'node:test';
import assert from 'node:assert/strict';
import { openStoreRating } from '../src/store-rating.js';

for (const [platform, url] of [
  ['ios', 'https://apps.apple.com/app/id6823056260?action=write-review'],
  ['android', 'https://play.google.com/store/apps/details?id=com.maciejsawicki.pajaczek'],
]) {
  test(`${platform}: manual rating opens this app's official store page`, async () => {
    const calls = [];
    const launcher = { openUrl: async args => { calls.push(args); return { completed: true }; } };
    assert.equal(await openStoreRating({ platform, channel: 'production', launcher }), 'opened');
    assert.deepEqual(calls, [{ url }]);
  });
  test(`${platform}: beta avoids public ratings for an unpublished app`, async () => {
    const launcher = { openUrl: () => assert.fail('Beta must not open the public listing') };
    assert.equal(await openStoreRating({ platform, channel: 'beta', launcher }), 'beta');
  });
}
test('failed or rejected store launch is reported, never treated as a submitted rating', async () => {
  for (const openUrl of [async () => ({ completed: false }), async () => { throw new Error('offline'); }]) {
    await assert.rejects(openStoreRating({ platform: 'ios', channel: 'production', launcher: { openUrl } }));
  }
});
test('web cannot launch a native rating flow', async () => {
  await assert.rejects(openStoreRating({ platform: 'web', channel: 'production', launcher: {} }), /unsupported-platform/);
});
