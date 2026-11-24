const { calculate, formatFeetInches, formatTotalInches } = require('./calc-core.js').InchCalc || global.InchCalc;
function same(actual, expected, name) { if (actual !== expected) throw new Error(`${name}: expected ${expected}, got ${actual}`); }
same(calculate(['5′ 7 1/2″','+','2′ 4″']), 1528, 'addition');
same(formatFeetInches(calculate(['5′ 7 1/2″','+','2′ 4″'])), '7′ 11 1/2″', 'feet/inches output');
same(formatFeetInches(calculate(['8′ 3/4″','−','2′ 1/2″'])), '6′ 1/4″', 'fraction subtraction');
same(formatFeetInches(calculate(['4′ 6″','+','18″'])), '6′', 'normalizes feet');
same(formatTotalInches(1528), '95 1/2 inches', 'total inches output');
console.log('All measurement tests passed.');
