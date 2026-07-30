/**
 * Video Downloader Service
 * Resolves direct MP4 video URLs and metadata for TikTok (no watermark), Instagram, Facebook, and Twitter.
 */

const BROWSER_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';
const BOT_USER_AGENT = 'TelegramBot (like TwitterBot/1.0)';

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
 * @returns {Promise<{ title: string, author: string, videoUrl: string, cover: string|null, isDirectLink?: boolean }>}
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
      isDirectLink: true,
    };
  }

  throw new Error(data?.msg || 'Gagal mengekstrak video TikTok.');
}

/**
 * Extracts shortcode from Instagram URL (e.g. /reel/DZ-8RoJTYgv/ or /p/DZbxPPjTqHe/ or /share/reel/...).
 *
 * @param {string} url
 * @returns {string|null}
 */
export function extractInstagramShortcode(url) {
  const match = url.match(/\/(reel|reels|p|share\/reel|tv)\/([A-Za-z0-9_-]+)/i);
  return match ? match[2] : null;
}

/**
 * Fetches Instagram Reels/Posts video details with multi-candidate checks and safe fallback.
 *
 * @param {string} cleanUrl
 * @returns {Promise<{ title: string, author: string, videoUrl: string, cover: string|null, isDirectLink: boolean, shortcode: string|null }>}
 */
async function fetchInstagramVideo(cleanUrl) {
  const shortcode = extractInstagramShortcode(cleanUrl);

  // 1. Direct shortcode offload stream candidates
  if (shortcode) {
    const candidates = [
      `https://vxinstagram.com/offload/${shortcode}/0.mp4`,
      `https://ddinstagram.com/videos/${shortcode}/1.mp4`,
      `https://vxinstagram.com/offload/${shortcode}/1.mp4`,
    ];

    for (const cand of candidates) {
      try {
        const res = await fetch(cand, {
          method: 'GET',
          headers: {
            'User-Agent': BROWSER_USER_AGENT,
            'Range': 'bytes=0-1024',
          },
        });

        if (res.ok || res.status === 206) {
          const cType = res.headers.get('content-type') || '';
          const cLen = Number(res.headers.get('content-length') || res.headers.get('content-range')?.split('/')[1] || 0);

          if (cType.includes('video') || cType.includes('octet-stream') || cLen > 1000) {
            return {
              title: 'Instagram Reel',
              author: 'Instagram User',
              videoUrl: cand,
              cover: null,
              isDirectLink: true,
              shortcode,
            };
          }
        }
      } catch (e) {
        console.warn('[Video Downloader] Offload candidate check failed:', cand, e.message);
      }
    }
  }

  // 2. Scraping Fallback from vxinstagram / ddinstagram / kkinstagram HTML
  const scrapeTargets = shortcode
    ? [
        `https://ddinstagram.com/reel/${shortcode}/`,
        `https://vxinstagram.com/reel/${shortcode}/`,
        `https://kkinstagram.com/reel/${shortcode}/`,
      ]
    : [cleanUrl.replace('instagram.com', 'vxinstagram.com')];

  for (const targetUrl of scrapeTargets) {
    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': BOT_USER_AGENT,
        },
      });

      if (!response.ok) continue;

      const html = await response.text();

      // Extract og:video property URL
      const videoMatch = html.match(/property="og:video"\s+content="([^"]+)"/) ||
                         html.match(/content="([^"]+)"\s+property="og:video"/);

      if (videoMatch && videoMatch[1]) {
        const directMp4Url = videoMatch[1].replace(/&amp;/g, '&');
        const titleMatch = html.match(/property="og:title"\s+content="([^"]+)"/) ||
                           html.match(/content="([^"]+)"\s+property="og:title"/);

        return {
          title: titleMatch ? titleMatch[1] : 'Instagram Reel',
          author: 'Instagram User',
          videoUrl: directMp4Url,
          cover: null,
          isDirectLink: true,
          shortcode,
        };
      }
    } catch (e) {
      console.warn(`[Video Downloader] IG scrape target ${targetUrl} failed:`, e.message);
    }
  }

  // 3. Non-failing fallback button link if direct MP4 stream could not be extracted
  if (shortcode) {
    return {
      title: 'Instagram Reel',
      author: 'Instagram User',
      videoUrl: `https://vxinstagram.com/reel/${shortcode}/`,
      cover: null,
      isDirectLink: false,
      shortcode,
    };
  }

  throw new Error('Gagal mengekstrak video Instagram dari link tersebut. Pastikan link publik!');
}

/**
 * Main function to resolve video download details.
 *
 * @param {string} rawUrl - The video URL submitted by user.
 * @returns {Promise<{ success: boolean, platform: string, title: string, author: string, videoUrl: string, cover?: string, isDirectLink?: boolean, shortcode?: string }>}
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
              isDirectLink: true,
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
