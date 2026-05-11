
import { SkillBank } from '../s#skills/skill_bank';
import { IQRALogger } from '../s#infra/logger';

async function testSkills() {
  console.log('🧪 Starting SkillBank Integrity Test...');
  
  const skills = SkillBank.listSkills();
  console.log(`📚 Found ${skills.length} skills:`, skills);

  if (skills.length === 0) {
    console.error('❌ No skills found in iqra-core/skills');
    process.exit(1);
  }

  const targetSkill = 'quran_deep_analysis';
  const content = SkillBank.getSkillContent(targetSkill);

  if (content && content.includes('author: "Sovereign Architect"')) {
    console.log(`✅ Successfully loaded "${targetSkill}" with correct metadata.`);
  } else {
    console.error(`❌ Failed to verify content for "${targetSkill}".`);
    process.exit(1);
  }

  console.log('✨ SkillBank Integrity Test PASSED.');
}

testSkills().catch(err => {
  console.error('💥 Test crashed:', err);
  process.exit(1);
});
