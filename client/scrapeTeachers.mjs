import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';

const depts = [
  'civil-engineering',
  'Computer-Science-And-Engineering',
  'Electrical-Electronics-Engineering',
  'Mechanical-Engineering',
  'Electronics-Computer-Engineering',
  'ELECTRONICS-COMMUNICATION-ENGINEERING',
  'physical-education',
  'APPLIED-SCIENCE-AND-HUMANITIES'
];

async function scrape() {
  const teachers = [];
  let idCounter = 1;

  for (const dept of depts) {
    const url = `https://www.thejusengg.com/academic/department/${dept}`;
    try {
      const res = await fetch(url);
      const html = await res.text();
      const $ = cheerio.load(html);
      
      $('.team_box').each((i, el) => {
         const nameText = $(el).find('.team_title h5, .team_title h4, .team_title h6, .team_title a').first().text().trim() || $(el).find('.team_title').text().trim().split('\n')[0].trim();
         // If we don't grab it via heading tag, let's just parse the first line of text
         const fullText = $(el).find('.team_title').text().trim();
         
         const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
         const rawName = lines[0] || 'Unknown';
         const designation = lines.length > 1 ? lines[1] : 'Professor';
         const img = $(el).find('img').attr('src');
         
         // Only add if it looks like a person
         if (rawName.toLowerCase().includes('mr.') || rawName.toLowerCase().includes('ms') || rawName.toLowerCase().includes('dr.') || rawName.toLowerCase().includes('prof')) {
            
            let gender = 'Unknown';
            if (rawName.toLowerCase().includes('ms') || rawName.toLowerCase().includes('mrs')) gender = 'Female';
            if (rawName.toLowerCase().includes('mr.')) gender = 'Male';
            
            // Try to assign a generic avatar if no image or relative image
            let finalImg = img;
            if (!finalImg || !finalImg.startsWith('http')) {
               finalImg = gender === 'Female' ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(rawName) + '&hair=long12' : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(rawName) + '&facialHair=beardLight';
            }
            
            teachers.push({
               id: idCounter++,
               name: rawName,
               subject: dept.toUpperCase().replace(/-/g, ' '),
               designation: designation,
               gender: gender,
               imgUrl: finalImg,
            });
         }
      });
    } catch (e) {
      console.log('Error fetching ' + url);
    }
  }

  // Write to src/data/teachers.json
  if (!fs.existsSync('./src/data')) {
      fs.mkdirSync('./src/data');
  }
  fs.writeFileSync('./src/data/teachers.json', JSON.stringify(teachers, null, 2));
  console.log(`Scraped ${teachers.length} teachers!`);
}

scrape();
