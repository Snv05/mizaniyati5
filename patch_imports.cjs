const fs = require('fs');
let code = fs.readFileSync('src/components/LogbookPages.tsx', 'utf8');

const oldImport = "import React from 'react';import { Microscope, FlaskConical, Dna, TestTubes, Leaf, Trees, User, GraduationCap, Award, Briefcase, FileText, Calendar } from 'lucide-react';import { MemoConfig } from '../types';";

const newImport = "import React, { useState, useEffect } from 'react';\nimport { Microscope, FlaskConical, Dna, TestTubes, Leaf, Trees, User, GraduationCap, Award, Briefcase, FileText, Calendar, Image as ImageIcon } from 'lucide-react';\nimport localforage from 'localforage';\nimport { MemoConfig } from '../types';\n";

if (code.includes(oldImport)) {
  code = code.replace(oldImport, newImport);
  fs.writeFileSync('src/components/LogbookPages.tsx', code);
  console.log("Imports updated successfully!");
} else {
  // Let's just prepend if we can't find the exact match, or try a softer replace
  console.log("Could not find exact import string. Let's try replacing import React");
  code = code.replace("import React from 'react';", "import React, { useState, useEffect } from 'react';");
  code = code.replace("import { Microscope", "import localforage from 'localforage';\nimport { Image as ImageIcon, Microscope");
  fs.writeFileSync('src/components/LogbookPages.tsx', code);
  console.log("Imports forcibly updated.");
}
