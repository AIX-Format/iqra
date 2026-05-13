// أعوذ بالله من الشيطان الرجيم
// بسم الله الرحمن الرحيم

import { QuranVerse } from './constants';

export class QuranApiClient {
  private baseVerseUrl = 'http://api.alquran.cloud/v1';
  private baseTafsirUrl = 'https://api.quran.com/api/v4';
  private cache: Map<string, any> = new Map();

  /**
   * جلب آية معينة مع الترجمة والتفسير
   */
  public async fetchVerse(surah: number, ayah: number): Promise<QuranVerse | null> {
    const key = `${surah}:${ayah}`;
    if (this.cache.has(key)) return this.cache.get(key);

    try {
      // 1. جلب نص الآية والترجمة من alquran.cloud
      const verseRes = await fetch(`${this.baseVerseUrl}/ayah/${surah}:${ayah}/editions/quran-simple,en.pickthall`);
      const verseData = await verseRes.json();

      if (verseData.code !== 200) return null;

      const arabic = verseData.data[0].text;
      const translation = verseData.data[1].text;

      // 2. جلب التفسير من quran.com (مثلاً تفسير ابن كثير id: 169)
      const tafsirRes = await fetch(`${this.baseTafsirUrl}/tafsirs/169/by_ayah/${surah}:${ayah}`);
      const tafsirData = await tafsirRes.json();
      const tafsir = tafsirData.tafsir?.text || "التفسير غير متوفر حالياً";

      const result: QuranVerse = {
        id: key,
        surah,
        ayah,
        text: arabic,
        translation,
        tafsir,
        themes: [] // سيتم استخراجه بواسطة المحلل
      };

      this.cache.set(key, result);
      return result;
    } catch (error) {
      console.error(`Error fetching verse ${key}:`, error);
      return null;
    }
  }

  /**
   * البحث عن آيات بكلمة مفتاحية
   */
  public async search(query: string): Promise<string[]> {
    try {
      const res = await fetch(`${this.baseVerseUrl}/search/${query}/all/en`);
      const data = await res.json();
      if (data.code !== 200) return [];
      return data.data.matches.map((m: any) => `${m.surah.number}:${m.numberInSurah}`);
    } catch (error) {
      console.error(`Search error:`, error);
      return [];
    }
  }
}
