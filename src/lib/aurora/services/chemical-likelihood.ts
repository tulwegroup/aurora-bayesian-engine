/**
 * Chemical Likelihood Service for Aurora System
 * Uses spectral unmixing (N-FINDR, MESMA) not just CNNs
 * Computes P(E_chem|D) = Π_k P(M_k|D) where M_k are diagnostic minerals
 */

export interface SpectralUnmixingResult {
  endmember_abundances: Record<string, number>;
  endmember_spectra: Record<string, number[]>;
  rmse: number; // Root mean square error
  uncertainty: number;
  method: 'NFINDR' | 'MESMA' | 'PPU';
  confidence: number;
}

export interface MineralDetection {
  mineral_id: string;
  abundance: number; // 0-1
  confidence: number; // 0-1
  spectral_fit_rmse: number;
  band_depths: Record<string, number>; // Diagnostic band depths
  uncertainty_type: 'gaussian' | 'uniform' | 'poisson';
  uncertainty_params: Record<string, any>;
}

export interface AlterationAssemblage {
  assemblage_id: string;
  alteration_type: 'potassic' | 'phyllic' | 'argillic' | 'propylitic' | 'sericitic';
  minerals: string[];
  confidence: number;
  spatial_extent: number; // km²
  zoning_pattern: 'concentric' | 'linear' | 'random' | 'none';
  intensity: 'low' | 'moderate' | 'high';
}

export interface ChemicalLikelihoodResult {
  likelihood: number;
  uncertainty: number;
  confidence_interval: [number, number];
  mineral_detections: MineralDetection[];
  alteration_assemblages: AlterationAssemblage[];
  spectral_quality: {
    signal_to_noise: number;
    atmospheric_correction: number;
    cloud_cover: number;
    overall_quality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  formula: string;
  reasoning: string[];
  commodity_specific: {
    diagnostic_minerals_present: string[];
    required_assemblages_present: string[];
    kill_factors_triggered: string[];
  };
}

export class ChemicalLikelihoodService {
  private readonly DIAGNOSTIC_MINERALS: Record<string, string[]> = {
    copper_porphyry: [
      'chrysocolla', 'malachite', 'azurite', 'bornite', 'chalcopyrite',
      'K-feldspar', 'biotite', 'magnetite', 'sericite', 'pyrite'
    ],
    lithium_brine: [
      'lithium-bearing_clays', 'hectorite', 'smectite', 'illite',
      'halite', 'gypsum', 'borates', 'evaporite_minerals'
    ],
    hydrocarbon_onshore: [
      'hydrocarbon_seepage', 'oil_stains', 'bitumen', 'gilsonite',
      'hydroxyl-bearing_minerals', 'clay_minerals'
    ],
    hydrocarbon_offshore: [
      'hydrocarbon_seepage', 'oil_stains', 'gas_seeps',
      'hydrocarbon_induced_minerals', 'authigenic_carbonates'
    ]
  };

  private readonly ALTERATION_ZONING: Record<string, string[]> = {
    copper_porphyry: [
      'potassic_core', 'phyllic_shell', 'argillic_outer', 'propylitic_distal'
    ],
    lithium_brine: [
      'evaporite_core', 'clay_rich_zone', 'carbonate_rim', 'oxidized_surface'
    ]
  };

