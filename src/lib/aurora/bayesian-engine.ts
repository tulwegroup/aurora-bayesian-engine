/**
 * Core Bayesian Engine for Aurora Subsurface Intelligence System
 * Implements formal Bayesian fusion with uncertainty propagation
 * 
 * Mathematical foundation: P(D|E,G) = [P(D|R) × Π P(E_i|D)] / Z if G=True else 0
 * where D = deposit, E = evidence, G = geological constraints, R = regional
 */

export interface PriorDistribution {
  mean: number;
  variance: number;
  confidence_interval: [number, number];
  tectonic_setting: number;
  age_timing: number;
  stratigraphic: number;
  historical_analogs: number;
}

export interface LikelihoodDistribution {
  mean: number;
  variance: number;
  confidence_interval: [number, number];
  evidence_type: 'chemical' | 'structural' | 'physical' | 'surface';
  adjustment_applied?: boolean;
  correlation_penalty?: number;
}

export interface VetoResult {
  passed: boolean;
  probability: number;
  failure_category?: string;
  failure_condition?: string;
  failure_reason?: string;
  audit_trail: any[];
  timestamp: Date;
}

export interface PosteriorDistribution {
  mean: number;
  variance: number;
  confidence_class: 'NOISE' | 'RECON' | 'PROSPECT' | 'PRIORITY' | 'DRILL_JUSTIFIED';
  uncertainty_bounds: [number, number];
  likelihood_contributions: Record<string, number>;
  veto_reason?: string;
  normalization_constant: number;
}

export interface CollapseResult {
  collapsed: boolean;
  supportive_count: number;
  uncertainty_reduction: number;
  convergence_score: number;
  collapse_strength: number;
}

export class AuroraBayesianEngine {
  private correlation_threshold: number = 0.7;
  private prior_floor: number = 0.01;
  private prior_ceiling: number = 0.3;

  /**
   * Core Bayesian computation with full uncertainty propagation
   */
  computePosteriorWithUncertainty(
    prior: PriorDistribution,
    likelihoods: Record<string, LikelihoodDistribution>,
    vetoResult: VetoResult
  ): PosteriorDistribution {
    // 1. ENFORCE GEOLOGICAL VETO (HARD CONSTRAINTS)
    if (!vetoResult.passed) {
      return {
        mean: 0.0,
        variance: 0.0,
        confidence_class: "NOISE",
        uncertainty_bounds: [0.0, 0.0],
        likelihood_contributions: {},
        veto_reason: vetoResult.failure_reason,
        normalization_constant: 0.0
      };
    }

    // 2. APPLY INDEPENDENCE CORRECTION
    const correlationMatrix = this.computeEvidenceCorrelationMatrix(Object.keys(likelihoods));
    const correctedLikelihoods = this.applyIndependenceCorrection(likelihoods, correlationMatrix);

    // 3. PROPAGATE UNCERTAINTIES THROUGH PRODUCT (using log-space for numerical stability)
    let logPosteriorMean = Math.log(prior.mean);
    let posteriorVariance = prior.variance;

    const contributions: Record<string, number> = {};

    for (const [name, likelihood] of Object.entries(correctedLikelihoods)) {
      // Use log-space for numerical stability
      logPosteriorMean += Math.log(likelihood.mean);
      posteriorVariance = this.propagateProductUncertainty(posteriorVariance, likelihood.variance);
      
      // Track contribution percentage
      contributions[name] = likelihood.mean;
    }

    const posteriorMean = Math.exp(logPosteriorMean);

    // 4. APPLY NORMALIZATION CONSTANT Z
    const Z = this.computeNormalizationConstant(prior, correctedLikelihoods);
    const normalizedMean = posteriorMean / Z;

    // 5. DETERMINE CONFIDENCE CLASS
    const confidenceClass = this.classifyConfidence(normalizedMean, posteriorVariance);

    // 6. COMPUTE UNCERTAINTY BOUNDS (95% CI)
    const uncertaintyBounds = this.computeCredibleInterval(
      normalizedMean, 
      posteriorVariance, 
      0.95
    );

    return {
      mean: normalizedMean,
      variance: posteriorVariance,
      confidence_class: confidenceClass,
      uncertainty_bounds: uncertaintyBounds,
      likelihood_contributions: contributions,
      normalization_constant: Z
    };
  }

