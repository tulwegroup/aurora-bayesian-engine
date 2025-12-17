/**
 * Prior Engine Service for Aurora System
 * Computes P(D|R) = f(T, A, S, H) where:
 * T = tectonic setting compatibility (0-1)
 * A = age/timing alignment (0-1)
 * S = stratigraphic permissibility (0-1)
 * H = historical analog density (0-1)
 */

export interface RegionalFactors {
  tectonic_setting: {
    compatibility: number; // 0-1
    setting: string; // arc, craton, rift, etc.
    confidence: number; // 0-1
    evidence: string[];
  };
  age_timing: {
    compatibility: number; // 0-1
    target_age: string; // Ma
    required_age_range: [number, number]; // Ma
    timing_alignment: number; // 0-1
    confidence: number; // 0-1
  };
  stratigraphic: {
    permissibility: number; // 0-1
    host_formation: string;
    seal_formation: string;
    structural_traps: boolean;
    confidence: number; // 0-1
  };
  historical_analogs: {
    density: number; // 0-1
    analog_count: number;
    success_rate: number; // 0-1
    distance_weight: number; // 0-1
    similarity_score: number; // 0-1
  };
}

export interface PriorResult {
  probability: number;
  uncertainty: number;
  confidence_interval: [number, number];
  factors: RegionalFactors;
  formula: string;
  reasoning: string[];
  metadata: {
    region: string;
    commodity: string;
    computation_time: Date;
    data_quality: 'high' | 'medium' | 'low';
  };
}

export class PriorEngineService {
  private readonly PRIOR_FLOOR: number = 0.01;
  private readonly PRIOR_CEILING: number = 0.3;
  private readonly MIN_CONFIDENCE_THRESHOLD: number = 0.3;

  /**
   * Compute regional prior probability from geological factors
   */
  async computeRegionalPrior(
    region: string,
    commodity: string,
    location: { longitude: number; latitude: number },
    geologicalContext: {
      tectonic_setting: string;
      age: string;
      stratigraphy: string;
      structure: string;
    }
  ): Promise<PriorResult> {
    // 1. Evaluate each factor
    const tectonicFactor = await this.evaluateTectonicSetting(
      geologicalContext.tectonic_setting,
      commodity
    );

    const ageFactor = await this.evaluateAgeTiming(
      geologicalContext.age,
      commodity
    );

    const stratigraphicFactor = await this.evaluateStratigraphicPermissibility(
      geologicalContext.stratigraphy,
      commodity
    );

    const analogFactor = await this.evaluateHistoricalAnalogs(
      location,
      commodity,
      geologicalContext
    );

    const factors: RegionalFactors = {
      tectonic_setting: tectonicFactor,
      age_timing: ageFactor,
      stratigraphic: stratigraphicFactor,
      historical_analogs: analogFactor
    };

    // 2. Apply Bayesian network formula
    const rawPrior = this.applyBayesianNetwork(factors);

    // 3. Apply constraints
    const constrainedPrior = Math.max(
      this.PRIOR_FLOOR,
      Math.min(this.PRIOR_CEILING, rawPrior)
    );

    // 4. Compute uncertainty
    const uncertainty = this.computePriorUncertainty(factors);

    // 5. Generate reasoning
    const reasoning = this.generateReasoning(factors, constrainedPrior, commodity);

    // 6. Compute confidence interval
    const confidenceInterval = this.computeConfidenceInterval(
      constrainedPrior,
      uncertainty
    );

    return {
      probability: constrainedPrior,
      uncertainty,
      confidence_interval: confidenceInterval,
      factors,
      formula: "P(D|R) = (T × A × S × H)^0.25",
      reasoning,
      metadata: {
        region,
        commodity,
        computation_time: new Date(),
        data_quality: this.assessDataQuality(factors)
      }
    };
  }

