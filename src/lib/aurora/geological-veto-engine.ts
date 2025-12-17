/**
 * Geological Veto Engine for Aurora System
 * Implements absolute rejection layer per specification
 * Rejects targets when geology is impossible
 */

export interface VetoCondition {
  name: string;
  category: 'stratigraphic' | 'temporal' | 'structural' | 'preservation';
  description: string;
  check: (target: any) => VetoConditionResult;
  severity: 'critical' | 'major' | 'minor';
  confidence_required: number; // 0-1
}

export interface VetoConditionResult {
  passed: boolean;
  details: string;
  certainty: number; // 0-1
  evidence: string[];
  recommendation?: string;
}

export interface CategoryResult {
  passed: boolean;
  failed_condition?: string;
  failure_reason: string;
  all_results: VetoConditionResult[];
}

export interface VetoResult {
  passed: boolean;
  probability: number; // 0 if veto failed, 1 if passed
  failure_category?: string;
  failure_condition?: string;
  failure_reason?: string;
  audit_trail: CategoryResult[];
  timestamp: Date;
  total_checks: number;
  passed_checks: number;
  failed_checks: number;
}

export interface Target {
  id: string;
  commodity: string;
  location: {
    longitude: number;
    latitude: number;
  };
  geological_context: {
    tectonic_setting: string;
    age: string;
    stratigraphy: {
      reservoir_unit?: string;
      seal_unit?: string;
      facies: string;
      thickness: number;
    };
    structure: {
      trap_type?: string;
      closure: number;
      fault_seal?: boolean;
      basin_seal?: boolean;
    };
    preservation: {
      uplift_level: string;
      erosion_level: string;
      metamorphic_grade: string;
      weathering: string;
    };
  };
  evidence: {
    chemical: any[];
    structural: any[];
    physical: any[];
    seismic: any[];
  };
}

export class GeologicalVetoEngine {
  private readonly VETO_TAXONOMY = {
    stratigraphic: [
      'no_reservoir_unit',
      'wrong_facies',
      'missing_seal',
      'eroded_sequence',
      'incompatible_depositional_environment'
    ],
    temporal: [
      'timing_mismatch',
      'charge_after_trap',
      'breach_before_preservation',
      'age_incompatible_with_commodity'
    ],
    structural: [
      'basin_unsealed',
      'fault_breach',
      'no_closure',
      'incompatible_structural_style',
      'trap_destroyed'
    ],
    preservation: [
      'uplifted_eroded',
      'metamorphosed',
      'weathered_destroyed',
      'exhumed',
      'thermally_overmature'
    ]
  };

