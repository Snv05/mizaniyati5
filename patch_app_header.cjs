const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `{/* Quick AI Assistant Trigger */}`;
const replacement = `{/* Designer Badge - Always Visible */}
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-sm transition-all hover:shadow-md hover:bg-emerald-100">
              <img 
                src="/formal_studio_portrait.jpg" 
                alt="مصمم المنصة بغداد الطيب" 
                className="w-6 h-6 rounded-full border border-emerald-500 object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== "https://ui-avatars.com/api/?name=بغداد+الطيب&background=047857&color=fff&size=128&bold=true") {
                    target.src = "https://ui-avatars.com/api/?name=بغداد+الطيب&background=047857&color=fff&size=128&bold=true";
                  }
                }}
              />
              <div className="flex flex-col text-right">
                <span className="text-[9px] text-emerald-600 font-bold leading-none mb-0.5">تصميم وتطوير</span>
                <span className="text-[11px] font-black text-emerald-900 leading-none">بغداد الطيب</span>
              </div>
            </div>

            {/* Quick AI Assistant Trigger */}`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Patched App.tsx');
