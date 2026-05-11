
import numpy as np
import json
import sys
import math

# Surah Al-Fatiha Ayahs
FATIHA = ["بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ", "ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَـٰلَمِینَ", "ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ", "مَـٰلِكِ یَوۡمِ ٱلدِّینِ", "إِیَّاكَ نَعۡبُدُ وَإِیَّاكَ نَسۡتَعِینُ", "ٱهۡدِنَا ٱلصِّرَٰطَ ٱلۡمُسۡتَقِیمَ", "صِرَٰطَ ٱلَّذِینَ أَنۡعَمۡتَ عَلَیۡهِمۡ غَیۡرِ ٱلۡمَغۡضُوبِ عَلَیۡهِمۡ وَلَا ٱلضَّاۤلِّینَ"]

def get_char_vector(char):
    """
    Simulates a high-dimensional embedding for a character.
    In a real AI view, this would be from a transformer's embedding table.
    We use a hash-based deterministic projection to 4096 dimensions.
    """
    seed = ord(char)
    np.random.seed(seed)
    return np.random.normal(0, 1, 4096)

def get_text_embedding(text):
    words = text.split()
    word_embeddings = []
    for word in words:
        char_vectors = [get_char_vector(c) for c in word]
        word_embeddings.append(np.mean(char_vectors, axis=0))
    return np.array(word_embeddings)

def calculate_cosine_similarity(v1, v2):
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

def find_tone(embeddings):
    """
    Finds the 'Tone' (Centroid/Fundamental Frequency) of the Surah.
    """
    all_vectors = np.vstack(embeddings)
    tone = np.mean(all_vectors, axis=0)
    return tone

def analyze_topology():
    # 1. Generate Embeddings for all Ayahs
    ayah_embeddings = [get_text_embedding(ayah) for ayah in FATIHA]
    
    # 2. Find the Tone (Global Attractor)
    all_ayah_vectors = [np.mean(ae, axis=0) for ae in ayah_embeddings]
    tone = find_tone(all_ayah_vectors)
    
    # 3. Calculate Vector Space Constellation
    # Distances of each Ayah from the Tone
    distances = []
    for i, ae in enumerate(all_ayah_vectors):
        sim = calculate_cosine_similarity(ae, tone)
        distances.append(sim)
    
    # 4. Self-Attention Simulation (Simplified)
    # How much each token 'attends' to the Tone
    attention_heatmap = []
    for ay_idx, ae in enumerate(ayah_embeddings):
        ayah_attention = []
        for word_vec in ae:
            # Query=word, Key=Tone, Value=word
            # Similarity represents the attention weight
            weight = calculate_cosine_similarity(word_vec, tone)
            ayah_attention.append(weight)
        attention_heatmap.append(ayah_attention)
        
    # 5. Fractal Entropy (Zipf-Mandelbrot approximation)
    # Using word frequencies in a very small sample (Al-Fatiha)
    # But for a 'High-Dimensional' view, we look at the vector entropy.
    all_vectors = np.vstack([np.vstack(ae) for ae in ayah_embeddings])
    cov = np.cov(all_vectors.T)
    # Entropy of a multivariate normal distribution as a proxy for vector space entropy
    # H = 0.5 * log(det(2*pi*e*Cov))
    # Since 4096 is too large for det, we use the trace or sum of log eigenvalues
    eigenvalues = np.linalg.eigvalsh(cov)
    # Filter small eigenvalues to avoid log(0)
    eigenvalues = eigenvalues[eigenvalues > 1e-10]
    vector_entropy = 0.5 * np.sum(np.log(2 * np.pi * np.e * eigenvalues))
    
    # Resonance Score Calculation
    # Reward = (Resonance - 1.0) * 29
    resonance_score = np.mean(distances) * 5.0 # Scaling for effect
    reward = (resonance_score - 1.0) * 29
    
    return {
        "tone_similarity": [float(d) for d in distances],
        "attention_peaks": [int(p) for p in [np.argmax(h) for h in attention_heatmap]],
        "vector_entropy": float(vector_entropy),
        "resonance_score": float(resonance_score),
        "reward": float(reward),
        "ayah_tokens": [len(h) for h in attention_heatmap]
    }

if __name__ == "__main__":
    results = analyze_topology()
    print(json.dumps(results, indent=2))