  private readonly vetoConditions: VetoCondition[] = [
    // Stratigraphic veto conditions
    {
      name: 'no_reservoir_unit',
      category: 'stratigraphic',
      description: 'No viable reservoir unit present in stratigraphic column',
      check: (target) => this.checkNoReservoirUnit(target),
      severity: 'critical',
      confidence_required: 0.8
    },
    {
      name: 'wrong_facies',
      category: 'stratigraphic',
      description: 'Depositional facies incompatible with commodity',
      check: (target) => this.checkWrongFacies(target),
      severity: 'major',
      confidence_required: 0.7
    },
    {
      name: 'missing_seal',
      category: 'stratigraphic',
      description: 'No effective seal unit present',
      check: (target) => this.checkMissingSeal(target),
      severity: 'critical',
      confidence_required: 0.8
    },
    {
      name: 'eroded_sequence',
      category: 'stratigraphic',
      description: 'Target sequence eroded away',
      check: (target) => this.checkErodedSequence(target),
      severity: 'critical',
      confidence_required: 0.9
    },

    // Temporal veto conditions
    {
      name: 'timing_mismatch',
      category: 'temporal',
      description: 'Timing of mineralization incompatible with trap formation',
      check: (target) => this.checkTimingMismatch(target),
      severity: 'major',
      confidence_required: 0.7
    },
    {
      name: 'charge_after_trap',
      category: 'temporal',
      description: 'Mineralization occurred after trap was breached',
      check: (target) => this.checkChargeAfterTrap(target),
      severity: 'critical',
      confidence_required: 0.8
    },
    {
      name: 'age_incompatible_with_commodity',
      category: 'temporal',
      description: 'Geological age incompatible with commodity formation',
      check: (target) => this.checkAgeIncompatible(target),
      severity: 'critical',
      confidence_required: 0.8
    },

    // Structural veto conditions
    {
      name: 'basin_unsealed',
      category: 'structural',
      description: 'Structural basin is not sealed',
      check: (target) => this.checkBasinUnsealed(target),
      severity: 'critical',
      confidence_required: 0.8
    },
    {
      name: 'fault_breach',
      category: 'structural',
      description: 'Faults have breached the trap',
      check: (target) => this.checkFaultBreach(target),
      severity: 'critical',
      confidence_required: 0.7
    },
    {
      name: 'no_closure',
      category: 'structural',
      description: 'No structural closure present',
      check: (target) => this.checkNoClosure(target),
      severity: 'critical',
      confidence_required: 0.8
    },
    {
      name: 'trap_destroyed',
      category: 'structural',
      description: 'Trap has been destroyed by deformation',
      check: (target) => this.checkTrapDestroyed(target),
      severity: 'critical',
      confidence_required: 0.8
    },

    // Preservation veto conditions
    {
      name: 'uplifted_eroded',
      category: 'preservation',
      description: 'Target has been uplifted and eroded',
      check: (target) => this.checkUpliftedEroded(target),
      severity: 'critical',
      confidence_required: 0.9
    },
    {
      name: 'metamorphosed',
      category: 'preservation',
      description: 'Target has been metamorphosed beyond preservation',
      check: (target) => this.checkMetamorphosed(target),
      severity: 'critical',
      confidence_required: 0.8
    },
    {
      name: 'weathered_destroyed',
      category: 'preservation',
      description: 'Target destroyed by weathering processes',
      check: (target) => this.checkWeatheredDestroyed(target),
      severity: 'major',
      confidence_required: 0.7
    },
    {
      name: 'thermally_overmature',
      category: 'preservation',
      description: 'Target thermally overmature for preservation',
      check: (target) => this.checkThermallyOvermature(target),
      severity: 'critical',
      confidence_required: 0.8
    }
  ];

  /**
   * Evaluates ALL veto conditions
   * Returns probability=0 if ANY veto fails
   */
  async evaluateVeto(target: Target): Promise<VetoResult> {
    const auditTrail: CategoryResult[] = [];
    let totalChecks = 0;
    let passedChecks = 0;
    let failedChecks = 0;

    // Check each veto category
    for (const [category, conditions] of Object.entries(this.VETO_TAXONOMY)) {
      const categoryResult = await this.evaluateCategory(
        category as VetoCondition['category'],
        conditions,
        target
      );
      
      auditTrail.push(categoryResult);
      
      // Count checks
      totalChecks += categoryResult.all_results.length;
      passedChecks += categoryResult.all_results.filter(r => r.passed).length;
      failedChecks += categoryResult.all_results.filter(r => !r.passed).length;

      // Immediate failure if any category fails
      if (!categoryResult.passed) {
        return {
          passed: false,
          probability: 0.0,
          failure_category: category,
          failure_condition: categoryResult.failed_condition,
          failure_reason: categoryResult.failure_reason,
          audit_trail: auditTrail,
          timestamp: new Date(),
          total_checks: totalChecks,
          passed_checks: passedChecks,
          failed_checks: failedChecks
        };
      }
    }

    // All checks passed
    return {
      passed: true,
      probability: 1.0, // Multiplicative identity for Bayesian fusion
      audit_trail: auditTrail,
      timestamp: new Date(),
      total_checks: totalChecks,
      passed_checks: passedChecks,
      failed_checks: failedChecks
    };
  }

