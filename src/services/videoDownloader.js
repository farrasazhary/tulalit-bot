/**
 * Video Downloader Service
 * Resolves direct MP4 video URLs and metadata for TikTok (no watermark), Instagram, Facebook, and Twitter.
 */

/**
 * Detects the social media platform from a given URL.
 *
 * @param {string} url
 * @returns {'tiktok' | 'instagram' | 'facebook' | 'twitter' | 'unknown'}
 */
export function detectPlatform(url) {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('tiktok.com') || lowerUrl.includes('vt.tiktok') || lowerUrl.includes('vm.tiktok')) {
    return 'tiktok';
  }
  if (lowerUrl.includes('instagram.com') || lowerUrl.includes('instagr.am')) {
    return 'instagram';
  }
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.watch') || lowerUrl.includes('fb.gg')) {
    return 'facebook';
  }
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
    return 'twitter';
  }
  return 'unknown';
}

/**
 * Fetches TikTok video details using TikWM API (Fast & No Watermark).
 *
 * @param {string} url
 * @returns {Promise<{ title: string, author: string, videoUrl: string, cover: string }>}
 */
async function fetchTikTokVideo(url) {
  const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
  if (!response.ok) {
    throw new Error(`TikWM API HTTP error ${response.status}`);
  }

  const data = await response.json();
  if (data?.code === 0 && data?.data?.play) {
    const playUrl = data.data.play.startsWith('http') ? data.data.play : `https://www.tikwm.com${data.data.play}`;
    return {
      title: data.data.title || 'TikTok Video',
      author: data.data.author?.nickname || data.data.author?.unique_id || 'TikTok User',
      videoUrl: playUrl,
      cover: data.data.cover || null,
    };
  }

  throw new Error(data?.msg || 'Gagal mengekstrak video TikTok.');
}

/**
 * Fetches video details using Cobalt Engine API (Supports IG, FB, Twitter, TikTok fallback).
 *
 * @param {string} url
 * @returns {Promise<{ title: string, author: string, videoUrl: string, cover: string|null }>}
 */
async function fetchCobaltVideo(url) {
  const response = await fetch('https://api.cobalt.tools/', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: url,
      videoQuality: '720',
      downloadMode: 'auto',
    }),
  });

  if (!response.ok) {
    throw new Error(`Cobalt API HTTP error ${response.status}`);
  }

  const data = await response.json();

  if (data?.status === 'stream' || data?.status === 'redirect') {
    return {
      title: data.filename || 'Social Media Video',
      author: 'Media Downloader',
      videoUrl: data.url,
      cover: null,
    };
  }

  if (data?.status === 'picker' && Array.isArray(data?.picker) && data.picker.length > 0) {
    const videoItem = data.picker.find(item => item.type === 'video') || data.picker[0];
    return {
      title: data.filename || 'Social Media Video',
      author: 'Media Downloader',
      videoUrl: videoItem.url,
      cover: videoItem.thumb || null,
    };
  }

  throw new Error(data?.text || 'Gagal mengekstrak video via Cobalt API.');
}

/**
 * Main function to resolve video download details.
 *
 * @param {string} url - The video URL submitted by user.
 * @returns {Promise<{ success: boolean, platform: string, title: string, author: string, videoUrl: string, cover?: string }>}
 */
export async function downloadVideo(url) {
  const platform = detectPlatform(url);

  // 1. Try TikTok dedicated API first
  if (platform === 'tiktok') {
    try {
      const result = await fetchTikTokVideo(url);
      return { success: true, platform: 'TikTok (No WM)', ...result };
    } catch (tikTokError) {
      console.warn('[Video Downloader] TikWM failed, trying Cobalt fallback...', tikTokError.message);
    }
  }

  // 2. Try Cobalt API for IG, FB, Twitter, or TikTok fallback
  try {
    const result = await fetchCobaltVideo(url);
    const platformName = platform === 'instagram' ? 'Instagram' :
                         platform === 'facebook' ? 'Facebook' :
                         platform === 'twitter' ? 'Twitter/X' : 'Social Media';
    return { success: true, platform: platformName, ...result };
  } catch (cobaltError) {
    console.error('[Video Downloader] Cobalt extraction failed:', cobaltError.message);
  }

  // 3. Fallback for TikTok if Cobalt also failed (try secondary proxy)
  if (platform === 'tiktok') {
    try {
      const response = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const data = await response.json();
        if (data?.video?.noWatermark) {
          return {
            success: true,
            platform: 'TikTok (No WM)',
            title: data.title || 'TikTok Video',
            author: data.author?.name || 'TikTok User',
            videoUrl: data.video.noWatermark,
            cover: data.cover || null,
          };
        }
      }
    } catch (e) {
      console.error('[Video Downloader] Secondary TikTok fallback failed:', e.message);
    }
  }

  throw new Error('Gagal mengekstrak video dari link tersebut. Pastikan link publik dan valid!');
}
