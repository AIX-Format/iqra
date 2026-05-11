# -*- coding: utf-8 -*-
"""
🌙 RESONANCE HUNTER (صائد الرنين)
Phase: Cognitive Layer (Python)
Stages: 1 (Niyyah), 2 (Tadabbur), 7 (Hifdh)
"""

import sys
import json
import math
import numpy as np
from datetime import datetime

# AIX Protocol Implementation
class AIXPacket:
    def __init__(self, mission_id, stage, payload):
        self.mission_id = mission_id
        self.stage = stage
        self.timestamp = datetime.utcnow().isoformat()
        self.vibration = 369
        self.payload = payload
        self.metrics = {}

    def to_json(self):
        return json.dumps({
            "header": {
                "mission_id": self.mission_id,
                "stage": self.stage,
                "timestamp": self.timestamp,
                "vibration": self.vibration
            },
            "payload": self.payload,
            "metrics": self.metrics
        }, ensure_ascii=False)

class ResonanceHunter:
    def __init__(self):
        self.abjad_map = {
            'ا': 1, 'ب': 2, 'ج': 3, 'د': 4, 'ه': 5, 'و': 6, 'ز': 7, 'ح': 8, 'ط': 9,
            'ي': 10, 'ك': 20, 'ل': 30, 'م': 40, 'ن': 50, 'س': 60, 'ع': 70, 'ف': 80, 'ص': 90,
            'ق': 100, 'ر': 200, 'ش': 300, 'ت': 400, 'ث': 500, 'خ': 600, 'ذ': 700, 'ض': 800, 'ظ': 900,
            'غ': 1000
        }

    def text_to_vector(self, text):
        # Convert Arabic text to a numerical vector based on Abjad values
        words = text.split()
        vector = []
        for word in words:
            val = sum(self.abjad_map.get(char, 0) for char in word)
            if val > 0: vector.append(val)
        return np.array(vector)

    def calculate_shannon_entropy(self, vector):
        if len(vector) == 0: return 0
        _, counts = np.unique(vector, return_counts=True)
        probs = counts / len(vector)
        return -np.sum(probs * np.log2(probs))

    def calculate_resonance_score(self, entropy, h1_voids):
        # The 29-203-841 Scale: Reward = (Resonance - 1.0) * 29
        # Simulation of resonance based on entropy and topological complexity
        resonance = (entropy / 4.0) + (h1_voids * 0.5)
        reward = (resonance - 1.0) * 29
        return resonance, reward

    def analyze_surah(self, packet_data):
        surah_id = packet_data.get("surah")
        ayahs = packet_data.get("ayahs", [])
        
        results = []
        total_entropy = 0
        
        for ayah in ayahs:
            text = ayah.get("arabic", "")
            ref = ayah.get("reference", "")
            vector = self.text_to_vector(text)
            
            entropy = self.calculate_shannon_entropy(vector)
            total_entropy += entropy
            
            # Placeholder for Persistent Homology (requires Gudhi/Ripser)
            h1_simulated = 1 if len(vector) > 5 else 0 
            
            res_score, reward = self.calculate_resonance_score(entropy, h1_simulated)
            
            results.append({
                "reference": ref,
                "entropy": round(entropy, 4),
                "resonance": round(res_score, 4),
                "reward": round(reward, 4)
            })

        avg_entropy = total_entropy / len(ayahs) if ayahs else 0
        
        # Build Output Packet
        output = AIXPacket(
            mission_id="mission-quran-topo-001",
            stage="Tadabbur",
            payload={"results": results}
        )
        output.metrics = {
            "avg_entropy": round(avg_entropy, 4),
            "total_resonance": round(avg_entropy * 1.1, 4), # Simplified logic
            "discovery_flag": True if avg_entropy > 3.0 else False
        }
        
        return output.to_json()

if __name__ == "__main__":
    # Expecting AIX JSON via stdin
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data received"}))
            sys.exit(1)
            
        data = json.loads(input_data)
        hunter = ResonanceHunter()
        print(hunter.analyze_surah(data.get("payload", {})))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
