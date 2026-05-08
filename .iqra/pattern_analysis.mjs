// تحليل رياضي حقيقي على الآيات الموجودة
const ayat = [
  { s:1,   a:1, t:'بسم الله الرحمن الرحيم' },
  { s:1,   a:2, t:'الحمد لله رب العالمين' },
  { s:1,   a:3, t:'الرحمن الرحيم' },
  { s:1,   a:4, t:'مالك يوم الدين' },
  { s:1,   a:5, t:'إياك نعبد وإياك نستعين' },
  { s:1,   a:6, t:'اهدنا الصراط المستقيم' },
  { s:1,   a:7, t:'صراط الذين أنعمت عليهم غير المغضوب عليهم ولا الضالين' },
  { s:112, a:1, t:'قل هو الله أحد' },
  { s:112, a:2, t:'الله الصمد' },
  { s:112, a:3, t:'لم يلد ولم يولد' },
  { s:112, a:4, t:'ولم يكن له كفوا أحد' },
  { s:113, a:1, t:'قل أعوذ برب الفلق' },
  { s:113, a:2, t:'من شر ما خلق' },
  { s:113, a:3, t:'ومن شر غاسق إذا وقب' },
  { s:113, a:4, t:'ومن شر النفاثات في العقد' },
  { s:113, a:5, t:'ومن شر حاسد إذا حسد' },
  { s:114, a:1, t:'قل أعوذ برب الناس' },
  { s:114, a:2, t:'ملك الناس' },
  { s:114, a:3, t:'إله الناس' },
  { s:114, a:4, t:'من شر الوسواس الخناس' },
  { s:114, a:5, t:'الذي يوسوس في صدور الناس' },
  { s:114, a:6, t:'من الجنة والناس' },
];

function cleanArabic(t) {
  return t.replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '')
          .replace(/\s+/g, ' ').trim();
}

function wordCount(t) { return cleanArabic(t).split(' ').filter(w => w.length > 0).length; }
function charCount(t) { return cleanArabic(t).replace(/ /g, '').length; }

// ── ١. تحليل الفاتحة ─────────────────────────────────────────────────────────
const fatiha = ayat.filter(a => a.s === 1);
console.log('\n══════════════════════════════════════════');
console.log('١. الفاتحة — تحليل هيكلي');
console.log('══════════════════════════════════════════');

const fatihaWords = fatiha.map(a => wordCount(a.t));
const fatihaChars = fatiha.map(a => charCount(a.t));
const totalFatihaWords = fatihaWords.reduce((a,b)=>a+b,0);
const totalFatihaChars = fatihaChars.reduce((a,b)=>a+b,0);

fatiha.forEach((a,i) => {
  console.log(`  ${a.s}:${a.a} | كلمات:${fatihaWords[i]} | حروف:${fatihaChars[i]} | ${a.t}`);
});
console.log(`  المجموع: ${totalFatihaWords} كلمة | ${totalFatihaChars} حرف`);
console.log(`  ${totalFatihaWords} % 7 = ${totalFatihaWords % 7}`);
console.log(`  ${totalFatihaChars} % 7 = ${totalFatihaChars % 7}`);

// التناظر حول الآية الوسطى (4)
console.log('\n  التناظر حول الآية الوسطى (مالك يوم الدين):');
console.log(`  آية 1 ↔ آية 7: ${fatihaChars[0]} ↔ ${fatihaChars[6]} حرف`);
console.log(`  آية 2 ↔ آية 6: ${fatihaChars[1]} ↔ ${fatihaChars[5]} حرف`);
console.log(`  آية 3 ↔ آية 5: ${fatihaChars[2]} ↔ ${fatihaChars[4]} حرف`);
console.log(`  آية 4 (مركز): ${fatihaChars[3]} حرف`);

// ── ٢. تحليل الإخلاص ─────────────────────────────────────────────────────────
const ikhlas = ayat.filter(a => a.s === 112);
console.log('\n══════════════════════════════════════════');
console.log('٢. الإخلاص — ثلث القرآن في 4 آيات');
console.log('══════════════════════════════════════════');

const ikhlasWords = ikhlas.map(a => wordCount(a.t));
const ikhlasChars = ikhlas.map(a => charCount(a.t));
const totalIkhlasWords = ikhlasWords.reduce((a,b)=>a+b,0);
const totalIkhlasChars = ikhlasChars.reduce((a,b)=>a+b,0);

