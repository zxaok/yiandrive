const axios = require('axios');
const NodeCache = require('node-cache');  

const cache = new NodeCache({ stdTTL: 600, checkperiod: 120, maxKeys: 1000 });

module.exports = async (req, res) => {
  const videoPath = req.url.slice(1);  

  if (!videoPath) {
    return res.status(400).json({ error: 'Missing video path' });
  }

  const cachedUrl = cache.get(videoPath);
  if (cachedUrl) {
    console.log(`Returning cached URL for ${videoPath}`);
    return res.redirect(cachedUrl);  
  }

  const url = `http://dns.yiandrive.com:16813/${videoPath}`;
  const userAgent = 'okhttp';  

  try {
    console.log(`Fetching URL: ${url}`);

    const response = await axios.get(url, {
      headers: { 'User-Agent': userAgent },
      maxRedirects: 0,  
      timeout: 5000,  
    });

    if (response.status === 302 && response.headers.location) {
      console.log(`302 Redirect found for ${videoPath}. Redirecting to: ${response.headers.location}`);

      cache.set(videoPath, response.headers.location);

      return res.redirect(response.headers.location);  
    } else {
      throw new Error('No redirect location found');
    }
  } catch (error) {
    console.error('Error fetching video URL:', error.message);

    if (error.response && error.response.status === 302 && error.response.headers.location) {
      const finalUrl = error.response.headers.location;
      console.log(`302 Redirect found for ${videoPath}. Redirecting to: ${finalUrl}`);

      cache.set(videoPath, finalUrl);

      return res.redirect(finalUrl);  
    }

    return res.status(500).json({ error: error.message });
  }
};