  /**
   * Compute chemical likelihood from hyperspectral data
   */
  async computeChemicalLikelihood(
    hyperspectralData: any[],
    commodity: string,
    location: { longitude: number; latitude: number }
  ): Promise<ChemicalLikelihoodResult> {
    // 1. Perform spectral unmixing
    const unmixingResults = await this.performSpectralUnmixing(hyperspectralData);

    // 2. Detect diagnostic minerals
    const mineralDetections = await this.detectDiagnosticMinerals(
      unmixingResults,
      commodity
    );

    // 3. Identify alteration assemblages
    const alterationAssemblages = await this.identifyAlterationAssemblages(
      mineralDetections,
      commodity
    );

    // 4. Assess spectral data quality
    const spectralQuality = await this.assessSpectralQuality(hyperspectralData);

    // 5. Compute likelihood using Bayesian formulation
    const likelihood = this.computeMineralLikelihood(mineralDetections, commodity);

    // 6. Propagate uncertainty
    const uncertainty = this.propagateChemicalUncertainty(
      mineralDetections,
      unmixingResults,
      spectralQuality
    );

    // 7. Generate reasoning
    const reasoning = this.generateChemicalReasoning(
      mineralDetections,
      alterationAssemblages,
      likelihood,
      commodity
    );

    // 8. Compute confidence interval
    const confidenceInterval = this.computeConfidenceInterval(likelihood, uncertainty);

    // 9. Commodity-specific analysis
    const commoditySpecific = this.analyzeCommoditySpecific(
      mineralDetections,
      alterationAssemblages,
      commodity
    );

    return {
      likelihood,
      uncertainty,
      confidence_interval: confidenceInterval,
      mineral_detections: mineralDetections,
      alteration_assemblages: alterationAssemblages,
      spectral_quality: spectralQuality,
      formula: "P(E_chem|D) = Π_k P(M_k|D)",
      reasoning,
      commodity_specific: commoditySpecific
    };
  }

  /**
   * Perform spectral unmixing using multiple methods
   */
  private async performSpectralUnmixing(
    hyperspectralData: any[]
  ): Promise<SpectralUnmixingResult[]> {
    const results: SpectralUnmixingResult[] = [];

    for (const data of hyperspectralData) {
      // Mock implementation - in reality would use actual spectral libraries
      const endmembers = this.getEndmemberLibrary(data.wavelength_range);
      
      // N-FINDR method
      const nfindrResult = this.applyNFINDR(data.spectra, endmembers);
      
      // MESMA method (Multiple Endmember Spectral Mixture Analysis)
      const mesmaResult = this.applyMESMA(data.spectra, endmembers);
      
      // Choose best result based on RMSE
      const bestResult = nfindrResult.rmse < mesmaResult.rmse ? nfindrResult : mesmaResult;
      
      results.push(bestResult);
    }

    return results;
  }

  /**
   * Detect diagnostic minerals from unmixing results
   */
  private async detectDiagnosticMinerals(
    unmixingResults: SpectralUnmixingResult[],
    commodity: string
  ): Promise<MineralDetection[]> {
    const diagnosticMinerals = this.DIAGNOSTIC_MINERALS[commodity] || [];
    const detections: MineralDetection[] = [];

    for (const result of unmixingResults) {
      for (const [mineral, abundance] of Object.entries(result.endmember_abundances)) {
        if (diagnosticMinerals.includes(mineral) && abundance > 0.05) { // 5% threshold
          const detection: MineralDetection = {
            mineral_id: mineral,
            abundance,
            confidence: this.computeMineralConfidence(abundance, result.rmse),
            spectral_fit_rmse: result.rmse,
            band_depths: this.computeBandDepths(mineral, result.endmember_spectra[mineral]),
            uncertainty_type: 'gaussian',
            uncertainty_params: {
              sigma: Math.max(0.01, abundance * 0.1),
              correlation_with_abundance: -0.7
            }
          };
          detections.push(detection);
        }
      }
    }

    return detections;
  }

