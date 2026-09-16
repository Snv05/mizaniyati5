const fs = require('fs');
let content = fs.readFileSync('src/components/LevelsHomePage.tsx', 'utf8');

// 1. Remove the old designer card from the bottom
const oldDesignerCardRegex = /\{\/\* Designer Signature Section \*\/\}[\s\S]*?مصمم المنصة\n            <\/div>\n          <\/div>\n        <\/div>/;
content = content.replace(oldDesignerCardRegex, '');

// 2. Insert it at the top of the return statement
const topInsert = `
        {/* Designer Signature Top Banner */}
        <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-bl-full opacity-50 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-50 rounded-tr-full opacity-60 pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10 text-right">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-emerald-500 p-0.5 shadow-sm bg-white shrink-0">
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
              <div className="text-[12px] sm:text-[13px] text-gray-500 font-bold mb-0.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> تصميم وتطوير
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">بغداد الطيب</h2>
              <div className="text-[12px] font-extrabold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mt-1.5 border border-emerald-200/50">
                <UserCog className="w-3.5 h-3.5" /> مصمم المنصة
              </div>
            </div>
          </div>
          
          <div className="hidden sm:flex relative z-10 text-left items-center">
            <div className="bg-gray-50 px-5 py-3 rounded-xl border border-gray-200 shadow-2xs">
              <div className="text-[13px] font-bold text-gray-800">المنصة البيداغوجية الوطنية</div>
              <div className="text-[11.5px] font-medium text-gray-500 mt-0.5">لأساتذة علوم الطبيعة والحياة</div>
            </div>
          </div>
        </div>
`;

// Find where to insert it: after `<div className="w-full max-w-4xl space-y-6">`
content = content.replace(
  '<div className="w-full max-w-4xl space-y-6">',
  '<div className="w-full max-w-4xl space-y-6">\n' + topInsert
);

fs.writeFileSync('src/components/LevelsHomePage.tsx', content, 'utf8');
console.log('Moved designer card to top');