  /**
   * Evaluate tectonic setting compatibility
   */
  private async evaluateTectonicSetting(
    setting: string,
    commodity: string
  ): Promise<RegionalFactors['tectonic_setting']> {
    const compatibilityRules: Record<string, Record<string, number>> = {
      copper_porphyry: {
        'continental_arc': 0.95,
        'island_arc': 0.90,
        'back_arc': 0.70,
        'collisional': 0.30,
        'rift': 0.10,
        'craton': 0.05
      },
      lithium_brine: {
        'rift': 0.90,
        'continental_arc': 0.60,
        'back_arc': 0.50,
        'collisional': 0.40,
        'island_arc': 0.20,
        'craton': 0.30
      },
      hydrocarbon_onshore: {
        'craton': 0.80,
        'passive_margin': 0.75,
        'rift': 0.70,
        'foreland_basin': 0.85,
        'continental_arc': 0.40,
        'collisional': 0.60
      },
      hydrocarbon_offshore: {
        'passive_margin': 0.95,
        'continental_arc': 0.50,
        'rift': 0.80,
        'foreland_basin': 0.70,
        'collisional': 0.40
      }
    };

    const normalizedSetting = this.normalizeTectonicSetting(setting);
    const compatibility = compatibilityRules[commodity]?.[normalizedSetting] || 0.1;

    const evidence = this.getTectonicEvidence(normalizedSetting, commodity);
    const confidence = this.computeTectonicConfidence(evidence);

    return {
      compatibility,
      setting: normalizedSetting,
      confidence,
      evidence
    };
  }

  /**
   * Evaluate age/timing alignment
   */
  private async evaluateAgeTiming(
    age: string,
    commodity: string
  ): Promise<RegionalFactors['age_timing']> {
    const ageMa = this.parseAge(age);
    
    const ageRequirements: Record<string, [number, number]> = {
      copper_porphyry: [1, 100], // Cenozoic to Mesozoic
      lithium_brine: [0, 10], // Very recent (active systems)
      hydrocarbon_onshore: [50, 500], // Mesozoic to Paleozoic
      hydrocarbon_offshore: [10, 200] // Cenozoic to Mesozoic
    };

    const requiredRange = ageRequirements[commodity] || [0, 1000];
    const [minAge, maxAge] = requiredRange;

    let timingAlignment = 0;
    if (ageMa >= minAge && ageMa <= maxAge) {
      // Optimal range
      const center = (minAge + maxAge) / 2;
      const range = maxAge - minAge;
      const distance = Math.abs(ageMa - center);
      timingAlignment = Math.max(0, 1 - (distance / (range / 2)));
    } else {
      // Outside range - penalty based on distance
      const distance = ageMa < minAge ? minAge - ageMa : ageMa - maxAge;
      timingAlignment = Math.max(0, 0.1 - distance / 1000);
    }

    const compatibility = Math.max(0, timingAlignment);

    return {
      compatibility,
      target_age: age,
      required_age_range: requiredRange,
      timing_alignment: timingAlignment,
      confidence: 0.8 // High confidence in age dating
    };
  }

  /**
   * Evaluate stratigraphic permissibility
   */
  private async evaluateStratigraphicPermissibility(
    stratigraphy: string,
    commodity: string
  ): Promise<RegionalFactors['stratigraphic']> {
    const stratRules: Record<string, {
      host_formations: string[];
      seal_formations: string[];
      structural_traps_required: boolean;
    }> = {
      copper_porphyry: {
        host_formations: ['intrusive', 'volcanic', 'plutonic'],
        seal_formations: ['sedimentary', 'volcanic', 'hydrothermal'],
        structural_traps_required: false
      },
      lithium_brine: {
        host_formations: ['evaporite', 'lacustrine', 'playa'],
        seal_formations: ['evaporite', 'clay', 'mudstone'],
        structural_traps_required: true
      },
      hydrocarbon_onshore: {
        host_formations: ['sandstone', 'limestone', 'dolomite'],
        seal_formations: ['shale', 'evaporite', 'mudstone'],
        structural_traps_required: true
      },
      hydrocarbon_offshore: {
        host_formations: ['sandstone', 'limestone', 'chalk'],
        seal_formations: ['shale', 'mudstone', 'evaporite'],
        structural_traps_required: true
      }
    };

    const rules = stratRules[commodity];
    const hostMatch = rules.host_formations.some(host => 
      stratigraphy.toLowerCase().includes(host.toLowerCase())
    );
    const sealMatch = rules.seal_formations.some(seal => 
      stratigraphy.toLowerCase().includes(seal.toLowerCase())
    );

    let permissibility = 0;
    if (hostMatch && sealMatch) {
      permissibility = 0.9;
    } else if (hostMatch) {
      permissibility = 0.6;
    } else if (sealMatch) {
      permissibility = 0.4;
    } else {
      permissibility = 0.1;
    }

    return {
      permissibility,
      host_formation: hostMatch ? 'identified' : 'unknown',
      seal_formation: sealMatch ? 'identified' : 'unknown',
      structural_traps: rules.structural_traps_required,
      confidence: 0.7
    };
  }

