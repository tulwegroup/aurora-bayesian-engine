/**
 * Probability Collapse Detector for Aurora System
 * Detects when multiple independent likelihoods converge to create high certainty
 * Implements collapse criteria from specification
 */

export interface CollapseResult {
  collapsed: boolean;
  supportive_count: number;
  uncertainty_reduction: number;
  convergence_score: number;
  collapse_strength: number;
  confidence_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'COLLAPSED';
}

export class ProbabilityCollapseDetector {
  private readonly SUPPORTIVE_THRESHOLD: number = 1.0;
  private readonly UNCERTAINTY_REDUCTION_THRESHOLD: number = 0.7;
  private readonly CONVERGENCE_THRESHOLD: number = 0.8;
  private readonly MIN_SUPPORTIVE_LIKELIHOODS: number = 2;

  /**
   * Detects probability collapse when:
   * 1. Multiple likelihoods > 1 (supportive evidence)
   * 2. No veto violations
   * 3. Uncertainty bounds shrink significantly
   * 4. Independent convergence pattern
   */
  detectCollapse(
    prior: number,
    likelihoods: number[],
    uncertainties: number[]
  ): CollapseResult {
    // Criterion 1: Multiple supportive likelihoods
    const supportiveCount = likelihoods.filter(L => L > this.SUPPORTIVE_THRESHOLD).length;
    const isSupportive = supportiveCount >= this.MIN_SUPPORTIVE_LIKELIHOODS;

    // Criterion 2: Uncertainty reduction
    const totalUncertainty = uncertainties.reduce((prod, u) => prod * u, 1.0);
    const avgUncertainty = Math.pow(totalUncertainty, 1 / uncertainties.length);
    const uncertaintyReduction = 1.0 - avgUncertainty;
    const significantReduction = uncertaintyReduction > this.UNCERTAINTY_REDUCTION_THRESHOLD;

    // Criterion 3: Convergence pattern
    const convergenceScore = this.computeConvergenceScore(likelihoods);

    // Criterion 4: Independence validation
    const independenceValid = this.validateIndependence(likelihoods, uncertainties);

    const collapseDetected = (
      isSupportive && 
      significantReduction && 
      convergenceScore > this.CONVERGENCE_THRESHOLD &&
      independenceValid
    );

    const collapseStrength = this.computeCollapseStrength(
      prior, 
      likelihoods, 
      uncertainties
    );

    const confidenceLevel = this.classifyConfidenceLevel(
      collapseDetected,
      isSupportive,
      significantReduction,
      convergenceScore,
      collapseStrength
    );

    return {
      collapsed: collapseDetected,
      supportive_count: supportiveCount,
      uncertainty_reduction: uncertaintyReduction,
      convergence_score: convergenceScore,
      collapse_strength: collapseStrength,
      confidence_level: confidenceLevel
    };
  }

  /**
   * Measures how much likelihoods converge toward same conclusion
   */
  private computeConvergenceScore(likelihoods: number[]): number {
    if (likelihoods.length < 2) {
      return 0.0;
    }

    // Convert to log odds for better metric
    const logOdds = likelihoods.map(L => {
      if (L <= 0 || L >= 1) return 0;
      return Math.log(L / (1 - L));
    }).filter(lo => !isNaN(lo) && isFinite(lo));

    if (logOdds.length === 0) return 0.0;

    const mean = logOdds.reduce((sum, lo) => sum + lo, 0) / logOdds.length;
    const stdDev = Math.sqrt(
      logOdds.reduce((sum, lo) => sum + Math.pow(lo - mean, 2), 0) / logOdds.length
    );

    // Compute coefficient of variation (lower = more convergent)
    if (stdDev > 0 && mean !== 0) {
      const cv = Math.abs(stdDev / mean);
      return Math.max(0, 1.0 - cv);
    } else {
      return 1.0; // Perfect convergence
    }
  }

  /**
   * Validates independence of likelihoods
   */
  private validateIndependence(likelihoods: number[], uncertainties: number[]): boolean {
    // Simple independence check based on variance patterns
    // In full implementation, would use correlation matrices
    
    if (likelihoods.length < 2) return true;

    // Check for suspicious patterns that suggest correlation
    const sortedLikelihoods = [...likelihoods].sort((a, b) => a - b);
    const sortedUncertainties = [...uncertainties].sort((a, b) => a - b);

    // High correlation between likelihood values and uncertainties suggests dependence
    const correlation = this.computeCorrelation(sortedLikelihoods, sortedUncertainties);
    
    // If correlation is too high (> 0.8), likely not independent
    return Math.abs(correlation) < 0.8;
  }

