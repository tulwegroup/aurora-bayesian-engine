# Aurora Bayesian Certainty Engine

A comprehensive subsurface intelligence system that implements physics-first principles for geological discovery probability through formal Bayesian mathematics.

## 🎯 Core Philosophy

**Aurora is NOT another AI black-box** - it's a mathematical framework where geology holds absolute veto power. Every probability is a traceable product of evidence-weighted physics, where sensor data can only suggest but geological reality decides.

## 🧮 Mathematical Foundation

The system implements the formal Bayesian equation:
```
P(D|E,G) = [P(D|R) × Π P(E_i|D)] / Z if G=True else 0
```

Where:
- **D** = deposit existence
- **E** = evidence (chemical, structural, physical, surface)
- **G** = geological constraints (veto layer)
- **R** = regional prior
- **Z** = normalization constant

## 🏗️ Architecture

### Phase 0: Mathematical Foundation
- **AuroraBayesianEngine**: Core Bayesian fusion with uncertainty propagation
- **ProbabilityCollapseDetector**: Confidence classification and collapse detection

### Phase 1: Data Infrastructure
- **AuroraDataLake**: STAC-compliant data lake with uncertainty quantification
- **Complete SQL Schemas**: All data types (hyperspectral, SAR, gravity, seismic)

### Phase 2: Physics Microservices
- **Prior Engine Service**: Regional probability computation from geological factors
- **Chemical Likelihood Service**: Spectral unmixing and mineral detection
- **Structural & Physical Services**: Framework ready for implementation

### Phase 3: Geological Constraints
- **Geological Veto Engine**: Absolute rejection with comprehensive veto taxonomy
- **Commodity Playbooks**: Geological rules for different deposit types

### Phase 4: Bayesian Fusion
- **Independence Enforcement**: Correlation matrix and double-counting prevention
- **Uncertainty Propagation**: Full mathematical treatment of uncertainties

## 🚀 Features

### ✅ Certainty Engineering Guarantees
- **No black-box decisions**: Every probability mathematically traceable
- **No untraceable probability jumps**: All changes auditable
- **Geological veto absolute**: P=0 if any geological constraint violated
- **Conservative learning**: Never optimistic updates from failures

### ✅ Data Management
- **STAC Compliance**: Industry-standard data cataloging
- **Uncertainty Tagging**: Every pixel/data point includes uncertainty
- **Multi-modal Support**: Hyperspectral, SAR, gravity, seismic integration

### ✅ Geological Intelligence
- **Commodity Playbooks**: Copper porphyry, lithium brine, hydrocarbons
- **Mandatory Conditions**: Geological requirements for each commodity
- **Kill Factors**: Instant veto for geological impossibilities

### ✅ Interactive Dashboard
- **Real-time Analysis**: Bayesian probability calculations
- **Evidence Visualization**: Contribution charts and confidence indicators
- **Geological Veto Display**: Detailed audit trails and reasoning

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router and TypeScript
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Database**: Prisma ORM with PostgreSQL support
- **Visualization**: Recharts for probability analysis
- **Mathematics**: Formal Bayesian implementation with uncertainty propagation

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL (for production)
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/tulwegroup/aurora-bayesian-engine.git
cd aurora-bayesian-engine

# Install dependencies
bun install

# Set up database
bun run db:push

# Start development server
bun run dev
```

### Usage
1. Navigate to `http://localhost:3000`
2. View pre-loaded targets with Bayesian analysis
3. Explore different tabs:
   - **Overview**: Probability analysis and evidence contributions
   - **Bayesian**: Detailed fusion process and calculations
   - **Geological Veto**: Veto conditions and audit trails
   - **Commodity Playbook**: Geological rules and recommendations

## 📊 API Endpoints

### Target Analysis
```bash
# Analyze specific target
GET /api/route?action=analyze-target&targetId=target-001

# Get all targets
GET /api/route?action=get-targets

# System status
GET /api/route?action=system-status
```

### Custom Analysis
```bash
# Analyze custom target
POST /api/route
{
  "action": "analyze-custom-target",
  "data": { /* target data */ }
}
```

## 🔧 Configuration

### Environment Variables
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/aurora
NODE_ENV=development
```

### Next.js Configuration
- Output mode: Standalone
- TypeScript: Strict mode enabled
- ESLint: Configured for Aurora codebase

## 🧪 Testing

### Linting
```bash
bun run lint
```

### Building
```bash
bun run build
```

### Database Operations
```bash
bun run db:push    # Push schema changes
bun run db:generate # Generate Prisma client
bun run db:reset    # Reset database
```

## 📈 System Status

The Aurora system provides real-time monitoring:
- **Total Analyses**: Number of targets processed
- **Success Rate**: Percentage of successful targets
- **Veto Rejections**: Targets killed by geological constraints
- **Average Confidence**: System-wide confidence metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with full mathematical documentation
4. Ensure all probability calculations are traceable
5. Submit pull request with geological validation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Z.ai Code Scaffold
- Mathematical framework based on Bayesian certainty engineering principles
- Geological constraints derived from industry best practices
- STAC compliance following spatial data standards

---

**Aurora Bayesian Certainty Engine** - Where geology governs probability, not algorithms.