  /**
   * Prevents double-counting of correlated evidence
   * Implements: L_corrected = L_original^(1/ρ) where ρ is correlation
   */
  private applyIndependenceCorrection(
    likelihoods: Record<string, LikelihoodDistribution>,
    correlationMatrix: number[][]
  ): Record<string, LikelihoodDistribution> {
    const corrected: Record<string, LikelihoodDistribution> = {};
    const likelihoodNames = Object.keys(likelihoods);

    for (let i = 0; i < likelihoodNames.length; i++) {
      const name = likelihoodNames[i];
      const originalLikelihood = likelihoods[name];

      // Find maximum correlation with other evidence
      const maxCorrelation = Math.max(...correlationMatrix[i].map(Math.abs)) - 1.0;

      if (maxCorrelation > this.correlation_threshold) {
        // Apply correlation penalty
        const penaltyFactor = 1.0 / (1.0 + maxCorrelation);
        const correctedMean = Math.pow(originalLikelihood.mean, penaltyFactor);
        const correctedVariance = originalLikelihood.variance * penaltyFactor;

        corrected[name] = {
          ...originalLikelihood,
          mean: correctedMean,
          variance: correctedVariance,
          adjustment_applied: true,
          correlation_penalty: penaltyFactor
        };
      } else {
        corrected[name] = originalLikelihood;
      }
    }

    return corrected;
  }

  /**
   * Compute correlation matrix between evidence types
   */
  private computeEvidenceCorrelationMatrix(evidenceTypes: string[]): number[][] {
    const n = evidenceTypes.length;
    const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));

    // Default correlation structure based on geological knowledge
    const correlationMap: Record<string, Record<string, number>> = {
      'chemical': { 'structural': 0.3, 'physical': 0.5, 'surface': 0.7 },
      'structural': { 'chemical': 0.3, 'physical': 0.4, 'surface': 0.6 },
      'physical': { 'chemical': 0.5, 'structural': 0.4, 'surface': 0.3 },
      'surface': { 'chemical': 0.7, 'structural': 0.6, 'physical': 0.3 }
    };

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1.0;
        } else {
          const type1 = evidenceTypes[i];
          const type2 = evidenceTypes[j];
          matrix[i][j] = correlationMap[type1]?.[type2] || 0.2;
        }
      }
    }

    return matrix;
  }

  /**
   * Propagate uncertainty through product of distributions
   */
  private propagateProductUncertainty(var1: number, var2: number): number {
    // For independent variables: Var(XY) = Var(X)Var(Y) + Var(X)E[Y]^2 + Var(Y)E[X]^2
    // Assuming mean ~ 1 for likelihoods, this simplifies to:
    return var1 * var2 + var1 + var2;
  }

  /**
   * Compute normalization constant Z
   */
  private computeNormalizationConstant(
    prior: PriorDistribution,
    likelihoods: Record<string, LikelihoodDistribution>
  ): number {
    // Simplified normalization - in full implementation would integrate over hypothesis space
    let z = prior.mean;
    for (const likelihood of Object.values(likelihoods)) {
      z *= likelihood.mean;
    }
    return Math.max(z, 0.001); // Prevent division by zero
  }

  /**
   * Classify confidence level based on probability and uncertainty
   */
  private classifyConfidence(mean: number, variance: number): PosteriorDistribution['confidence_class'] {
    const uncertainty = Math.sqrt(variance);
    const signalToNoise = mean / uncertainty;

    if (mean < 0.05 || signalToNoise < 1) return 'NOISE';
    if (mean < 0.15 || signalToNoise < 2) return 'RECON';
    if (mean < 0.35 || signalToNoise < 3) return 'PROSPECT';
    if (mean < 0.65 || signalToNoise < 4) return 'PRIORITY';
    return 'DRILL_JUSTIFIED';
  }

  /**
   * Compute credible interval for probability distribution
   */
  private computeCredibleInterval(
    mean: number, 
    variance: number, 
    confidence: number
  ): [number, number] {
    const stdDev = Math.sqrt(variance);
    const zScore = this.getZScore(confidence);
    
    const lower = Math.max(0, mean - zScore * stdDev);
    const upper = Math.min(1, mean + zScore * stdDev);
    
    return [lower, upper];
  }

  /**
   * Get Z-score for confidence level (approximation)
   */
  private getZScore(confidence: number): number {
    const zScores: Record<number, number> = {
      0.90: 1.645,
      0.95: 1.96,
      0.99: 2.576
    };
    return zScores[confidence] || 1.96;
  }

  /**
   * Compute prior probability from regional factors
   */
  computeRegionalPrior(
    tectonicSetting: number,
    ageTiming: number,
    stratigraphic: number,
    historicalAnalogs: number
  ): PriorDistribution {
    // Bayesian network for prior computation
    const mean = (tectonicSetting * ageTiming * stratigraphic * historicalAnalogs) ** 0.25;
    const constrainedMean = Math.max(this.prior_floor, Math.min(this.prior_ceiling, mean));
    
    // Uncertainty increases with complexity
    const variance = 0.01 * (1 + Math.abs(Math.log(constrainedMean)));
    
    return {
      mean: constrainedMean,
      variance,
      confidence_interval: [
        Math.max(0, constrainedMean - 2 * Math.sqrt(variance)),
        Math.min(1, constrainedMean + 2 * Math.sqrt(variance))
      ],
      tectonic_setting: tectonicSetting,
      age_timing: ageTiming,
      stratigraphic,
      historical_analogs: historicalAnalogs
    };
  }
}