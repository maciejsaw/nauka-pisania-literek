// A user-requested rating uses the store page: native review prompts can silently
// disappear because of store quotas, and Apple disables them in TestFlight.
export async function openStoreRating({ platform, channel, launcher }) {
  const urls = {
    ios: 'https://apps.apple.com/app/id6823056260?action=write-review',
    android: 'https://play.google.com/store/apps/details?id=com.maciejsawicki.pajaczek',
  };
  if (!urls[platform]) throw new Error('unsupported-platform');
  if (channel !== 'production') return 'beta';
  const result = await launcher.openUrl({ url: urls[platform] });
  if (!result.completed) throw new Error('store-unavailable');
  return 'opened';
}
