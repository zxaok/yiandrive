const axios = require('axios');

// 缓存对象，用于存储 URL 和缓存时间
const cache = {};

// 缓存有效期（单位：毫秒），这里设置为 10 分钟
const CACHE_TTL = 10 * 60 * 1000;

// API 路由处理
module.exports = async (req, res) => {
  // 从 URL 中提取路径部分（例如 'yy/1355652820' 或 'bilibili/23138275'）
  const videoPath = req.url.slice(1);  // 获取路径部分（去掉前导的斜杠）

  if (!videoPath) {
    return res.status(400).json({ error: 'Missing video path' });
  }

  const now = Date.now();
  const cached = cache[videoPath];

  // 如果缓存存在且未过期，直接返回缓存的 URL
  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log(`Returning cached URL for ${videoPath}`);
    return res.redirect(cached.url);  // 使用 res.redirect() 进行重定向
  }

  // 构造最终请求的 URL
  const url = `http://dns.yiandrive.com:16813/${videoPath}`;
  const userAgent = 'okhttp'; // 设置 User-Agent 为 okhttp

  try {
    console.log(`Fetching URL: ${url}`);

    // 使用 axios 请求并禁用自动重定向
    const response = await axios.get(url, {
      headers: {
        'User-Agent': userAgent,
      },
      maxRedirects: 0,  // 禁用自动重定向
    });

    // 如果响应状态是 302（重定向），获取最终重定向的 URL
    if (response.status === 302 && response.headers.location) {
      console.log(`302 Redirect found for ${videoPath}. Redirecting to: ${response.headers.location}`);

      // 缓存新的 URL 和时间戳
      cache[videoPath] = {
        url: response.headers.location,
        timestamp: now,
      };

      return res.redirect(response.headers.location);  // 使用 res.redirect() 进行重定向
    } else {
      throw new Error('No redirect location found');
    }
  } catch (error) {
    if (error.response && error.response.status === 302) {
      // 如果是 302 错误，获取 Location 头部
      const finalUrl = error.response.headers.location;
      console.log(`302 Redirect found for ${videoPath}. Redirecting to: ${finalUrl}`);

      // 缓存新的 URL 和时间戳
      cache[videoPath] = {
        url: finalUrl,
        timestamp: Date.now(),
      };

      return res.redirect(finalUrl);  // 使用 res.redirect() 进行重定向
    }

    console.error('Error fetching video URL:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
