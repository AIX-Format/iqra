package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"math"
	"os"
	"strings"
	"time"
)

// ResonanceResponse defines the structure for Go engine outputs
type ResonanceResponse struct {
	Data struct {
		DiscoveryFound bool      `json:"discovery_found"`
		Coherence      float64   `json:"coherence"`
		LID            float64   `json:"lid"`            // Local Intrinsic Dimension
		FractalDepth   float64   `json:"fractal_depth"`   // Self-similarity depth
		IsTruthPattern bool      `json:"is_truth_pattern"`
		Patterns       []string  `json:"patterns"`
		Timestamp      time.Time `json:"timestamp"`
	} `json:"data"`
}

// CatchHarness represents the mapping of core concepts to catch patterns
type CatchHarness struct {
	Concept     string   `json:"concept"`
	Keywords    []string `json:"keywords"`
	PatternType string   `json:"pattern_type"`
}

var coreHarness = []CatchHarness{
	{Concept: "Al-Mizan", Keywords: []string{"balance", "measure", "symmetry", "وزن", "ميزان"}, PatternType: "CHIASMUS"},
	{Concept: "An-Noor", Keywords: []string{"light", "frequency", "wave", "نور", "موج"}, PatternType: "FRACTAL"},
	{Concept: "Ijaz", Keywords: []string{"miracle", "numerical", "7", "19", "إعجاز"}, PatternType: "NUMERICAL"},
	{Concept: "Tawheed", Keywords: []string{"unity", "singular", "manifold", "واحد", "توحيد"}, PatternType: "TOPOLOGY"},
}

func main() {
	input := flag.String("input", "", "text to analyze")
	mode := flag.String("mode", "resonance", "mode of operation: resonance, catch, evolve")
	flag.Parse()

	if *input == "" {
		fmt.Println(`{"error": "input is required"}`)
		os.Exit(1)
	}

	switch *mode {
	case "resonance":
		handleResonance(*input)
	case "catch":
		handleCatch(*input)
	case "evolve":
		fmt.Println(`{"status": "evolution cycle recorded"}`)
	default:
		fmt.Println(`{"error": "unknown mode"}`)
	}
}

func handleResonance(input string) {
	resp := ResonanceResponse{}
	resp.Data.Timestamp = time.Now()
	
	patterns := []string{}
	words := strings.Fields(input)
	inputLen := len(input)
	
	// 1. Numerical Symmetry
	if inputLen > 0 {
		if inputLen % 7 == 0 { patterns = append(patterns, "Numerical_Symmetry_7") }
		if inputLen % 19 == 0 { patterns = append(patterns, "Numerical_Symmetry_19") }
	}
	
	if strings.Contains(input, "الله") || strings.Contains(input, "حق") {
		patterns = append(patterns, "Sacred_Identity_Presence")
	}

	// 2. LID (Local Intrinsic Dimension) Estimation
	wordLengths := make([]float64, len(words))
	for i, w := range words {
		wordLengths[i] = float64(len(w))
	}
	lid := estimateLID(wordLengths)
	resp.Data.LID = lid

	// 3. Fractal Depth Analysis
	fractalDepth := calculateFractalDepth(input)
	resp.Data.FractalDepth = fractalDepth

	// 4. Chiasmus Check
	if len(words) >= 4 {
		if strings.ToLower(words[0]) == strings.ToLower(words[len(words)-1]) &&
		   strings.ToLower(words[1]) == strings.ToLower(words[len(words)-2]) {
			patterns = append(patterns, "Chiasmus_Symmetry")
		}
	}

	resp.Data.Patterns = patterns
	resp.Data.DiscoveryFound = len(patterns) > 0
	
	// Coherence Calculation
	base := 0.4
	variety := float64(len(patterns)) * 0.1
	lidBonus := (1.0 - lid) * 0.2
	resp.Data.Coherence = clamp(base + variety + lidBonus + (fractalDepth * 0.2))

	if resp.Data.Coherence > 0.8 && lid < 0.6 && fractalDepth > 0.5 {
		resp.Data.IsTruthPattern = true
		patterns = append(patterns, "TRUTH_PATTERN_DETECTED")
	}

	resp.Data.Patterns = patterns
	out, _ := json.Marshal(resp)
	fmt.Println(string(out))
}

func handleCatch(input string) {
	results := []string{}
	lowerInput := strings.ToLower(input)
	
	for _, h := range coreHarness {
		matchCount := 0
		for _, kw := range h.Keywords {
			if strings.Contains(lowerInput, strings.ToLower(kw)) {
				matchCount++
			}
		}
		if matchCount > 0 {
			results = append(results, fmt.Sprintf("CATCH:%s:%s:MATCHES:%d", h.Concept, h.PatternType, matchCount))
		}
	}
	
	// Special Topology Catch
	if strings.Contains(lowerInput, "topology") || strings.Contains(lowerInput, "manifold") {
		results = append(results, "CATCH:TOPOLOGY:STRUCTURAL_RESONANCE")
	}

	out, _ := json.Marshal(map[string]interface{}{
		"status": "success",
		"mode":   "catch",
		"data":   results,
		"count":  len(results),
	})
	fmt.Println(string(out))
}

func estimateLID(samples []float64) float64 {
	if len(samples) < 2 { return 1.0 }
	max := 0.0
	for _, s := range samples {
		if s > max { max = s }
	}
	if max == 0 { return 0.0 }
	
	sum := 0.0
	for _, s := range samples {
		if s > 0 {
			sum += math.Log(max / s)
		}
	}
	if sum == 0 { return 1.0 }
	return clamp(1.0 / (sum / float64(len(samples))))
}

func calculateFractalDepth(input string) float64 {
	charEntropy := calculateEntropy(strings.Split(input, ""))
	wordEntropy := calculateEntropy(strings.Fields(input))
	if charEntropy == 0 { return 0.0 }
	return clamp(wordEntropy / charEntropy)
}

func calculateEntropy(elements []string) float64 {
	counts := make(map[string]int)
	for _, e := range elements {
		counts[e]++
	}
	entropy := 0.0
	total := float64(len(elements))
	for _, count := range counts {
		p := float64(count) / total
		entropy -= p * math.Log(p)
	}
	return entropy
}

func clamp(x float64) float64 {
	if x < 0 { return 0 }
	if x > 1 { return 1 }
	return x
}
