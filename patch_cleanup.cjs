const fs = require('fs');

const replaceExact = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/تدرج التعلمات للتعلمات/g, 'تدرج التعلمات');
  content = content.replace(/تدرج التعلمات_السنوي/g, 'تدرج_التعلمات');
  content = content.replace(/تدرج التعلمات للمنهاج والتدرج البيداغوجي/g, 'تدرج التعلمات للمنهاج البيداغوجي');
  content = content.replace(/تدرج التعلمات السنوي/g, 'تدرج التعلمات');
  content = content.replace(/تدرج التعلمات والتدرج/g, 'تدرج التعلمات');
  content = content.replace(/مذكرات وتدرج التعلمات/g, 'مذكرات وتدرج التعلمات');
  fs.writeFileSync(file, content);
};

['src/components/AnnualDistribution.tsx', 'src/components/LevelsHomePage.tsx', 'src/App.tsx', 'src/components/PlatformNavigationDrawer.tsx', 'src/components/AccountSettings.tsx'].forEach(replaceExact);

console.log('Cleaned up names.');
