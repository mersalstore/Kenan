const { ArabicShaper } = require('arabic-persian-reshaper');
const input = 'مؤسسة كنان لأنظمة الأمن والسلامة';
const output = ArabicShaper.convertArabic(input);
console.log('Input:', input);
console.log('Shaped:', output);
console.log('Reversed:', output.split('').reverse().join(''));