  /**
   * Identify alteration assemblages from mineral detections
   */
  private async identifyAlterationAssemblages(
    mineralDetections: MineralDetection[],
    commodity: string
  ): Promise<AlterationAssemblage[]> {
    const assemblages: AlterationAssemblage[] = [];

    // Define assemblage rules
    const assemblageRules: Record<string, {
      minerals: string[];
      alteration_type: AlterationAssemblage['alteration_type'];
      required_minerals: string[];
      optional_minerals: string[];
    }> = {
      copper_porphyry: {
        minerals: ['K-feldspar', 'biotite', 'magnetite'],
        alteration_type: 'potassic',
        required_minerals: ['K-feldspar'],
        optional_minerals: ['biotite', 'magnetite']
      },
      phyllic: {
        minerals: ['sericite', 'pyrite', 'quartz'],
        alteration_type: 'phyllic',
        required_minerals: ['sericite'],
        optional_minerals: ['pyrite', 'quartz']
      },
      argillic: {
        minerals: ['kaolinite', 'montmorillonite', 'illite'],
        alteration_type: 'argillic',
        required_minerals: ['kaolinite'],
        optional_minerals: ['montmorillonite', 'illite']
      },
      propylitic: {
        minerals: ['chlorite', 'epidote', 'calcite'],
        alteration_type: 'propylitic',
        required_minerals: ['chlorite'],
        optional_minerals: ['epidote', 'calcite']
      }
    };

    for (const [assemblageId, rule] of Object.entries(assemblageRules)) {
      const presentMinerals = mineralDetections
        .filter(d => rule.minerals.includes(d.mineral_id))
        .map(d => d.mineral_id);

      const hasRequired = rule.required_minerals.every(m => presentMinerals.includes(m));
      
      if (hasRequired) {
        const confidence = this.computeAssemblageConfidence(
          presentMinerals,
          rule.required_minerals,
          rule.optional_minerals,
          mineralDetections
        );

        const assemblage: AlterationAssemblage = {
          assemblage_id: assemblageId,
          alteration_type: rule.alteration_type,
          minerals: presentMinerals,
          confidence,
          spatial_extent: this.estimateSpatialExtent(mineralDetections, presentMinerals),
          zoning_pattern: this.determineZoningPattern(presentMinerals, commodity),
          intensity: this.classifyAlterationIntensity(confidence)
        };

        assemblages.push(assemblage);
      }
    }

    return assemblages;
  }

  /**
   * Compute mineral likelihood using Bayesian formulation
   */
  private computeMineralLikelihood(
    mineralDetections: MineralDetection[],
    commodity: string
  ): number {
    const diagnosticMinerals = this.DIAGNOSTIC_MINERALS[commodity] || [];
    
    if (mineralDetections.length === 0) {
      return 0.1; // Low likelihood for no detections
    }

    // Product of individual mineral probabilities
    let likelihoodProduct = 1.0;
    
    for (const detection of mineralDetections) {
      if (diagnosticMinerals.includes(detection.mineral_id)) {
        // P(M_k|D) based on abundance and confidence
        const mineralProbability = detection.abundance * detection.confidence;
        likelihoodProduct *= Math.max(0.1, mineralProbability);
      }
    }

    // Normalize by number of diagnostic minerals expected
    const expectedMinerals = diagnosticMinerals.length;
    const detectedMinerals = mineralDetections.filter(d => 
      diagnosticMinerals.includes(d.mineral_id)
    ).length;

    const coverageFactor = detectedMinerals / expectedMinerals;
    
    return Math.min(5.0, likelihoodProduct * (1 + coverageFactor));
  }

  /**
   * Propagate uncertainty from multiple sources
   */
  private propagateChemicalUncertainty(
    mineralDetections: MineralDetection[],
    unmixingResults: SpectralUnmixingResult[],
    spectralQuality: any
  ): number {
    // Uncertainty from mineral detections
    const mineralUncertainty = mineralDetections.length > 0
      ? mineralDetections.reduce((sum, d) => sum + d.abundance * 0.1, 0) / mineralDetections.length
      : 0.5;

    // Uncertainty from spectral unmixing
    const unmixingUncertainty = unmixingResults.length > 0
      ? unmixingResults.reduce((sum, r) => sum + r.rmse, 0) / unmixingResults.length
      : 0.3;

    // Uncertainty from data quality
    const qualityUncertainty = this.getQualityUncertainty(spectralQuality.overall_quality);

    // Combined uncertainty (root sum of squares)
    return Math.sqrt(
      Math.pow(mineralUncertainty, 2) + 
      Math.pow(unmixingUncertainty, 2) + 
      Math.pow(qualityUncertainty, 2)
    );
  }

