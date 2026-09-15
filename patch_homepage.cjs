const fs = require('fs');
let content = fs.readFileSync('src/components/LevelsHomePage.tsx', 'utf8');

const designerCard = `
        {/* Designer Signature Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-right">
          <img 
            src="/formal_studio_portrait.jpg" 
            alt="مصمم المنصة بغداد الطيب" 
            className="w-16 h-16 rounded-full border-2 border-emerald-600 shadow-sm object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'; // Hide if image not found
            }}
          />
          <div>
            <div className="text-[12px] text-gray-500 font-medium">تصميم وتطوير</div>
            <div className="text-[16px] font-black text-gray-900 mt-0.5">بغداد الطيب</div>
            <div className="text-[11.5px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mt-1.5">
              مصمم المنصة
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
`;

content = content.replace('      </div>\n    </div>\n  );\n};', designerCard);

fs.writeFileSync('src/components/LevelsHomePage.tsx', content, 'utf8');
console.log('Added designer card');