  /**
   * Evaluate historical analogs
   */
  private async evaluateHistoricalAnalogs(
    location: { longitude: number; latitude: number },
    commodity: string,
    geologicalContext: any
  ): Promise<RegionalFactors['historical_analogs']> {
    // Mock analog database - in reality would query spatial database
    const mockAnalogs = this.getMockAnalogs(location, commodity);
    
    const analogCount = mockAnalogs.length;
    const successRate = analogCount > 0 
      ? mockAnalogs.filter(a => a.successful).length / analogCount 
      : 0;

    // Distance weighting (closer analogs more relevant)
    const maxDistance = 1000; // km
    const distanceWeight = analogCount > 0
      ? Math.max(0, 1 - (this.getAverageDistance(mockAnalogs) / maxDistance))
      : 0;

    // Geological similarity
    const similarityScore = this.computeGeologicalSimilarity(
      geologicalContext,
      mockAnalogs
    );

    // Combined density score
    const density = (analogCount / 50) * successRate * distanceWeight * similarityScore;
    const normalizedDensity = Math.min(1.0, density);

    return {
      density: normalizedDensity,
      analog_count: analogCount,
      success_rate: successRate,
      distance_weight: distanceWeight,
      similarity_score: similarityScore
    };
  }

  /**
   * Apply Bayesian network formula
   */
  private applyBayesianNetwork(factors: RegionalFactors): number {
    const T = factors.tectonic_setting.compatibility;
    const A = factors.age_timing.compatibility;
    const S = factors.stratigraphic.permissibility;
    const H = factors.historical_analogs.density;

    // Geometric mean for Bayesian network
    return Math.pow(T * A * S * H, 0.25);
  }

  /**
   * Compute uncertainty from factor variances
   */
  private computePriorUncertainty(factors: RegionalFactors): number {
    const tectonicVar = (1 - factors.tectonic_setting.confidence) * 0.1;
    const ageVar = (1 - factors.age_timing.confidence) * 0.05;
    const stratVar = (1 - factors.stratigraphic.confidence) * 0.08;
    const analogVar = (1 - factors.historical_analogs.similarity_score) * 0.12;

    return Math.sqrt(tectonicVar + ageVar + stratVar + analogVar);
  }

