const axios = require('axios');
const LRU = require('lru-cache');
const pLimit = require('p-limit');

const cache = new LRU({
  max: 1000,
  maxSize: 30 * 1024 * 1024,  
  ttl: 10 * 60 * 1000,  
});

const limit = pLimit(5);  

module.exports = async (req, res) => {
  const videoPath = req.url.slice(1);  

  if (!videoPath) {
    return res.status(400).json({ error: 'Missing video path' });
  }

  const cached = cache.get(videoPath);  

  if (cached) {
    return res.redirect(cached);  
  }

  const url = `http://dns.yiandrive.com:16813/${videoPath}`;
  const userAgent = 'okhttp';  

  try {
    const response = await limit(() => axios.get(url, {
      headers: { 'User-Agent': userAgent },
      maxRedirects: 0,  
    }));

    if (response.status === 302 && response.headers.location) {
      const finalUrl = response.headers.location;

      cache.set(videoPath, finalUrl);

      return res.redirect(finalUrl);  
    } else {
      return res.status(500).json({ error: 'No redirect location found' });
    }
  } catch (error) {
    if (error.response && error.response.status === 302) {
      const finalUrl = error.response.headers.location;

      cache.set(videoPath, finalUrl);

      return res.redirect(finalUrl);  
    }

    return res.status(500).json({ error: error.message });
  }
};
