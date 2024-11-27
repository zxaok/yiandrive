import fetch from 'node-fetch';  // 使用 import 语法
import NodeCache from 'node-cache';
import pLimit from 'p-limit';

const cache = new NodeCache({ stdTTL: 600 });  // 缓存10分钟
const limit = pLimit(5);  // 最大并发请求数为5

module.exports = async (req, res) => {
  const path = req.url.replace('/api/', ''); // 获取路径参数
  const cacheKey = `videoLink:${path}`;  // 使用路径作为缓存的键

  // 尝试从缓存获取结果
  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    return res.redirect(cachedResult);  // 如果缓存有结果，直接重定向
  }

  const url = `http://dns.yiandrive.com:16813${req.url}`;  // 拼接请求URL
  const userAgent = 'okhttp';  // 设置 User-Agent 为 okhttp

  try {
    // 发送请求并跟随重定向
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // 获取最终重定向的 URL
    const finalUrl = response.url;

    // 将结果缓存并设置有效期为10分钟
    cache.set(cacheKey, finalUrl);

    // 返回重定向到目标 URL
    return res.redirect(finalUrl);

  } catch (error) {
    console.error('Error fetching video link:', error);
    return res.status(500).send('Internal Server Error');
  }
};
