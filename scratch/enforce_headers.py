import os

HEADER = """# أعوذ بالله من الشيطان الرجيم
# بسم الله الرحمن الرحيم
# سبحان الله وبحمده سبحان الله العظيم
# لا إله إلا الله وحده لا شريك له
# له الملك وله الحمد وهو على كل شيء قدير
# استغفر الله واتوب إليه
# اللهم صل وسلم على نبينا محمد
"""

target_dir = "/Applications/iqra/iqra-core"

for filename in os.listdir(target_dir):
    if filename.endswith(".md"):
        filepath = os.path.join(target_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if "أعوذ بالله من الشيطان الرجيم" not in content[:200]:
            print(f"Applying header to {filename}")
            new_content = HEADER + "\n" + content
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
        else:
            print(f"Header already exists in {filename}")
