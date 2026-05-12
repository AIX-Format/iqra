// أعوذ بالله من الشيطان الرجيم
// بسم الله الرحمن الرحيم

/**
 * AIX Cognitive Quran Tafsir Engine v1.5 - Constants
 */

export interface QuranVerse {
  id?: string;
  surah: number;
  ayah: number;
  text: string;
  surah_name?: string;
  translation?: string;
  tafsir?: string;
  themes: string[];
}

export const QURAN_VERSES: Record<string, QuranVerse> = {
  "1:1": {
    surah: 1,
    ayah: 1,
    text: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
    surah_name: "الفاتحة",
    themes: ["توحيد", "رحمة"]
  },
  "2:255": {
    surah: 2,
    ayah: 255,
    text: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...",
    surah_name: "البقرة",
    themes: ["توحيد", "عظمة", "حفظ"]
  },
  "112:1": {
    surah: 112,
    ayah: 1,
    text: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    surah_name: "الإخلاص",
    themes: ["توحيد", "صفات"]
  }
  // يمكن التوسع هنا أو التحميل من ملف JSON خارجي
};

export const TAFSIR_DATA: Record<string, Record<string, string>> = {
  "2:255": {
    "ابن كثير": "هذه آية الكرسي ولها شأن عظيم...",
    "الطبري": "القول في تأويل قوله تعالى: الله لا إله إلا هو..."
  }
};

export const ARABIC_ROOTS: Record<string, string> = {
  'كتب': 'k-t-b',
  'قرأ': 'q-r-a',
  'علم': 'a-l-m',
  'حكم': 'h-k-m',
  'نور': 'n-u-r'
};

export const ARABIC_PREFIXES = ["ال", "و", "ف", "ب", "ل", "ك"];
export const ARABIC_SUFFIXES = ["ون", "ين", "ات", "كم", "هم", "نا"];
