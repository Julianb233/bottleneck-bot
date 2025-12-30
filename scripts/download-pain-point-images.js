import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, '../client/public/images/pain-points');

// Ensure directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Unsplash Source API - Free high-quality images
// Format: https://source.unsplash.com/1200x800/?keyword
const imageConfigs = [
  {
    filename: 'ghl-chaos.jpg',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=800&fit=crop&q=80', // Stressed person with multiple screens
    description: 'GHL Sub-Account Chaos - Overwhelmed person with multiple computer screens'
  },
  {
    filename: 'meta-ads-fire.jpg',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&q=80', // Person checking phone at night
    description: 'Meta Ads on Fire - Person waking up stressed checking phone'
  },
  {
    filename: 'leads-bump.jpg',
    url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=800&fit=crop&q=80', // Missed opportunities, frustrated
    description: 'Lead Follow-Up Falls Through - Frustrated person with missed opportunities'
  },
  {
    filename: 'missed-calls.jpg',
    url: 'https://images.unsplash.com/photo-1556761175-b3233a4e0b2f?w=1200&h=800&fit=crop&q=80', // Phone with missed calls
    description: 'Missed Calls = Lost Revenue - Phone with missed calls, lost deals'
  },
  {
    filename: 'reporting-nightmare.jpg',
    url: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&h=800&fit=crop&q=80', // Person working late at night
    description: 'Client Reporting Nightmare - Exhausted person working late at night'
  },
  {
    filename: 'zapier-breaks.jpg',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80', // Broken system, technology failure
    description: 'Zapier Breaks at 2AM - System failure, broken automation'
  }
];

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        return downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function downloadAllImages() {
  console.log('Downloading pain point images from Unsplash...\n');
  
  for (const config of imageConfigs) {
    const filepath = path.join(imagesDir, config.filename);
    
    try {
      console.log(`Downloading: ${config.filename}...`);
      console.log(`  Description: ${config.description}`);
      await downloadImage(config.url, filepath);
      console.log(`  ✓ Saved to: ${filepath}\n`);
    } catch (error) {
      console.error(`  ✗ Error downloading ${config.filename}:`, error.message);
      console.log(`  Trying alternative source...\n`);
      
      // Try alternative Unsplash image
      const altUrl = `https://source.unsplash.com/1200x800/?${encodeURIComponent(config.description.split(' - ')[1])}`;
      try {
        await downloadImage(altUrl, filepath);
        console.log(`  ✓ Saved using alternative source\n`);
      } catch (altError) {
        console.error(`  ✗ Failed to download ${config.filename}\n`);
      }
    }
  }
  
  console.log('Download complete!');
}

downloadAllImages().catch(console.error);

