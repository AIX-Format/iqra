import os
import sys

AL_FATIHAH = """<!--
بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ الرَّحْمَنِ الرَّحِيمِ مَالِكِ يَوْمِ الدِّينِ
إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ
صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ
آمِينَ
-->

"""

def enforce_header(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ" not in content:
        print(f"Applying header to {file_path}")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(AL_FATIHAH + content)
    else:
        print(f"Header already exists in {file_path}")

def scan_and_apply(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.md') or file.endswith('.ts'):
                enforce_header(os.path.join(root, file))

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    if os.path.isfile(target):
        enforce_header(target)
    else:
        scan_and_apply(target)
