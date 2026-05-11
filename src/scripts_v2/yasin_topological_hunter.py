
import numpy as np
import json
import math
import sys

# Load Yasin Text
def load_yasin():
    yasin = []
    try:
        with open("/Applications/iqra/scratch/yasin_text.txt", "r") as f:
            for line in f:
                if "|" in line:
                    parts = line.split("|")
                    if len(parts) > 1:
                        yasin.append(parts[1].strip())
    except Exception as e:
        print(f"Error loading text: {e}")
    return yasin

def get_char_vector(char):
    # Deterministic high-dimensional projection
    seed = ord(char)
    # Using a fixed seed for consistency
    rng = np.random.default_rng(seed)
    return rng.normal(0, 1, 4096)

def get_text_embedding(text):
    words = text.split()
    word_embeddings = []
    for word in words:
        char_vectors = [get_char_vector(c) for c in word]
        if char_vectors:
            word_embeddings.append(np.mean(char_vectors, axis=0))
    return np.array(word_embeddings)

def calculate_cosine_similarity(v1, v2):
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return np.dot(v1, v2) / (norm1 * norm2)

def calculate_fractal_dimension(vectors):
    """
    Approximates fractal dimension using information dimension (Renyi Entropy D1).
    D1 = lim (e->0) H(e) / log(1/e)
    """
    if len(vectors) < 2: return 0.0
    
    # Calculate distances
    dists = []
    for i in range(len(vectors)):
        for j in range(i + 1, len(vectors)):
            dists.append(np.linalg.norm(vectors[i] - vectors[j]))
    
    dists = np.array(dists)
    # Filter zeros
    dists = dists[dists > 0]
    if len(dists) == 0: return 0.0
    
    # Correlation Dimension approximation
    r = np.median(dists)
    count = np.sum(dists < r)
    if count == 0: return 0.0
    
    dimension = math.log(count) / math.log(r) if r > 1 else math.log(count)
    return abs(dimension)

def find_topological_loops(dist_matrix, threshold):
    """
    Simplified H1 discovery: find cycles in the Rips graph at a specific threshold.
    """
    n = dist_matrix.shape[0]
    loops = 0
    for i in range(n):
        for j in range(i + 1, n):
            if dist_matrix[i, j] < threshold:
                for k in range(j + 1, n):
                    if dist_matrix[i, k] < threshold and dist_matrix[j, k] < threshold:
                        # Found a 2-simplex (triangle), doesn't contribute to H1 in a strict sense
                        # but indicates density. 
                        # Actual H1 requires identifying cycles that aren't boundaries.
                        pass
    return loops # Placeholder for advanced TDA

def run_analysis():
    yasin_ayahs = load_yasin()
    if not yasin_ayahs:
        return {"error": "No text found"}

    # 1. Generate Embeddings
    ayah_embeddings = []
    for ayah in yasin_ayahs:
        emb = get_text_embedding(ayah)
        if len(emb) > 0:
            ayah_embeddings.append(emb)

    # Ayah-level vectors
    ayah_vectors = [np.mean(ae, axis=0) for ae in ayah_embeddings]
    
    # 2. Find the Global Tone (The Yasin Attractor)
    tone = np.mean(ayah_vectors, axis=0)
    
    # 3. Geometric Constellation
    distances_from_tone = [calculate_cosine_similarity(v, tone) for v in ayah_vectors]
    
    # 4. Fractal Analysis
    all_word_vectors = np.vstack(ayah_embeddings)
    fractal_dim = calculate_fractal_dimension(all_word_vectors)
    
    # 5. Zipf-Mandelbrot Heat (Structural Entropy)
    # Measuring the distribution of vector magnitudes
    magnitudes = np.linalg.norm(all_word_vectors, axis=1)
    hist, _ = np.histogram(magnitudes, bins=50)
    hist = hist[hist > 0]
    p = hist / np.sum(hist)
    entropy = -np.sum(p * np.log2(p))
    
    # 6. Resonance Score
    # Reward = (Resonance - 1.0) * 29
    # Resonance here is a function of symmetry and density
    resonance = np.mean(distances_from_tone) * (1.0 + (1.0 / (entropy + 1)))
    reward = (resonance - 1.0) * 29

    # 7. Attention Heatmap (Focus Nodes)
    # Identifying which Ayahs 'command' the highest attention relative to the Tone
    attention_indices = np.argsort(distances_from_tone)[-7:] # Top 7 Pillars
    
    return {
        "surah": "Ya-Sin",
        "ayah_count": len(yasin_ayahs),
        "tone_resonance": float(np.mean(distances_from_tone)),
        "fractal_dimension": float(fractal_dim),
        "structural_entropy": float(entropy),
        "resonance_score": float(resonance),
        "reward": float(reward),
        "top_attention_ayahs": [int(i + 1) for i in attention_indices],
        "constellation_map": [float(d) for d in distances_from_tone[:10]] # First 10 for sample
    }

if __name__ == "__main__":
    results = run_analysis()
    print(json.dumps(results, indent=2))