  /**
   * Evaluates all conditions in a veto category
   */
  private async evaluateCategory(
    category: VetoCondition['category'],
    conditions: string[],
    target: Target
  ): Promise<CategoryResult> {
    const conditionResults: VetoConditionResult[] = [];

    for (const conditionName of conditions) {
      const condition = this.vetoConditions.find(c => c.name === conditionName);
      if (condition) {
        const result = condition.check(target);
        conditionResults.push({
          ...result,
          evidence: this.getEvidenceForCondition(conditionName, target)
        });

        // Immediate fail if any condition fails
        if (!result.passed && result.certainty >= condition.confidence_required) {
          return {
            passed: false,
            failed_condition: conditionName,
            failure_reason: result.details,
            all_results: conditionResults
          };
        }
      }
    }

    return {
      passed: true,
      all_results: conditionResults
    };
  }

  // Stratigraphic veto condition implementations
  private checkNoReservoirUnit(target: Target): VetoConditionResult {
    const hasReservoir = !!target.geological_context.stratigraphy.reservoir_unit;
    const facies = target.geological_context.stratigraphy.facies;
    
    // Commodity-specific reservoir requirements
    const reservoirFacies: Record<string, string[]> = {
      copper_porphyry: ['intrusive', 'volcanic', 'plutonic'],
      lithium_brine: ['evaporite', 'lacustrine', 'playa'],
      hydrocarbon_onshore: ['sandstone', 'limestone', 'dolomite'],
      hydrocarbon_offshore: ['sandstone', 'limestone', 'chalk']
    };

    const compatibleFacies = reservoirFacies[target.commodity] || [];
    const faciesCompatible = compatibleFacies.some(f => facies.toLowerCase().includes(f));

    const passed = hasReservoir && faciesCompatible;
    
    return {
      passed,
      details: passed 
        ? `Viable reservoir unit identified: ${target.geological_context.stratigraphy.reservoir_unit}`
        : `No viable reservoir unit for ${target.commodity}. Facies: ${facies}`,
      certainty: 0.9
    };
  }

  private checkWrongFacies(target: Target): VetoConditionResult {
    const facies = target.geological_context.stratigraphy.facies;
    
    // Incompatible facies for each commodity
    const incompatibleFacies: Record<string, string[]> = {
      copper_porphyry: ['deep_marine', 'pelagic', 'aeolian'],
      lithium_brine: ['volcanic', 'metamorphic', 'igneous'],
      hydrocarbon_onshore: ['volcanic', 'metamorphic', 'high_energy_clastic'],
      hydrocarbon_offshore: ['continental', 'fluvial', 'aeolian']
    };

    const incompatible = incompatibleFacies[target.commodity] || [];
    const isIncompatible = incompatible.some(f => facies.toLowerCase().includes(f));

    return {
      passed: !isIncompatible,
      details: isIncompatible
        ? `Facies ${facies} incompatible with ${target.commodity}`
        : `Facies ${facies} compatible with ${target.commodity}`,
      certainty: 0.8
    };
  }

  private checkMissingSeal(target: Target): VetoConditionResult {
    const hasSeal = !!target.geological_context.stratigraphy.seal_unit;
    
    // Some commodities don't require seals
    const noSealRequired = ['copper_porphyry'];
    const sealRequired = !noSealRequired.includes(target.commodity);

    const passed = !sealRequired || hasSeal;
    
    return {
      passed,
      details: passed
        ? sealRequired 
          ? `Effective seal present: ${target.geological_context.stratigraphy.seal_unit}`
          : `Seal not required for ${target.commodity}`
        : `No seal unit present for ${target.commodity}`,
      certainty: 0.85
    };
  }

  private checkErodedSequence(target: Target): VetoConditionResult {
    const erosionLevel = target.geological_context.preservation.erosion_level;
    const thickness = target.geological_context.stratigraphy.thickness;

    // High erosion removes target
    const severelyEroded = ['severe', 'complete', 'extreme'].includes(erosionLevel.toLowerCase());
    const insufficientThickness = thickness < 50; // meters

    const passed = !severelyEroded && !insufficientThickness;
    
    return {
      passed,
      details: passed
        ? `Target sequence preserved. Thickness: ${thickness}m, Erosion: ${erosionLevel}`
        : `Target sequence eroded. Erosion: ${erosionLevel}, Remaining thickness: ${thickness}m`,
      certainty: 0.9
    };
  }

