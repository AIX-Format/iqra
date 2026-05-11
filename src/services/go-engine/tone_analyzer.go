package main

import (
	"math"
	"math/cmplx"
)

// AbjadMap defines the numerical value of Arabic letters
var AbjadMap = map[rune]int{
	'ا': 1, 'أ': 1, 'إ': 1, 'آ': 1, 'ى': 1, 'ء': 1,
	'ب': 2,
	'ج': 3,
	'د': 4,
	'ه': 5, 'ة': 5,
	'و': 6,
	'ز': 7,
	'ح': 8,
	'ط': 9,
	'ي': 10, 'ئ': 10,
	'ك': 20,
	'ل': 30,
	'م': 40,
	'ن': 50,
	'س': 60,
	'ع': 70,
	'ف': 80,
	'ص': 90,
	'ق': 100,
	'ر': 200,
	'ش': 300,
	'ت': 400,
	'ث': 500,
	'خ': 600,
	'ذ': 700,
	'ض': 800,
	'ظ': 900,
	'غ': 1000,
}

// ToneResult contains the frequency analysis of the text
type ToneResult struct {
	DominantFrequency float64   `json:"dominant_frequency"`
	ResonancePower    float64   `json:"resonance_power"`
	Spectrum          []float64 `json:"spectrum"`
}

// CalculateTone treats the text as a signal of Abjad values and finds the dominant frequency
func CalculateTone(text string) ToneResult {
	cleanText := removeArabicDiacritics(text)
	var signal []float64

	for _, r := range cleanText {
		if val, ok := AbjadMap[r]; ok {
			signal = append(signal, float64(val))
		}
	}

	if len(signal) < 2 {
		return ToneResult{}
	}

	// Simple Discrete Fourier Transform (DFT) for Edge AI efficiency
	n := len(signal)
	spectrum := make([]float64, n/2+1)
	maxPower := 0.0
	domFreq := 0.0

	for k := 0; k <= n/2; k++ {
		sum := complex(0, 0)
		for t := 0; t < n; t++ {
			angle := 2.0 * math.Pi * float64(k) * float64(t) / float64(n)
			sum += complex(signal[t], 0) * cmplx.Exp(complex(0, -angle))
		}
		power := cmplx.Abs(sum)
		spectrum[k] = power

		// Ignore the DC component (k=0) for dominant frequency
		if k > 0 && power > maxPower {
			maxPower = power
			domFreq = float64(k) / float64(n)
		}
	}

	return ToneResult{
		DominantFrequency: domFreq,
		ResonancePower:    maxPower,
		Spectrum:          spectrum,
	}
}