  /**
   * Generate reasoning for chemical likelihood
   */
  private generateChemicalReasoning(
    mineralDetections: MineralDetection[],
    alterationAssemblages: AlterationAssemblage[],
    likelihood: number,
    commodity: string
  ): string[] {
    const reasoning: string[] = [];

    // Diagnostic mineral analysis
    const diagnosticMinerals = mineralDetections.filter(d => 
      this.DIAGNOSTIC_MINERALS[commodity]?.includes(d.mineral_id)
    );

    if (diagnosticMinerals.length > 3) {
      reasoning.push(`Strong mineralogical evidence: ${diagnosticMinerals.length} diagnostic minerals detected`);
    } else if (diagnosticMinerals.length > 1) {
      reasoning.push(`Moderate mineralogical evidence: ${diagnosticMinerals.length} diagnostic minerals detected`);
    } else if (diagnosticMinerals.length === 1) {
      reasoning.push(`Limited mineralogical evidence: only ${diagnosticMinerals[0].mineral_id} detected`);
    } else {
      reasoning.push(`No diagnostic minerals detected for ${commodity}`);
    }

    // Alteration assemblage analysis
    if (alterationAssemblages.length > 0) {
      const highConfidenceAssemblages = alterationAssemblages.filter(a => a.confidence > 0.7);
      if (highConfidenceAssemblages.length > 0) {
        reasoning.push(`Well-defined alteration zoning: ${highConfidenceAssemblages.map(a => a.alteration_type).join(', ')}`);
      } else {
        reasoning.push(`Weak alteration signatures detected`);
      }
    } else {
      reasoning.push(`No significant alteration assemblages identified`);
    }

    // Overall assessment
    if (likelihood > 2.0) {
      reasoning.push(`Strong chemical evidence supporting ${commodity} mineralization`);
    } else if (likelihood > 1.0) {
      reasoning.push(`Moderate chemical evidence present`);
    } else if (likelihood > 0.5) {
      reasoning.push(`Limited chemical evidence`);
    } else {
      reasoning.push(`Chemical evidence does not support ${commodity} mineralization`);
    }

    return reasoning;
  }

  /**
   * Analyze commodity-specific factors
   */
  private analyzeCommoditySpecific(
    mineralDetections: MineralDetection[],
    alterationAssemblages: AlterationAssemblage[],
    commodity: string
  ): ChemicalLikelihoodResult['commodity_specific'] {
    const diagnosticMinerals = this.DIAGNOSTIC_MINERALS[commodity] || [];
    const presentMinerals = mineralDetections.map(d => d.mineral_id);
    
    const diagnosticMineralsPresent = presentMinerals.filter(m => 
      diagnosticMinerals.includes(m)
    );

    // Required assemblages depend on commodity
    const requiredAssemblages = this.getRequiredAssemblages(commodity);
    const presentAssemblages = alterationAssemblages.map(a => a.alteration_type);
    const requiredAssemblagesPresent = presentAssemblages.filter(a => 
      requiredAssemblages.includes(a)
    );

    // Kill factors
    const killFactors = this.checkKillFactors(mineralDetections, alterationAssemblages, commodity);

    return {
      diagnostic_minerals_present: diagnosticMineralsPresent,
      required_assemblages_present: requiredAssemblagesPresent,
      kill_factors_triggered: killFactors
    };
  }

  // Helper methods (simplified implementations)
  private getEndmemberLibrary(wavelengthRange: [number, number]): Record<string, number[]> {
    // Mock endmember library - in reality would use USGS spectral library
    return {
      'K-feldspar': Array(200).fill(0).map((_, i) => 0.3 + 0.2 * Math.sin(i / 20)),
      'biotite': Array(200).fill(0).map((_, i) => 0.2 + 0.1 * Math.cos(i / 15)),
      'magnetite': Array(200).fill(0).map((_, i) => 0.1 + 0.05 * Math.sin(i / 10)),
      'sericite': Array(200).fill(0).map((_, i) => 0.25 + 0.15 * Math.cos(i / 25)),
      'pyrite': Array(200).fill(0).map((_, i) => 0.15 + 0.1 * Math.sin(i / 30))
    };
  }

  private applyNFINDR(spectra: number[], endmembers: Record<string, number[]>): SpectralUnmixingResult {
    // Mock N-FINDR implementation
    const abundances: Record<string, number> = {};
    let totalAbundance = 0;

    for (const [mineral, spectrum] of Object.entries(endmembers)) {
      const abundance = Math.random() * 0.5; // Mock abundance
      abundances[mineral] = abundance;
      totalAbundance += abundance;
    }

    // Normalize to sum to 1
    for (const mineral of Object.keys(abundances)) {
      abundances[mineral] /= totalAbundance;
    }

    return {
      endmember_abundances: abundances,
      endmember_spectra: endmembers,
      rmse: 0.02 + Math.random() * 0.03,
      uncertainty: 0.05,
      method: 'NFINDR',
      confidence: 0.8
    };
  }

