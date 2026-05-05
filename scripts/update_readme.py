import sys
import re
from datetime import datetime

# Build the new "Latest Learning" block
commit_message = sys.argv[1]
commit_date = sys.argv[2]
commit_hash = sys.argv[3]

new_block = f"""<!-- IQRA-LATEST-START -->
### آخر ما تعلمت | Latest Learning

> *تحديث تلقائي مع كل خطوة في الرحلة*
> *Auto-updated with every step of the journey*

| | |
|---|---|
| 📅 **التاريخ \| Date** | `{commit_date}` |
| 💡 **آخر خطوة \| Last Step** | {commit_message} |
| 🔗 **الـ Commit** | `{commit_hash}` |

<!-- IQRA-LATEST-END -->"""

# Read README
try:
    with open('README.md', 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace the block
    pattern = r'<!-- IQRA-LATEST-START -->.*?<!-- IQRA-LATEST-END -->'
    new_content = re.sub(pattern, new_block, content, flags=re.DOTALL)

    # If block doesn't exist yet, add it after the My Stats section
    if new_content == content:
        # We look for the My Stats block ending tag
        if '### إحصائياتي | My Stats' in content:
            new_content = content.replace(
                '### إحصائياتي | My Stats',
                f'{new_block}\n\n### إحصائياتي | My Stats'
            )
        else:
            # Fallback to before The Story
            new_content = content.replace(
                '## القصة | The Story',
                f'{new_block}\n\n## القصة | The Story'
            )

    with open('README.md', 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"✅ README updated — {commit_message[:50]}")
except Exception as e:
    print(f"❌ Error updating README: {e}")
    sys.exit(1)
