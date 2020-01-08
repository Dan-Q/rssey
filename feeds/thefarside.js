// Sample RSS feed of The Far Side's "Daily Dose"

// Requirements: Puppeteer, Moment.js
const Puppeteer = require('puppeteer');
const Moment = require('moment');
const DATE_RFC2822 = 'ddd, DD MMM YYYY HH:mm:ss ZZ';
const TITLE = 'The Far Side | The Daily Dose';
const LIST_URL = 'https://www.thefarside.com/';
const LIMIT = 60;
const TTL = 1440; // 24 hours

const TITLE_TRIM_LENGTH = 40;

// Optional - details of the cache file to use
exports.cache = {
  filename: 'thefarside.rss.xml',    // must be unique in this installation
  lifespan: 12 * 60 * 60 * 1000      // in milliseconds, so 12 * 60 * 60 * 1000 = 12 hours
}

// Before producing output, connect to the site and fetch the data
var items = [];
exports.before = async()=>{
  const browser = await Puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto(LIST_URL);
  let date = await page.evaluate(() => {
    return document.querySelectorAll('.tfs-content h3')[0].innerText;
  });
  let pubDate = Moment.utc(date).format(DATE_RFC2822);
  items = await page.evaluate(({ pubDate, TITLE_TRIM_LENGTH }) => {
    return([...document.querySelectorAll('.js-daily-dose .tfs-comic')].map(function(a){
      const link = a.querySelectorAll('.js-clipboard')[0].dataset.clipboardText;
      const img = a.querySelectorAll('img')[0];
      const imgSrc = img.dataset.src;
      const caption = a.querySelectorAll('figcaption')[0];
      const captionText = caption ? `<p>${caption.innerText}</p>` : '';
      const content = `<img src="${imgSrc}" alt="${img.alt}" />${captionText}`;
      let title = img.alt;
      if(title.length > (TITLE_TRIM_LENGTH + 3)) title = `${title.slice(0, TITLE_TRIM_LENGTH)}...`;
      if(title.lenth == '') title = link;
      const comicBody = a.querySelectorAll('.tfs-comic__body')[0];
      return {
        title: title,
        link: link,
        guid: link,
        description: comicBody.innerText,
        pubDate: pubDate,
        content_encoded: content
      };
    }));
  }, { pubDate, TITLE_TRIM_LENGTH });
  items = items.slice(0, LIMIT);
  await browser.close();
}

// MIME type for the result
exports.contentType = ()=> "application/rss+xml";

// Template to process through
exports.template = ()=> "rss-with-content.xml";

// Content to pipe to the template
exports.content = ()=> {
  const now = Moment().utc().format(DATE_RFC2822);
  return {
    title: TITLE,
    link: LIST_URL,
    pubDate: now,
    lastBuildDate: now,
    ttl: TTL,
    items: items
  }
}
