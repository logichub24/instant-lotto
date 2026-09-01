const AD_GROUP_ID = 'ait.v2.live.5a086cda9cb04762';
let sdk;
let loaded = false;
let loading = false;

async function getSdk() {
  try { return sdk ??= await import('@apps-in-toss/web-framework'); } catch { return null; }
}

export async function preloadFullScreenAd() {
  const framework = await getSdk();
  if (!framework || loading || loaded) return;
  try {
    if (!framework.loadFullScreenAd.isSupported()) return;
    loading = true;
    framework.loadFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: event => { if (event.type === 'loaded') loaded = true; loading = false; },
      onError: () => { loading = false; },
    });
  } catch { loading = false; }
}

export async function showFullScreenAd() {
  const framework = await getSdk();
  if (!framework || !loaded) return false;
  loaded = false;
  try {
    framework.showFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: event => {
        if (event.type === 'dismissed' || event.type === 'failedToShow') preloadFullScreenAd();
      },
      onError: preloadFullScreenAd,
    });
    return true;
  } catch { preloadFullScreenAd(); return false; }
}
