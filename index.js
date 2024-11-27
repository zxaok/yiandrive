const fetch = require('node-fetch');
const NodeCache = require('node-cache');
const pLimit = require('p-limit');

// 缓存配置：设置缓存时间为600秒（10分钟）
const myCache = new NodeCache({ stdTTL: 600 }); 
const limit = pLimit(5); // 限制并发请求数为5

module.exports = async (req, res) => {
  const slug = req.params.slug;  // 获取请求的后缀部分（例如 "douyu/122402"）
  const cacheKey = `video:${slug}`;  // 使用请求的路径作为缓存键

  // 检查缓存中是否存在结果
  const cachedUrl = myCache.get(cacheKey);
  if (cachedUrl) {
    console.log('Using cached URL');
    return res.redirect(cachedUrl); // 如果缓存中有结果，直接重定向
  }

  const url = `http://dns.yiandrive.com:16813/${slug}`;
  const userAgent = 'okhttp'; // 设置 User-Agent 为 okhttp

  try {
    // 使用 limit 对请求进行并发控制
    const response = await limit(async () => {
      const apiResponse = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': userAgent },
      });

      if (!apiResponse.ok) {
        throw new Error(`HTTP error! Status: ${apiResponse.status}`);
      }

      // 获取最终的重定向 URL
      const finalUrl = apiResponse.url;
      
      // 将结果缓存10分钟
      myCache.set(cacheKey, finalUrl);
      return finalUrl;
    });

    // 返回最终的重定向链接
    return res.redirect(response);
  } catch (error) {
    console.error('Error fetching video link:', error);
    return res.status(500).send('Internal Server Error');
  }
};