  private applyMESMA(spectra: number[], endmembers: Record<string, number[]>): SpectralUnmixingResult {
    // Mock MESMA implementation
    return this.applyNFINDR(spectra, endmembers); // Simplified
  }

  private computeMineralConfidence(abundance: number, rmse: number): number {
    return Math.max(0.1, Math.min(1.0, abundance * (1 - rmse) * 2));
  }

  private computeBandDepths(mineral: string, spectrum: number[]): Record<string, number> {
    // Mock band depth calculation
    return {
      'absorption_1': 0.1 + Math.random() * 0.2,
      'absorption_2': 0.05 + Math.random() * 0.15,
      'continuum_slope': -0.01 + Math.random() * 0.02
    };
  }

  private computeAssemblageConfidence(
    presentMinerals: string[],
    requiredMinerals: string[],
    optionalMinerals: string[],
    detections: MineralDetection[]
  ): number {
    const requiredScore = requiredMinerals.every(m => presentMinerals.includes(m)) ? 0.5 : 0;
    const optionalScore = optionalMinerals.filter(m => presentMinerals.includes(m)).length / optionalMinerals.length * 0.3;
    const abundanceScore = detections
      .filter(d => presentMinerals.includes(d.mineral_id))
      .reduce((sum, d) => sum + d.abundance, 0) / presentMinerals.length * 0.2;

    return Math.min(1.0, requiredScore + optionalScore + abundanceScore);
  }

  private estimateSpatialExtent(detections: MineralDetection[], minerals: string[]): number {
    // Mock spatial extent calculation
    return Math.random() * 10 + 1; // km²
  }

  private determineZoningPattern(minerals: string[], commodity: string): AlterationAssemblage['zoning_pattern'] {
    // Simplified zoning pattern detection
    if (minerals.length > 3) return 'concentric';
    if (minerals.length > 1) return 'linear';
    return 'random';
  }

  private classifyAlterationIntensity(confidence: number): AlterationAssemblage['intensity'] {
    if (confidence > 0.8) return 'high';
    if (confidence > 0.5) return 'moderate';
    return 'low';
  }

  private async assessSpectralQuality(hyperspectralData: any[]): Promise<any> {
    // Mock quality assessment
    return {
      signal_to_noise: 50 + Math.random() * 100,
      atmospheric_correction: 0.8 + Math.random() * 0.2,
      cloud_cover: Math.random() * 0.3,
      overall_quality: 'good' as const
    };
  }

  private getQualityUncertainty(quality: string): number {
    const uncertaintyMap: Record<string, number> = {
      'excellent': 0.05,
      'good': 0.1,
      'fair': 0.2,
      'poor': 0.4
    };
    return uncertaintyMap[quality] || 0.3;
  }

  private computeConfidenceInterval(mean: number, uncertainty: number): [number, number] {
    const zScore = 1.96; // 95% confidence
    const lower = Math.max(0, mean - zScore * uncertainty);
    const upper = Math.min(10, mean + zScore * uncertainty); // Upper bound for likelihood
    return [lower, upper];
  }

  private getRequiredAssemblages(commodity: string): string[] {
    const requirements: Record<string, string[]> = {
      copper_porphyry: ['potassic', 'phyllic'],
      lithium_brine: ['evaporite_core']
    };
    return requirements[commodity] || [];
  }

  private checkKillFactors(
    mineralDetections: MineralDetection[],
    alterationAssemblages: AlterationAssemblage[],
    commodity: string
  ): string[] {
    const killFactors: string[] = [];

    // Commodity-specific kill factors
    if (commodity === 'copper_porphyry') {
      const hasPotassic = alterationAssemblages.some(a => a.alteration_type === 'potassic');
      const hasPhyllic = alterationAssemblages.some(a => a.alteration_type === 'phyllic');
      
      if (!hasPotassic && !hasPhyllic) {
        killFactors.push('no_core_alteration');
      }
    }

    if (commodity === 'lithium_brine') {
      const hasEvaporites = mineralDetections.some(d => 
        d.mineral_id.includes('evaporite') || d.mineral_id.includes('halite')
      );
      
      if (!hasEvaporites) {
        killFactors.push('no_evaporite_minerals');
      }
    }

    return killFactors;
  }
}