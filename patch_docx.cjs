const fs = require('fs');

let fileContent = fs.readFileSync('src/utils/docxExportLogbook.ts', 'utf8');

const replacement = `const createParagraph = (text: string, bold = false, color = "000000", size = 20, alignment: any = AlignmentType.CENTER) => {
  return new Paragraph({
    alignment: alignment,
    children: (text || "").split('\\n').map((line, i, arr) => {
      const parts = line.split(/(<u>.*?<\\/u>)/g);
      const runs = parts.map(part => {
        if (part.startsWith('<u>') && part.endsWith('</u>')) {
          return new TextRun({
            text: part.slice(3, -4),
            bold: bold,
            underline: { type: "single", color: color },
            color: color,
            rightToLeft: true,
            size: size,
            font: "Arial"
          });
        }
        return new TextRun({
          text: part,
          bold: bold,
          color: color,
          rightToLeft: true,
          size: size,
          font: "Arial"
        });
      });
      return [ ...runs, ...(i < arr.length - 1 ? [new TextRun({ break: 1 })] : []) ];
    }).flat()
  });
};`;

fileContent = fileContent.replace(
  /const createParagraph = \(text: string.*?\}\);\n\};/s,
  replacement
);

fs.writeFileSync('src/utils/docxExportLogbook.ts', fileContent);
console.log('Patched docxExportLogbook.ts');
