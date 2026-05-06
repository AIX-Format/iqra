import fs from 'fs';
import path from 'path';

export class IQRAStoryteller {
  private static THEMES = [
    { title: "Ikhlas (Sincerity)", description: "Purifying the code from technical debt and vanity." },
    { title: "Itqan (Excellence)", description: "Refining the implementation to its most perfect form." },
    { title: "Sabr (Patience)", description: "Debugging through complex state manifolds without haste." },
    { title: "Hikmah (Wisdom)", description: "Implementing patterns that serve long-term stability." },
    { title: "Adl (Justice)", description: "Balancing resource consumption and performance." },
    { title: "Tawakkul (Reliance)", description: "Trusting the topological reset to clear failures." }
  ];

  static generateCommitMessage(action: string, result: string): string {
    const theme = this.THEMES[Math.floor(Math.random() * this.THEMES.length)];
    const message = `🌙 [${theme.title}] ${action}\n\n${theme.description}\nResult: ${result}\n\nالحمد لله على تمام العمل.`;
    return message;
  }

  static logToHadith(commitHash: string, lesson: string) {
    const filePath = path.join(process.cwd(), 'HADITH_COMMITS.md');
    const entry = `| \`${commitHash}\` | **${lesson}** |\n`;
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '# 📖 HADITH_COMMITS.md\n## سجل الدروس من الـ Commits\n\n| الـ Commit | الدرس المستفاد |\n|------------|----------------|\n');
    }
    fs.appendFileSync(filePath, entry);
  }
}
