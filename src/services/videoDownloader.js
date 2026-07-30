/**
 * Video Downloader Service
 * Resolves direct MP4 video URLs and metadata for TikTok (no watermark), Instagram, Facebook, and Twitter.
 */

/**
 * Cleans tracking parameters from a URL (e.g. ?utm_source=..., &igsh=...).
 *
 * @param {string} url
 * @returns {string} Cleaned URL
 */
export function cleanMediaUrl(url) {
  try {
    const parsed = new URL(url.trim());
    parsed.search = '';
    return parsed.toString();
  } catch {
    return url.trim().split('?')[0];
  }
}

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
  if (lowerUrl.includes('instagram.com') || lowerUrl.includes('instagr.am') || lowerUrl.includes('vxinstagram.com') || lowerUrl.includes('ddinstagram.com')) {
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
 * @param {string} cleanUrl
 * @returns {Promise<{ title: string, author: string, videoUrl: string, cover: string|null }>}
 */
async function fetchTikTokVideo(cleanUrl) {
  const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`);
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
 * Extracts shortcode from Instagram URL (e.g. /reel/DbNW_yvTYe9/ or /p/DbNW_yvTYe9/ or /share/reel/DbNW_yvTYe9/).
 *
 * @param {string} url
 * @returns {string|null}
 */
export function extractInstagramShortcode(url) {
  const match = url.match(/\/(reel|reels|p|share\/reel|tv)\/([A-Za-z0-9_-]+)/i);
  return match ? match[2] : null;
}

/**
 * Fetches Instagram Reels/Posts video details using direct offload + multi-provider fallback.
 *
 * @param {string} cleanUrl
 * @returns {Promise<{ title: string, author: string, videoUrl: string, cover: string|null }>}
 */
async function fetchInstagramVideo(cleanUrl) {
  const shortcode = extractInstagramShortcode(cleanUrl);

  // 1. Direct Shortcode Offload Stream (Fastest & Most Reliable)
  if (shortcode) {
    const directOffloadUrl = `https://vxinstagram.com/offload/${shortcode}/0.mp4`;
    try {
      const headCheck = await fetch(directOffloadUrl, { method: 'HEAD' });
      if (headCheck.ok) {
        return {
          title: 'Instagram Reel',
          author: 'Instagram User',
          videoUrl: directOffloadUrl,
          cover: null,
        };
      }
    } catch (e) {
      console.warn('[Video Downloader] Direct offload HEAD check failed:', e.message);
    }
  }

  // 2. Multi-Provider Scraping Fallback
  const targets = shortcode
    ? [
        `https://vxinstagram.com/reel/${shortcode}/`,
        `https://ddinstagram.com/reel/${shortcode}/`,
        `https://kkinstagram.com/reel/${shortcode}/`,
        `https://instagrs.com/reel/${shortcode}/`,
      ]
    : [cleanUrl.replace('instagram.com', 'vxinstagram.com')];

  for (const targetUrl of targets) {
    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Discordbot/2.0 (+https://discordapp.com)',
        },
      });

      if (!response.ok) continue;

      const html = await response.text();

      // Extract og:video property URL
      const videoMatch = html.match(/property="og:video"\s+content="([^"]+)"/) ||
                         html.match(/content="([^"]+)"\s+property="og:video"/);

      if (videoMatch && videoMatch[1]) {
        const directMp4Url = videoMatch[1].replace(/&amp;/g, '&');

        // Extract title/caption if available
        const titleMatch = html.match(/property="og:title"\s+content="([^"]+)"/) ||
                           html.match(/content="([^"]+)"\s+property="og:title"/);

        return {
          title: titleMatch ? titleMatch[1] : 'Instagram Reel',
          author: 'Instagram User',
          videoUrl: directMp4Url,
          cover: null,
        };
      }
    } catch (e) {
      console.warn(`[Video Downloader] IG target ${targetUrl} failed:`, e.message);
    }
  }

  throw new Error('Gagal mengekstrak video Instagram dari link tersebut. Pastikan link publik!');
}

/**
 * Main function to resolve video download details.
 *
 * @param {string} rawUrl - The video URL submitted by user.
 * @returns {Promise<{ success: boolean, platform: string, title: string, author: string, videoUrl: string, cover?: string }>}
 */
export async function downloadVideo(rawUrl) {
  const cleanUrl = cleanMediaUrl(rawUrl);
  const platform = detectPlatform(cleanUrl);

  // 1. TikTok Handler
  if (platform === 'tiktok') {
    try {
      const result = await fetchTikTokVideo(cleanUrl);
      return { success: true, platform: 'TikTok (No WM)', ...result };
    } catch (tikTokError) {
      console.warn('[Video Downloader] TikWM failed, trying fallback...', tikTokError.message);
      
      // Secondary TikTok fallback
      try {
        const response = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(cleanUrl)}`);
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
        console.error('[Video Downloader] TikTok fallback failed:', e.message);
      }
    }
  }

  // 2. Instagram Handler
  if (platform === 'instagram') {
    try {
      const result = await fetchInstagramVideo(cleanUrl);
      return { success: true, platform: 'Instagram Reels', ...result };
    } catch (igError) {
      console.error('[Video Downloader] Instagram extraction failed:', igError.message);
    }
  }

  // 3. Fallback / General Handler for FB, Twitter, or others
  try {
    const result = await fetchInstagramVideo(cleanUrl);
    const platformName = platform === 'facebook' ? 'Facebook' :
                         platform === 'twitter' ? 'Twitter/X' : 'Social Media';
    return { success: true, platform: platformName, ...result };
  } catch (error) {
    throw new Error('Gagal mengekstrak video dari link tersebut. Pastikan link video publik dan valid!');
  }
}
