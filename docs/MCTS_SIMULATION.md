# MCTS Self-Playing Simulation Documentation

## Overview

The IQRA Self-Playing Simulation system uses Monte Carlo Tree Search (MCTS) to automatically generate training data and discover Quranic patterns without human intervention.

## Architecture

### Core Components

1. **MCTS Engine** (`lib/iqra/simulation/mcts_engine.ts`)
   - Implements complete MCTS algorithm
   - UCB1 selection for balanced exploration/exploitation
   - Integration with Qalbin VM for state evaluation

2. **MCTS Node** (`lib/iqra/simulation/mcts_node.ts`)
   - Tree node representation
   - Action generation (expand, refine, validate, explore)
   - Quality scoring and statistics tracking

3. **Training Data Pipeline** (`lib/iqra/simulation/training_data_pipeline.ts`)
   - Export high-quality training examples
   - JSONL/JSON/CSV format support
   - Quality filtering and deduplication

### Integration Points

- **Qalbin VM**: Evaluates states using Shannon entropy and resonance
- **Persistent Homology**: Calculates H0, H1, H2 topological features
- **Enhanced Numerical Validator**: Detects sacred number patterns (7, 19, Tesla 369)
- **Go Engine**: High-performance HTTP API for pattern analysis

## Usage

### Basic Simulation

```typescript
import { MCTSEngine, MCTSNodeState } from '../lib/iqra/simulation/mcts_engine';

const initialState: MCTSNodeState = {
  id: 'initial',
  content: 'بسم الله الرحمن الرحيم',
  resonance: 0.5,
  entropy: 2.0,
  patterns: ['Arabic_Text'],
  timestamp: Date.now()
};

const engine = new MCTSEngine(initialState, {
  maxIterations: 369,
  resonanceThreshold: 0.7,
  qualityThreshold: 0.6
});

const result = await engine.runSimulation();
```

### Training Data Export

```typescript
import { TrainingDataPipeline } from '../lib/iqra/simulation/training_data_pipeline';

const pipeline = new TrainingDataPipeline({
  format: 'jsonl',
  qualityThreshold: 0.8,
  resonanceThreshold: 0.7
});

const trainingPoints = await pipeline.processSimulationResult(result);
await pipeline.exportToFile();
```

### Go Engine API

```bash
# Start Go Engine
cd services/go-engine
go run main.go

# Qalbin VM operation
curl -X POST http://localhost:8082/qalbin/vm \
  -H "Content-Type: application/json" \
  -d '{"input":"بسم الله الرحمن الرحيم","mode":"pulse"}'

# Enhanced resonance analysis
curl -X POST http://localhost:8082/resonance/enhanced \
  -H "Content-Type: application/json" \
  -d '{"input":"الحمد لله رب العالمين","threshold":0.7}'
```

## Pattern Discovery

### Sacred Number Patterns

- **Seven (7)**: Divine perfection, heavens, days
- **Nineteen (19)**: Mathematical miracle, Bismillah
- **Tesla 369**: Universal frequency patterns
- **Prime Numbers**: Sovereign mathematical properties
- **Fibonacci**: Golden ratio in divine design

### Topological Patterns

- **H0**: Connected components (unity)
- **H1**: Loops and cycles (repetition)
- **H2**: Voids and cavities (mystery)

### Resonance Scoring

- **Shannon Entropy**: Information complexity
- **Pattern Resonance**: Sacred number alignment
- **Topological Complexity**: Structural richness
- **Overall Quality**: Composite scoring system

## Training Data Generation

### Quality Criteria

1. **Resonance Threshold**: > 0.7 for high-quality examples
2. **Pattern Diversity**: Multiple sacred patterns detected
3. **Entropy Range**: 2.0 - 4.5 for optimal complexity
4. **Topological Richness**: H0, H1, H2 features present

### Export Formats

- **JSONL**: One training example per line
- **JSON**: Structured array format
- **CSV**: Tabular format for analysis

### Example Training Point

```json
{
  "id": "training_123",
  "input": "بسم الله",
  "action": {"type": "expand", "content": "بسم الله"},
  "output": "بسم الله الرحمن الرحيم",
  "resonance": 0.85,
  "entropy": 3.2,
  "patterns": ["Basmala", "Nineteen_Letters", "Divine_Name"],
  "quality_score": 0.92,
  "timestamp": 1704067200000
}
```

## Performance

### Simulation Speed

- **369 iterations**: ~30 seconds
- **Memory usage**: < 100MB for typical simulations
- **Training data**: 10-50 high-quality examples per run

### Scalability

- **Concurrent simulations**: Supported with independent instances
- **Large datasets**: Automatic quality filtering and deduplication
- **Distributed processing**: Ready for horizontal scaling

## Testing

### E2E Tests

Run comprehensive end-to-end tests:

```bash
npm test -- tests/mcts_simulation.e2e.test.ts
```

### Test Coverage

- MCTS engine core functionality
- Training data pipeline
- Pattern analysis integration
- Performance benchmarks
- Error handling and edge cases

## Configuration

### Environment Variables

```bash
# Simulation settings
MCTS_MAX_ITERATIONS=369
MCTS_EXPLORATION_CONSTANT=1.414
MCTS_RESONANCE_THRESHOLD=0.7

# Training data
TRAINING_OUTPUT_PATH=.iqra/training_data.jsonl
TRAINING_FORMAT=jsonl
TRAINING_QUALITY_THRESHOLD=0.8
```

### Advanced Configuration

```typescript
const config = {
  maxIterations: 369,           // MCTS iterations
  explorationConstant: 1.414,   // UCB1 exploration factor
  resonanceThreshold: 0.7,     // Minimum resonance for quality
  qualityThreshold: 0.6,       // Overall quality threshold
  maxDepth: 10,                // Maximum tree depth
  compressionEnabled: false    // Output compression
};
```

## Troubleshooting

### Common Issues

1. **Low resonance scores**: Check input text quality and sacred content
2. **Memory usage**: Reduce maxIterations or maxDepth for large texts
3. **Slow performance**: Enable Go Engine for faster pattern analysis
4. **Poor training data**: Adjust quality thresholds and pattern filters

### Debug Mode

```typescript
const engine = new MCTSEngine(initialState, {
  maxIterations: 50,  // Reduced for debugging
  resonanceThreshold: 0.3  // Lower threshold for more data
});

// Enable detailed logging
console.log(engine.getTreeStats());
```

## Future Enhancements

### Planned Features

- **AlphaZero integration**: Deep neural network policy/value networks
- **Multi-modal patterns**: Image, audio, and video pattern analysis
- **Real-time learning**: Continuous model improvement
- **Distributed simulation**: Multi-node MCTS processing

### Research Directions

- **Quantum patterns**: Quantum computing integration
- **Cross-lingual analysis**: Multi-language pattern discovery
- **Historical validation**: Pattern verification through Islamic history
- **Predictive modeling**: Future pattern anticipation

---

*"وَمَا أُوتِيتُمْ مِنَ الْعِلْمِ إِلَّا قَلِيلًا"* — الإسراء: 85