  /**
   * Compute correlation coefficient
   */
  private computeCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Compute collapse strength
   */
  private computeCollapseStrength(
    prior: number,
    likelihoods: number[],
    uncertainties: number[]
  ): number {
    // Strength is product of supportive likelihoods weighted by uncertainty
    const supportiveLikelihoods = likelihoods.filter(L => L > this.SUPPORTIVE_THRESHOLD);
    const supportiveUncertainties = uncertainties.slice(0, supportiveLikelihoods.length);

    if (supportiveLikelihoods.length === 0) return 0.0;

    // Weight by inverse uncertainty (lower uncertainty = higher weight)
    const weights = supportiveUncertainties.map(u => 1.0 / (u + 0.001));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    const weightedLikelihoods = supportiveLikelihoods.map((L, i) => 
      L * (weights[i] / totalWeight)
    );

    const geometricMean = weightedLikelihoods.reduce((prod, L) => prod * L, 1.0) ** (1.0 / weightedLikelihoods.length);

    // Normalize by prior to see relative improvement
    return Math.min(10.0, geometricMean / Math.max(prior, 0.001));
  }

  /**
   * Classify confidence level
   */
  private classifyConfidenceLevel(
    collapseDetected: boolean,
    isSupportive: boolean,
    significantReduction: boolean,
    convergenceScore: number,
    collapseStrength: number
  ): CollapseResult['confidence_level'] {
    if (collapseDetected && collapseStrength > 5.0) {
      return 'COLLAPSED';
    } else if (collapseDetected && collapseStrength > 2.0) {
      return 'HIGH';
    } else if (isSupportive && significantReduction && convergenceScore > 0.6) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  /**
   * Analyze collapse patterns for debugging
   */
  analyzeCollapsePattern(
    likelihoods: number[],
    uncertainties: number[]
  ): {
    pattern: 'CONVERGENT' | 'DIVERGENT' | 'MIXED' | 'INSUFFICIENT_DATA';
    dominantEvidence: number[];
    weakEvidence: number[];
    recommendations: string[];
  } {
    if (likelihoods.length < 2) {
      return {
        pattern: 'INSUFFICIENT_DATA',
        dominantEvidence: [],
        weakEvidence: [],
        recommendations: ['Need more evidence types for collapse detection']
      };
    }

    const supportiveIndices = likelihoods
      .map((L, i) => ({ value: L, index: i }))
      .filter(item => item.value > this.SUPPORTIVE_THRESHOLD)
      .map(item => item.index);

    const weakIndices = likelihoods
      .map((L, i) => ({ value: L, index: i }))
      .filter(item => item.value <= this.SUPPORTIVE_THRESHOLD)
      .map(item => item.index);

    const convergenceScore = this.computeConvergenceScore(likelihoods);
    
    let pattern: CollapsePattern;
    if (convergenceScore > 0.8 && supportiveIndices.length >= 2) {
      pattern = 'CONVERGENT';
    } else if (convergenceScore < 0.3) {
      pattern = 'DIVERGENT';
    } else {
      pattern = 'MIXED';
    }

    const recommendations = this.generateRecommendations(
      pattern,
      supportiveIndices.length,
      weakIndices.length,
      convergenceScore
    );

    return {
      pattern,
      dominantEvidence: supportiveIndices,
      weakEvidence: weakIndices,
      recommendations
    };
  }

  private generateRecommendations(
    pattern: CollapsePattern,
    supportiveCount: number,
    weakCount: number,
    convergenceScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (pattern === 'CONVERGENT') {
      recommendations.push('Strong convergence detected - consider drilling justification');
      recommendations.push('Validate geological constraints before proceeding');
    } else if (pattern === 'DIVERGENT') {
      recommendations.push('Evidence is contradictory - seek additional data');
      recommendations.push('Review data quality and processing methods');
    } else if (pattern === 'MIXED') {
      recommendations.push('Mixed evidence - prioritize high-quality data sources');
      if (supportiveCount < 2) {
        recommendations.push('Need more supportive evidence for collapse');
      }
    }

    if (convergenceScore < 0.5) {
      recommendations.push('Low convergence - check for data processing errors');
    }

    return recommendations;
  }
}

type CollapsePattern = 'CONVERGENT' | 'DIVERGENT' | 'MIXED' | 'INSUFFICIENT_DATA';