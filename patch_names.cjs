const fs = require('fs');

const replaceInFile = (file, oldTexts, newText) => {
  let content = fs.readFileSync(file, 'utf8');
  oldTexts.forEach(old => {
    // Avoid replacing in data files about bees.
    if (!file.includes('official_2am')) {
        content = content.replace(new RegExp(old, 'g'), newText);
    }
  });
  fs.writeFileSync(file, content);
};

replaceInFile('src/components/LevelsHomePage.tsx', ['التوزيع السنوي', 'التوزيع'], 'تدرج التعلمات');
replaceInFile('src/components/PlatformNavigationDrawer.tsx', ['التوزيع السنوي', 'التوزيع'], 'تدرج التعلمات');
replaceInFile('src/components/AccountSettings.tsx', ['التوزيع السنوي', 'التوزيع'], 'تدرج التعلمات');
replaceInFile('src/components/AnnualDistribution.tsx', ['التوزيع السنوي', 'التوزيع'], 'تدرج التعلمات');
replaceInFile('src/App.tsx', ['التوزيع السنوي', 'التوزيع'], 'تدرج التعلمات');

console.log('Replaced names successfully.');
