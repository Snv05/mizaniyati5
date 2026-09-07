const fs = require('fs');

let fileContent = fs.readFileSync('src/components/AnnualDistribution.tsx', 'utf8');

// Replace localStorage initialization
fileContent = fileContent.replace(
  "const saved = localStorage.getItem('algeria_sciences_annual_dist');\n      if (saved) return JSON.parse(saved);",
  `const saved = localStorage.getItem('algeria_sciences_annual_dist_v2');
      if (saved) {
        // We always want to merge the latest ANNUAL_DISTRIBUTIONS with any custom items saved by the user
        // This ensures updates to the source code apply to existing users.
        const parsed = JSON.parse(saved);
        const customItems = parsed.filter((it: any) => it.id.startsWith('custom-'));
        const defaultItems = ANNUAL_DISTRIBUTIONS.map(defaultItem => {
          const savedItem = parsed.find((it: any) => it.id === defaultItem.id);
          // Keep status from saved, but content from code
          return savedItem ? { ...defaultItem, status: savedItem.status } : defaultItem;
        });
        return [...defaultItems, ...customItems];
      }
      
      // Migration from v1
      const oldSaved = localStorage.getItem('algeria_sciences_annual_dist');
      if (oldSaved) {
         const oldItems = JSON.parse(oldSaved);
         const customItems = oldItems.filter((it: any) => it.id.startsWith('custom-'));
         return [...ANNUAL_DISTRIBUTIONS, ...customItems];
      }`
);

// Replace setters
fileContent = fileContent.replace(/localStorage\.setItem\('algeria_sciences_annual_dist'/g, "localStorage.setItem('algeria_sciences_annual_dist_v2'");

fs.writeFileSync('src/components/AnnualDistribution.tsx', fileContent);
console.log('Successfully updated localStorage key and merge logic in AnnualDistribution.tsx');
