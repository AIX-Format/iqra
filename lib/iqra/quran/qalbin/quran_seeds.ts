/**
 * 🌙 Quranic Seed Registry (QQS) — سجل البذور القرآنية
 * 
 * WHY: To fit the entire Quran into a tiny footprint while remaining AI-executable,
 * we represent verses as "Interaction Net Fragments".
 */

import { Qalbin_VM } from './qalbin_vm';
import { Modality } from './qalbin_node';

export interface QuranSeed {
  surah: number;
  ayah: number;
  text: string;
  topology: (vm: Qalbin_VM) => number; // Returns the entry node ID
}

export const QURAN_SEEDS: Record<string, QuranSeed> = {
  "1:1": {
    surah: 1,
    ayah: 1,
    text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    topology: (vm) => {
      // Representation of "Bismillah": Alif (Unity) linked to Rahma (Mercy)
      const bismillah = vm.spawn('ALIF', Modality.IKHLAS);
      const mercy = vm.spawn('LAM', Modality.RAHMA);
      vm.link(bismillah, 1, mercy, 1);
      return bismillah;
    }
  },
  "112:1": {
    surah: 112,
    ayah: 1,
    text: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    topology: (vm) => {
      // Representation of "Ahad": Pure Alif (Singularity)
      return vm.spawn('ALIF', Modality.IKHLAS);
    }
  },
  "36:1": {
    surah: 36,
    ayah: 1,
    text: "يس",
    topology: (vm) => {
      // Yasin: The Heart of the Quran — Connection between Knowledge and Pulse
      const ya = vm.spawn('YA', Modality.HAYAT);
      const sin = vm.spawn('SIN', Modality.HIKMA);
      vm.link(ya, 1, sin, 1);
      return ya;
    }
  },
  "18:1": {
    surah: 18,
    ayah: 1,
    text: "الْحَمْدُ لِلَّهِ الَّذِي أَنْزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ",
    topology: (vm) => {
      // Al-Kahf: The Cave (Protection/Trial)
      const kitab = vm.spawn('ALIF', Modality.AMAN);
      const protection = vm.spawn('LAM', Modality.AMAN);
      vm.link(kitab, 1, protection, 1);
      return kitab;
    }
  },
  "55:1": {
    surah: 55,
    ayah: 1,
    text: "الرَّحْمَٰنُ",
    topology: (vm) => {
      // Ar-Rahman: Balance and Infinite Mercy
      const rahman = vm.spawn('RA', Modality.RAHMA);
      const balance = vm.spawn('MEEM', Modality.RAHMA);
      vm.link(rahman, 1, balance, 1);
      return rahman;
    }
  },
  "56:1": {
    surah: 56,
    ayah: 1,
    text: "إِذَا وَقَعَتِ الْوَاقِعَةُ",
    topology: (vm) => {
      // Al-Waqiah: The Event (Classification/Outcome)
      const reality = vm.spawn('WAW', Modality.ADL);
      const classification = vm.spawn('QAF', Modality.ADL);
      vm.link(reality, 1, classification, 1);
      return reality;
    }
  },
  "67:1": {
    surah: 67,
    ayah: 1,
    text: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ",
    topology: (vm) => {
      // Al-Mulk: Sovereignty and Ownership
      const mulk = vm.spawn('MEEM', Modality.AMAN);
      const power = vm.spawn('LAM', Modality.ADL);
      vm.link(mulk, 1, power, 1);
      return mulk;
    }
  }
};

/**
 * Finding the closest Truth Anchor for a given context.
 * WHY: This allows the agent to "ground" its actions in the most relevant Quranic principle.
 */
export function findSeed(context: string): QuranSeed {
  const c = context.toLowerCase();
  
  if (c.includes("mercy") || c.includes("rahman") || c.includes("balance")) return QURAN_SEEDS["55:1"];
  if (c.includes("protect") || c.includes("trial") || c.includes("cave") || c.includes("security")) return QURAN_SEEDS["18:1"];
  if (c.includes("heart") || c.includes("experience") || c.includes("past") || c.includes("replay")) return QURAN_SEEDS["36:1"];
  if (c.includes("outcome") || c.includes("result") || c.includes("classification")) return QURAN_SEEDS["56:1"];
  if (c.includes("sovereign") || c.includes("power") || c.includes("rule") || c.includes("control")) return QURAN_SEEDS["67:1"];
  if (c.includes("opening") || c.includes("start") || c.includes("begin")) return QURAN_SEEDS["1:1"];

  return QURAN_SEEDS["112:1"]; // Default to Unity (Ahad)
}