  // Temporal veto condition implementations
  private checkTimingMismatch(target: Target): VetoConditionResult {
    const age = target.geological_context.age;
    const ageMa = this.parseAge(age);
    
    // Age ranges for different commodities
    const ageRanges: Record<string, [number, number]> = {
      copper_porphyry: [1, 100], // Cenozoic to Mesozoic
      lithium_brine: [0, 10], // Very recent
      hydrocarbon_onshore: [50, 500], // Mesozoic to Paleozoic
      hydrocarbon_offshore: [10, 200] // Cenozoic to Mesozoic
    };

    const [minAge, maxAge] = ageRanges[target.commodity] || [0, 1000];
    const timingCompatible = ageMa >= minAge && ageMa <= maxAge;

    return {
      passed: timingCompatible,
      details: timingCompatible
        ? `Age ${ageMa} Ma compatible with ${target.commodity}`
        : `Age ${ageMa} Ma incompatible with ${target.commodity} (requires ${minAge}-${maxAge} Ma)`,
      certainty: 0.8
    };
  }

  private checkChargeAfterTrap(target: Target): VetoConditionResult {
    // Simplified check - in reality would use detailed timing data
    const structuralAge = this.parseAge(target.geological_context.age);
    const mineralizationAge = structuralAge - 5; // Assume mineralization 5 Ma after structure

    const chargeAfterTrap = mineralizationAge > structuralAge;
    
    return {
      passed: !chargeAfterTrap,
      details: chargeAfterTrap
        ? `Mineralization occurred after trap formation`
        : `Mineralization timing compatible with trap formation`,
      certainty: 0.7
    };
  }

  private checkAgeIncompatible(target: Target): VetoConditionResult {
    return this.checkTimingMismatch(target); // Same logic
  }

  // Structural veto condition implementations
  private checkBasinUnsealed(target: Target): VetoConditionResult {
    const basinSeal = target.geological_context.structure.basin_seal;
    const closure = target.geological_context.structure.closure;

    const passed = basinSeal !== false && closure > 10; // Minimum 10m closure
    
    return {
      passed,
      details: passed
        ? `Basin sealed with ${closure}m closure`
        : `Basin unsealed or insufficient closure (${closure}m)`,
      certainty: 0.8
    };
  }

  private checkFaultBreach(target: Target): VetoConditionResult {
    const faultSeal = target.geological_context.structure.fault_seal;
    
    const passed = faultSeal !== false;
    
    return {
      passed,
      details: passed
        ? `Faults are sealed or absent`
        : `Faults have breached the trap`,
      certainty: 0.7
    };
  }

  private checkNoClosure(target: Target): VetoConditionResult {
    const closure = target.geological_context.structure.closure;
    const trapType = target.geological_context.structure.trap_type;

    const hasStructuralClosure = closure > 5; // Minimum 5m
    const hasStratigraphicTrap = ['stratigraphic', 'combination', 'unconformity'].includes(trapType || '');

    const passed = hasStructuralClosure || hasStratigraphicTrap;
    
    return {
      passed,
      details: passed
        ? `Trap closure present: ${closure}m (${trapType})`
        : `No viable trap closure identified`,
      certainty: 0.8
    };
  }

  private checkTrapDestroyed(target: Target): VetoConditionResult {
    // Check if trap has been destroyed by later deformation
    const tectonicSetting = target.geological_context.tectonic_setting;
    const destructiveSettings = ['collisional', 'orogenic', 'compressional'];
    
    const destroyed = destructiveSettings.includes(tectonicSetting.toLowerCase());
    
    return {
      passed: !destroyed,
      details: destroyed
        ? `Trap likely destroyed by ${tectonicSetting} tectonics`
        : `Trap preserved in current tectonic setting`,
      certainty: 0.7
    };
  }

