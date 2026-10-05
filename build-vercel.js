import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Unified Vercel Production Build for Wildlife Sanctuary...');

try {
  // 1. Build mobile-scanner
  console.log('\n📦 [1/3] Building Mobile Field Scanner...');
  execSync('npm run build', {
    cwd: path.join(__dirname, 'mobile-scanner'),
    stdio: 'inherit'
  });

  // 2. Build main-screen
  console.log('\n🌲 [2/3] Building 3D Sanctuary Main Screen...');
  execSync('npm run build', {
    cwd: path.join(__dirname, 'main-screen'),
    stdio: 'inherit'
  });

  // 3. Merge mobile-scanner build into main-screen/dist/scanner
  console.log('\n🔗 [3/3] Merging Mobile Scanner into main-screen/dist/scanner...');
  const mobileDist = path.join(__dirname, 'mobile-scanner', 'dist');
  const targetScannerDir = path.join(__dirname, 'main-screen', 'dist', 'scanner');

  if (fs.existsSync(mobileDist)) {
    fs.mkdirSync(targetScannerDir, { recursive: true });
    fs.cpSync(mobileDist, targetScannerDir, { recursive: true });
    console.log(`✅ Successfully copied mobile scanner bundle to: ${targetScannerDir}`);
  } else {
    throw new Error('Mobile scanner dist folder was not found!');
  }

  console.log('\n✨ Production build finished successfully! Ready for Vercel deployment.');
} catch (error) {
  console.error('\n❌ Build error:', error);
  process.exit(1);
}