  /**
   * Generate reasoning for prior computation
   */
  private generateReasoning(
    factors: RegionalFactors,
    prior: number,
    commodity: string
  ): string[] {
    const reasoning: string[] = [];

    // Tectonic reasoning
    if (factors.tectonic_setting.compatibility > 0.8) {
      reasoning.push(`Excellent tectonic setting (${factors.tectonic_setting.setting}) for ${commodity}`);
    } else if (factors.tectonic_setting.compatibility > 0.5) {
      reasoning.push(`Moderately suitable tectonic setting (${factors.tectonic_setting.setting})`);
    } else {
      reasoning.push(`Poor tectonic setting compatibility`);
    }

    // Age timing reasoning
    if (factors.age_timing.timing_alignment > 0.8) {
      reasoning.push(`Optimal age timing (${factors.age_timing.target_age})`);
    } else if (factors.age_timing.timing_alignment > 0.5) {
      reasoning.push(`Acceptable age timing`);
    } else {
      reasoning.push(`Suboptimal age timing`);
    }

    // Stratigraphic reasoning
    if (factors.stratigraphic.permissibility > 0.8) {
      reasoning.push(`Favorable stratigraphic conditions identified`);
    } else if (factors.stratigraphic.permissibility > 0.5) {
      reasoning.push(`Moderate stratigraphic potential`);
    } else {
      reasoning.push(`Limited stratigraphic potential`);
    }

    // Analog reasoning
    if (factors.historical_analogs.analog_count > 10) {
      reasoning.push(`Strong analog support (${factors.historical_analogs.analog_count} analogs)`);
    } else if (factors.historical_analogs.analog_count > 3) {
      reasoning.push(`Some analog support`);
    } else {
      reasoning.push(`Limited analog support`);
    }

    // Overall assessment
    if (prior > 0.2) {
      reasoning.push(`High regional potential for ${commodity} deposits`);
    } else if (prior > 0.1) {
      reasoning.push(`Moderate regional potential`);
    } else {
      reasoning.push(`Low regional potential`);
    }

    return reasoning;
  }

  /**
   * Compute confidence interval
   */
  private computeConfidenceInterval(
    mean: number,
    uncertainty: number,
    confidence: number = 0.95
  ): [number, number] {
    const zScore = 1.96; // 95% confidence
    const lower = Math.max(0, mean - zScore * uncertainty);
    const upper = Math.min(1, mean + zScore * uncertainty);
    return [lower, upper];
  }

  /**
   * Assess overall data quality
   */
  private assessDataQuality(factors: RegionalFactors): 'high' | 'medium' | 'low' {
    const avgConfidence = (
      factors.tectonic_setting.confidence +
      factors.age_timing.confidence +
      factors.stratigraphic.confidence +
      factors.historical_analogs.similarity_score
    ) / 4;

    if (avgConfidence > 0.8) return 'high';
    if (avgConfidence > 0.6) return 'medium';
    return 'low';
  }

  // Helper methods
  private normalizeTectonicSetting(setting: string): string {
    const normalized = setting.toLowerCase().replace(/[_\s-]/g, '');
    const mapping: Record<string, string> = {
      'continentalarc': 'continental_arc',
      'islandarc': 'island_arc',
      'backarc': 'back_arc',
      'passivemargin': 'passive_margin',
      'forelandbasin': 'foreland_basin'
    };
    return mapping[normalized] || normalized;
  }

  private getTectonicEvidence(setting: string, commodity: string): string[] {
    // Mock evidence - in reality would pull from geological database
    return [
      'regional geological maps',
      'tectonic reconstructions',
      'geophysical data',
      'published literature'
    ];
  }

  private computeTectonicConfidence(evidence: string[]): number {
    // Mock confidence based on evidence availability
    return 0.8;
  }

  private parseAge(age: string): number {
    // Parse age string to Ma (millions of years)
    const match = age.match(/(\d+(?:\.\d+)?)\s*Ma/i);
    return match ? parseFloat(match[1]) : 100;
  }

  private getMockAnalogs(location: any, commodity: string): any[] {
    // Mock analog data - in reality would query spatial database
    return [
      { distance: 150, successful: true, similarity: 0.8 },
      { distance: 300, successful: true, similarity: 0.7 },
      { distance: 500, successful: false, similarity: 0.6 }
    ];
  }

  private getAverageDistance(analogs: any[]): number {
    return analogs.reduce((sum, a) => sum + a.distance, 0) / analogs.length;
  }

  private computeGeologicalSimilarity(context: any, analogs: any[]): number {
    return analogs.length > 0 
      ? analogs.reduce((sum, a) => sum + a.similarity, 0) / analogs.length 
      : 0;
  }
}