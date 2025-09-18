// news_ingest/fetch_articles.js

// ✅ TEMP FIX for Node 18 "File is not defined" (used by rss-parser/undici)
if (typeof global.File === 'undefined') {
  global.File = class File {}; // Dummy File class
}

import RSSParser from 'rss-parser';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as cheerio from 'cheerio';

// ✅ RSS feeds from trusted sources
const RSS_FEEDS = [
  'https://feeds.bbci.co.uk/news/rss.xml',
  //'https://rss.cnn.com/rss/edition.rss',
  'https://feeds.reuters.com/reuters/topNews',
];

// ✅ Output directory
const OUTPUT_DIR = './news_ingest/sample_articles';
await fs.mkdir(OUTPUT_DIR, { recursive: true });

// ✅ Sanitize filename for saving
function sanitizeFilename(title) {
  return title.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40);
}

// ✅ Extract <meta property="og:image">
function extractOgImage($) {
  return $('meta[property="og:image"]').attr('content') || null;
}

async function fetchAndSaveArticles() {
  const rssParser = new RSSParser();
  let total = 0;

  for (const feedUrl of RSS_FEEDS) {
    console.log(`\n🔗 Fetching feed: ${feedUrl}`);

    const feed = await rssParser.parseURL(feedUrl);

    for (const item of feed.items) {
      if (!item.link) continue;

      try {
        const response = await axios.get(item.link, {
          headers: {
            'User-Agent': 'Mozilla/5.0', // Helps prevent some blocks
          },
          timeout: 10000,
        });

        const $ = cheerio.load(response.data);
        const paragraphs = $('p').map((i, el) => $(el).text()).get();
        const content = paragraphs.join('\n').trim();

        if (content.length < 500) {
          console.log(`⚠️ Skipped (too short): ${item.link}`);
          continue;
        }

        const article = {
          title: item.title || 'Untitled',
          link: item.link,
          pubDate: item.pubDate || null,
          content,
          image: extractOgImage($),
        };

        const safeName = sanitizeFilename(article.title);
        const filename = path.join(OUTPUT_DIR, `${safeName}_${Date.now()}.json`);

        await fs.writeFile(filename, JSON.stringify(article, null, 2));
        console.log(`✅ Saved: ${filename}`);
        total++;

        if (total >= 50) break;
      } catch (err) {
        console.warn(`❌ Error fetching ${item.link}: ${err.message}`);
      }
    }

    if (total >= 50) break;
  }

  console.log(`\n✅ Total articles saved: ${total}`);
}

fetchAndSaveArticles().catch((err) => {
  console.error('❌ Script error:', err);
});
