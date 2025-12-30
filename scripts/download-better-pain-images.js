import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, '../client/public/images/pain-points');

// More emotionally impactful images - using Pexels and Unsplash
const betterImages = [
  {
    filename: 'ghl-chaos.jpg',
    urls: [
      'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop', // Stressed person with multiple screens
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=800&fit=crop&q=80',
      'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'
    ],
    description: 'Overwhelmed person with multiple computer screens, chaos, stress'
  },
  {
    filename: 'meta-ads-fire.jpg',
    urls: [
      'https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop', // Person checking phone at night worried
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&q=80',
      'https://images.pexels.com/photos/3807278/pexels-photo-3807278.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'
    ],
    description: 'Person waking up stressed checking phone, money loss, 3am worry'
  },
  {
    filename: 'leads-bump.jpg',
    urls: [
      'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop', // Frustrated business person
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=800&fit=crop&q=80',
      'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'
    ],
    description: 'Frustrated person, missed opportunities, lost leads'
  },
  {
    filename: 'missed-calls.jpg',
    urls: [
      'https://images.pexels.com/photos/3807279/pexels-photo-3807279.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop', // Phone with missed calls
      'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&h=800&fit=crop&q=80',
      'https://images.pexels.com/photos/3807276/pexels-photo-3807276.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'
    ],
    description: 'Phone with missed calls, lost revenue, frustrated business owner'
  },
  {
    filename: 'reporting-nightmare.jpg',
    urls: [
      'https://images.pexels.com/photos/1181391/pexels-photo-1181391.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop', // Person working late exhausted
      'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&h=800&fit=crop&q=80',
      'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'
    ],
    description: 'Exhausted person working late at night, reports, midnight work'
  },
  {
    filename: 'zapier-breaks.jpg',
    urls: [
      'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop', // Broken technology, system failure
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
      'https://images.pexels.com/photos/1181247/pexels-photo-1181247.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'
    ],
    description: 'System failure, broken automation, technology panic'
  }
];

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    const request = https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });
    
    request.on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function downloadWithFallback(config) {
  const filepath = path.join(imagesDir, config.filename);
  let lastError = null;
  
  for (const url of config.urls) {
    try {
      console.log(`  Trying: ${url.substring(0, 60)}...`);
      await downloadImage(url, filepath);
      console.log(`  ✓ Success!\n`);
      return true;
    } catch (error) {
      lastError = error;
      console.log(`  ✗ Failed: ${error.message}`);
      continue;
    }
  }
  
  console.log(`  ✗ All sources failed for ${config.filename}\n`);
  return false;
}

async function main() {
  console.log('Downloading emotionally impactful pain point images...\n');
  
  for (const config of betterImages) {
    console.log(`Downloading: ${config.filename}`);
    console.log(`  Description: ${config.description}`);
    await downloadWithFallback(config);
  }
  
  console.log('Download complete!');
  console.log('\nAll images saved to:', imagesDir);
}

main().catch(console.error);

