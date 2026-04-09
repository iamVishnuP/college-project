import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function examine() {
  const res = await fetch('https://www.thejusengg.com/academic/department/Computer-Science-And-Engineering');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  // Try to find elements containing the words professor, faculty, mr, ms, cse
  const textMatches = [];
  $('div, h1, h2, h3, h4, h5, p, span, h6, a, li').each((i, el) => {
      const text = $(el).text().trim();
      const lower = text.toLowerCase();
      if ((lower.includes('professor') || lower.includes('faculty') || lower.includes('ms.') || lower.includes('mr.')) && text.length < 150 && text.length > 3) {
          // get classes of parent
          textMatches.push({
             text: text.substring(0, 100),
             classes: $(el).attr('class'),
             parentClasses: $(el).parent().attr('class')
          });
      }
  });

  console.log(JSON.stringify(textMatches.slice(0, 20), null, 2));
}

examine();