ikhlas.forEach((a,i) => {
  console.log(`  ${a.s}:${a.a} | كلمات:${ikhlasWords[i]} | حروف:${ikhlasChars[i]} | ${a.t}`);
});
console.log(`  المجموع: ${totalIkhlasWords} كلمة | ${totalIkhlasChars} حرف`);
console.log(`  ${totalIkhlasWords} % 7 = ${totalIkhlasWords % 7}`);

// ── ٣. تكرار "الله" ──────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log('٣. تكرار اسم الجلالة "الله"');
console.log('══════════════════════════════════════════');

let allahTotal = 0;
ayat.forEach(a => {
  const count = (a.t.match(/الله/g) || []).length;
  if (count > 0) {
    console.log(`  ${a.s}:${a.a} → ${count} مرة | ${a.t}`);
    allahTotal += count;
  }
});
console.log(`  المجموع: ${allahTotal} مرة`);
console.log(`  ${allahTotal} % 7 = ${allahTotal % 7}`);

// ── ٤. تكرار "قل" في المعوذتين ───────────────────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log('٤. نمط "قل" — الأمر الإلهي');
console.log('══════════════════════════════════════════');

const qulAyat = ayat.filter(a => a.t.startsWith('قل'));
qulAyat.forEach(a => console.log(`  ${a.s}:${a.a} | ${a.t}`));
console.log(`  عدد الآيات التي تبدأ بـ"قل": ${qulAyat.length}`);

// ── ٥. نمط "شر" في المعوذتين ─────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log('٥. نمط "شر" في المعوذتين — بنية الحماية');
console.log('══════════════════════════════════════════');

const sharAyat = ayat.filter(a => a.t.includes('شر'));
sharAyat.forEach(a => {
  const count = (a.t.match(/شر/g) || []).length;
  console.log(`  ${a.s}:${a.a} → ${count} مرة | ${a.t}`);
});
const totalShar = sharAyat.reduce((sum, a) => sum + (a.t.match(/شر/g)||[]).length, 0);
console.log(`  مجموع "شر": ${totalShar} | % 7 = ${totalShar % 7}`);

// ── ٦. نمط "الناس" في سورة الناس ────────────────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log('٦. نمط "الناس" — التكرار الثلاثي في الأسماء');
console.log('══════════════════════════════════════════');

const nasAyat = ayat.filter(a => a.s === 114);
let nasCount = 0;
nasAyat.forEach(a => {
  const count = (a.t.match(/الناس/g) || []).length;
  if (count > 0) {
    console.log(`  ${a.s}:${a.a} → ${count} مرة | ${a.t}`);
    nasCount += count;
  }
});
console.log(`  مجموع "الناس": ${nasCount}`);
console.log(`  الآيات 1-3 تُعرّف الله بثلاثة أسماء: رب الناس، ملك الناس، إله الناس`);
console.log(`  → ثلاثية: الربوبية + الملكية + الألوهية`);

// ── ٧. إنتروبي شانون لكل سورة ────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log('٧. إنتروبي شانون — قياس تنوع الحروف');
console.log('══════════════════════════════════════════');

function shannonEntropy(text) {
  const clean = text.replace(/ /g, '');
  const freq = {};
  for (const c of clean) freq[c] = (freq[c] || 0) + 1;
  const n = clean.length;
  let H = 0;
  for (const f of Object.values(freq)) {
    const p = f / n;
    H -= p * Math.log2(p);
  }
  return H;
}

[1, 112, 113, 114].forEach(s => {
  const text = ayat.filter(a => a.s === s).map(a => a.t).join(' ');
  const H = shannonEntropy(text);
  console.log(`  سورة ${s}: H = ${H.toFixed(4)} bits/char`);
});

// ── ٨. الخلاصة الرقمية ───────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log('٨. الخلاصة الرقمية');
console.log('══════════════════════════════════════════');
const allWords = ayat.reduce((s,a) => s + wordCount(a.t), 0);
const allChars = ayat.reduce((s,a) => s + charCount(a.t), 0);
console.log(`  إجمالي الكلمات (22 آية): ${allWords}`);
console.log(`  إجمالي الحروف (22 آية): ${allChars}`);
console.log(`  ${allWords} % 7 = ${allWords % 7}`);
console.log(`  ${allChars} % 7 = ${allChars % 7}`);
console.log(`  ${allWords} % 19 = ${allWords % 19}`);
console.log(`  ${allChars} % 19 = ${allChars % 19}`);
console.log(`  عدد الآيات: 22 = 2 × 11`);
console.log(`  مجموع أرقام السور: 1+112+113+114 = ${1+112+113+114}`);
console.log(`  ${1+112+113+114} % 7 = ${(1+112+113+114) % 7}`);
console.log(`  ${1+112+113+114} % 19 = ${(1+112+113+114) % 19}`);