  // Preservation veto condition implementations
  private checkUpliftedEroded(target: Target): VetoConditionResult {
    const upliftLevel = target.geological_context.preservation.uplift_level;
    const erosionLevel = target.geological_context.preservation.erosion_level;

    const severelyUplifted = ['high', 'extreme', 'major'].includes(upliftLevel.toLowerCase());
    const severelyEroded = ['severe', 'complete', 'extreme'].includes(erosionLevel.toLowerCase());

    const passed = !severelyUplifted && !severelyEroded;
    
    return {
      passed,
      details: passed
        ? `Target preserved. Uplift: ${upliftLevel}, Erosion: ${erosionLevel}`
        : `Target destroyed by uplift/erosion. Uplift: ${upliftLevel}, Erosion: ${erosionLevel}`,
      certainty: 0.9
    };
  }

  private checkMetamorphosed(target: Target): VetoConditionResult {
    const metamorphicGrade = target.geological_context.preservation.metamorphic_grade;
    
    // High metamorphic grades destroy most deposits
    const highGrade = ['amphibolite', 'granulite', 'eclogite', 'high-grade'].includes(
      metamorphicGrade.toLowerCase()
    );

    const passed = !highGrade;
    
    return {
      passed,
      details: passed
        ? `Metamorphic grade suitable: ${metamorphicGrade}`
        : `Target over-metamorphosed: ${metamorphicGrade}`,
      certainty: 0.8
    };
  }

  private checkWeatheredDestroyed(target: Target): VetoConditionResult {
    const weathering = target.geological_context.preservation.weathering;
    
    const severeWeathering = ['severe', 'intense', 'extreme', 'deep'].includes(
      weathering.toLowerCase()
    );

    const passed = !severeWeathering;
    
    return {
      passed,
      details: passed
        ? `Weathering level acceptable: ${weathering}`
        : `Target destroyed by weathering: ${weathering}`,
      certainty: 0.7
    };
  }

  private checkThermallyOvermature(target: Target): VetoConditionResult {
    // Simplified thermal maturity check
    const age = this.parseAge(target.geological_context.age);
    const tectonicSetting = target.geological_context.tectonic_setting;
    
    // Young ages in active settings may be thermally immature
    // Old ages in orogenic settings may be overmature
    const thermallyUnsuitable = (age < 10 && ['arc', 'rift'].includes(tectonicSetting)) ||
                               (age > 500 && ['collisional', 'orogenic'].includes(tectonicSetting));

    const passed = !thermallyUnsuitable;
    
    return {
      passed,
      details: passed
        ? `Thermal maturity suitable for preservation`
        : `Target thermally overmature or immature`,
      certainty: 0.7
    };
  }

  // Helper methods
  private getEvidenceForCondition(conditionName: string, target: Target): string[] {
    // Mock evidence - in reality would pull from geological database
    return [
      'regional geological maps',
      'stratigraphic columns',
      'structural cross-sections',
      'geochronology data',
      'thermal history models'
    ];
  }

  private parseAge(age: string): number {
    const match = age.match(/(\d+(?:\.\d+)?)\s*Ma/i);
    return match ? parseFloat(match[1]) : 100;
  }

  /**
   * Get veto taxonomy for reference
   */
  getVetoTaxonomy(): typeof this.VETO_TAXONOMY {
    return this.VETO_TAXONOMY;
  }

  /**
   * Get all veto conditions
   */
  getVetoConditions(): VetoCondition[] {
    return this.vetoConditions;
  }

  /**
   * Check specific veto condition
   */
  async checkSpecificCondition(conditionName: string, target: Target): Promise<VetoConditionResult> {
    const condition = this.vetoConditions.find(c => c.name === conditionName);
    if (!condition) {
      throw new Error(`Veto condition '${conditionName}' not found`);
    }
    
    const result = condition.check(target);
    return {
      ...result,
      evidence: this.getEvidenceForCondition(conditionName, target)
    };
  }
}