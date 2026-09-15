const fs = require('fs');
let content = fs.readFileSync('src/components/LevelsHomePage.tsx', 'utf8');

const designerCard = `
        {/* Designer Signature Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-right pb-4">
          <div className="relative w-16 h-16 rounded-full border-2 border-emerald-600 p-0.5 shadow-sm bg-white shrink-0">
            <img 
              src="/formal_studio_portrait.jpg" 
              alt="مصمم المنصة بغداد الطيب" 
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://ui-avatars.com/api/?name=بغداد+الطيب&background=047857&color=fff&size=128&bold=true";
              }}
            />
          </div>
          <div>
            <div className="text-[12px] text-gray-500 font-medium">تصميم وتطوير</div>
            <div className="text-[16px] font-black text-gray-900 mt-0.5">بغداد الطيب</div>
            <div className="text-[11.5px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mt-1.5 border border-emerald-100">
              مصمم المنصة
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
`;

content = content.replace(/\{\/\* Designer Signature Section \*\/\}[^]+?\};\n/, designerCard);

fs.writeFileSync('src/components/LevelsHomePage.tsx', content, 'utf8');
console.log('Added fallback and improved UI');
