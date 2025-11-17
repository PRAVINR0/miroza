const axios = require('axios')
const fs = require('fs')
const path = require('path')

/**
 * Simple script to fetch latest news using NewsAPI.org
 *
 * Usage:
 *   set NEWSAPI_KEY=your_key; node scripts/fetch-news.js
 * or (PowerShell): $env:NEWSAPI_KEY="your_key"; node scripts/fetch-news.js
 *
 * Result is written to `data/news.json` with keys: `india`, `tamilnadu`.
 */

async function fetchTopHeadlines(country = 'in') {
  const key = process.env.NEWSAPI_KEY
  if (!key) throw new Error('Missing NEWSAPI_KEY environment variable')

  const url = `https://newsapi.org/v2/top-headlines?country=${country}&pageSize=30&apiKey=${key}`
  const res = await axios.get(url)
  return res.data.articles || []
}

async function fetchTamilNadu() {
  const key = process.env.NEWSAPI_KEY
  const q = encodeURIComponent('Tamil Nadu')
  const url = `https://newsapi.org/v2/everything?q=${q}&language=en&pageSize=30&sortBy=publishedAt&apiKey=${key}`
  const res = await axios.get(url)
  return res.data.articles || []
}

async function main() {
  try {
    console.log('Fetching India headlines...')
    const india = await fetchTopHeadlines('in')
    console.log('Fetching Tamil Nadu results...')
    const tamilnadu = await fetchTamilNadu()

    const out = { india, tamilnadu }
    const outPath = path.join(process.cwd(), 'data', 'news.json')
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8')
    console.log('Saved news to', outPath)
  } catch (err) {
    console.error('Error fetching news:', err.message)
    process.exit(1)
  }
}

main()
