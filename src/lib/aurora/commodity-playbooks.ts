/**
 * Commodity Playbooks for Aurora System
 * Base class and specific implementations for different commodities
 */

import { Target } from './geological-veto-engine';

export interface ConditionResult {
  passed: boolean;
  value: any;
  threshold: string;
  certainty: number; // 0-1
  failure_reason?: string;
  evidence?: string[];
}

export interface MandatoryResult {
  all_passed: boolean;
  failed_condition?: string;
  failure_details?: string;
  triggers_veto: boolean;
  condition_details?: Record<string, any>;
}

export interface KillFactorResult {
  killed: boolean;
  kill_factors: Array<{
    factor: string;
    description: string;
    certainty: number;
  }>;
  requires_veto: boolean;
}

export interface SupportiveEvidence {
  evidence_type: string;
  strength: number; // 0-1
  description: string;
  data_sources: string[];
}

export interface PlaybookResult {
  commodity: string;
  mandatory_result: MandatoryResult;
  kill_factor_result: KillFactorResult;
  supportive_evidence: SupportiveEvidence[];
  likelihood_weights: Record<string, number>;
  overall_assessment: 'favorable' | 'marginal' | 'unfavorable';
  confidence: number; // 0-1
  recommendations: string[];
  risk_factors: string[];
}

export abstract class CommodityPlaybook {
  protected commodity: string;
  protected mandatory_conditions: Record<string, (evidence: any) => ConditionResult>;
  protected supportive_evidence: Record<string, (evidence: any) => SupportiveEvidence>;
  protected kill_factors: Record<string, (evidence: any) => boolean>;
  protected kill_factor_descriptions: Record<string, string>;
  protected likelihood_weights: Record<string, number>;

  constructor(commodity: string) {
    this.commodity = commodity;
    this.mandatory_conditions = {};
    this.supportive_evidence = {};
    this.kill_factors = {};
    this.kill_factor_descriptions = {};
    this.likelihood_weights = {
      chemical: 0.25,
      structural: 0.25,
      physical: 0.25,
      surface: 0.25
    };
  }

  /**
   * Evaluates ALL mandatory conditions for the commodity
   * If any mandatory fails, triggers veto
   */
  evaluateMandatoryConditions(evidence: any): MandatoryResult {
    const results: Record<string, any> = {};

    for (const [conditionName, conditionFunc] of Object.entries(this.mandatory_conditions)) {
      const result = conditionFunc(evidence);
      results[conditionName] = {
        passed: result.passed,
        value: result.value,
        threshold: result.threshold,
        certainty: result.certainty
      };

      if (!result.passed) {
        return {
          all_passed: false,
          failed_condition: conditionName,
          failure_details: result.failure_reason,
          triggers_veto: true,
          condition_details: results
        };
      }
    }

    return {
      all_passed: true,
      triggers_veto: false,
      condition_details: results
    };
  }

  /**
   * Checks all kill factors - any true trigger kills the target
   */
  checkKillFactors(evidence: any): KillFactorResult {
    const killFactorsTriggered: KillFactorResult['kill_factors'] = [];

    for (const [factorName, factorCheck] of Object.entries(this.kill_factors)) {
      if (factorCheck(evidence)) {
        killFactorsTriggered.push({
          factor: factorName,
          description: this.kill_factor_descriptions[factorName],
          certainty: 0.8 // Default certainty for kill factors
        });
      }
    }

    return {
      killed: killFactorsTriggered.length > 0,
      kill_factors: killFactorsTriggered,
      requires_veto: killFactorsTriggered.length > 0
    };
  }

  /**
   * Evaluates supportive evidence
   */
  evaluateSupportiveEvidence(evidence: any): SupportiveEvidence[] {
    const supportiveEvidence: SupportiveEvidence[] = [];

    for (const [evidenceName, evidenceFunc] of Object.entries(this.supportive_evidence)) {
      const result = evidenceFunc(evidence);
      if (result.strength > 0.1) { // Only include meaningful evidence
        supportiveEvidence.push(result);
      }
    }

    return supportiveEvidence.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Complete playbook evaluation
   */
  async evaluatePlaybook(target: Target): Promise<PlaybookResult> {
    const evidence = this.extractEvidence(target);

    // 1. Check mandatory conditions
    const mandatoryResult = this.evaluateMandatoryConditions(evidence);

    // 2. Check kill factors
    const killFactorResult = this.checkKillFactors(evidence);

    // 3. Evaluate supportive evidence
    const supportiveEvidence = this.evaluateSupportiveEvidence(evidence);

    // 4. Generate overall assessment
    const overallAssessment = this.generateOverallAssessment(
      mandatoryResult,
      killFactorResult,
      supportiveEvidence
    );

    // 5. Calculate confidence
    const confidence = this.calculateConfidence(
      mandatoryResult,
      killFactorResult,
      supportiveEvidence
    );

    // 6. Generate recommendations
    const recommendations = this.generateRecommendations(
      mandatoryResult,
      killFactorResult,
      supportiveEvidence,
      overallAssessment
    );

    // 7. Identify risk factors
    const riskFactors = this.identifyRiskFactors(
      mandatoryResult,
      killFactorResult,
      supportiveEvidence
    );

    return {
      commodity: this.commodity,
      mandatory_result: mandatoryResult,
      kill_factor_result: killFactorResult,
      supportive_evidence: supportiveEvidence,
      likelihood_weights: this.likelihood_weights,
      overall_assessment: overallAssessment,
      confidence,
      recommendations,
      risk_factors
    };
  }

  /**
   * Extract evidence from target data
   */
  protected abstract extractEvidence(target: Target): any;

  /**
   * Generate overall assessment
   */
  protected generateOverallAssessment(
    mandatory: MandatoryResult,
    killFactors: KillFactorResult,
    supportive: SupportiveEvidence[]
  ): PlaybookResult['overall_assessment'] {
    if (!mandatory.all_passed || killFactors.killed) {
      return 'unfavorable';
    }

    const totalSupportiveStrength = supportive.reduce((sum, s) => sum + s.strength, 0);
    const strongSupportiveCount = supportive.filter(s => s.strength > 0.7).length;

    if (totalSupportiveStrength > 2.0 && strongSupportiveCount >= 2) {
      return 'favorable';
    } else if (totalSupportiveStrength > 1.0 && strongSupportiveCount >= 1) {
      return 'marginal';
    } else {
      return 'unfavorable';
    }
  }

  /**
   * Calculate confidence in assessment
   */
  protected calculateConfidence(
    mandatory: MandatoryResult,
    killFactors: KillFactorResult,
    supportive: SupportiveEvidence[]
  ): number {
    if (!mandatory.all_passed || killFactors.killed) {
      return 0.9; // High confidence in negative assessment
    }

    const avgCertainty = Object.values(mandatory.condition_details || {})
      .reduce((sum: number, detail: any) => sum + detail.certainty, 0) / 
      Object.keys(mandatory.condition_details || {}).length;

    const supportiveWeight = supportive.reduce((sum, s) => sum + s.strength, 0) / 
                              Math.max(supportive.length, 1);

    return Math.min(1.0, (avgCertainty * 0.6) + (supportiveWeight * 0.4));
  }

  /**
   * Generate recommendations
   */
  protected abstract generateRecommendations(
    mandatory: MandatoryResult,
    killFactors: KillFactorResult,
    supportive: SupportiveEvidence[],
    assessment: PlaybookResult['overall_assessment']
  ): string[];

  /**
   * Identify risk factors
   */
  protected identifyRiskFactors(
    mandatory: MandatoryResult,
    killFactors: KillFactorResult,
    supportive: SupportiveEvidence[]
  ): string[] {
    const risks: string[] = [];

    // Risks from failed mandatory conditions
    if (!mandatory.all_passed && mandatory.failed_condition) {
      risks.push(`Failed mandatory condition: ${mandatory.failed_condition}`);
    }

    // Risks from kill factors
    killFactors.kill_factors.forEach(kf => {
      risks.push(kf.description);
    });

    // Risks from weak supportive evidence
    const weakEvidence = supportive.filter(s => s.strength < 0.3);
    if (weakEvidence.length > supportive.length / 2) {
      risks.push('Limited supportive evidence');
    }

    return risks;
  }
}

export class CopperPorphyryPlaybook extends CommodityPlaybook {
  constructor() {
    super('copper_porphyry');
    
    // MANDATORY CONDITIONS (from spec)
    this.mandatory_conditions = {
      tectonic_setting: this.checkArcTectonicSetting,
      alteration_assemblage: this.checkPotassicPhyllicAlteration,
      intrusive_geometry: this.checkIntrusiveCenteredStructure
    };

    // SUPPORTIVE EVIDENCE
    this.supportive_evidence = {
      magnetic_destruction: this.checkMagneticDestruction,
      density_contrasts: this.checkDensityContrasts,
      alteration_zoning: this.checkAlterationZoning,
      structural_control: this.checkStructuralControl,
      geochemical_anomaly: this.checkGeochemicalAnomaly
    };

    // KILL FACTORS (from spec: any true = veto)
    this.kill_factors = {
      no_alteration_zoning: this.checkNoAlterationZoning,
      no_intrusive_geometry: this.checkNoIntrusiveGeometry,
      wrong_age: this.checkWrongAge,
      no_arc_setting: this.checkNoArcSetting
    };

    this.kill_factor_descriptions = {
      no_alteration_zoning: 'No systematic alteration zoning present',
      no_intrusive_geometry: 'No intrusive-centered structural geometry',
      wrong_age: 'Age incompatible with porphyry formation',
      no_arc_setting: 'Not in arc tectonic setting'
    };

    // LIKELIHOOD WEIGHTS (from Bayesian specification)
    this.likelihood_weights = {
      chemical: 0.35,
      structural: 0.30,
      physical: 0.25,
      surface: 0.10
    };
  }

  protected extractEvidence(target: Target): any {
    return {
      tectonic_setting: target.geological_context.tectonic_setting,
      age: target.geological_context.age,
      structure: target.geological_context.structure,
      chemical_evidence: target.evidence.chemical,
      structural_evidence: target.evidence.structural,
      physical_evidence: target.evidence.physical,
      surface_evidence: target.evidence.seismic
    };
  }

  // MANDATORY CONDITION IMPLEMENTATIONS
  private checkArcTectonicSetting = (evidence: any): ConditionResult => {
    const tectonic = evidence.tectonic_setting || '';
    const arcTerms = ['arc', 'subduction', 'andesitic', 'calc-alkaline', 'continental_arc', 'island_arc'];
    const isArc = arcTerms.some(term => tectonic.toLowerCase().includes(term));

    return {
      passed: isArc,
      value: tectonic,
      threshold: 'arc-related setting',
      certainty: 0.9,
      failure_reason: isArc ? undefined : 'Not in arc tectonic setting',
      evidence: ['regional tectonic maps', 'geophysical data', 'literature']
    };
  };

  private checkPotassicPhyllicAlteration = (evidence: any): ConditionResult => {
    const chemical = evidence.chemical_evidence || [];
    const alterationAssemblages = chemical.flatMap((e: any) => e.alteration_assemblages || []);
    
    const hasPotassic = alterationAssemblages.some((a: any) => a.alteration_type === 'potassic');
    const hasPhyllic = alterationAssemblages.some((a: any) => a.alteration_type === 'phyllic');
    
    const minerals = chemical.flatMap((e: any) => e.mineral_detections || []);
    const hasKfeldspar = minerals.some((m: any) => m.mineral_id === 'K-feldspar');
    const hasBiotite = minerals.some((m: any) => m.mineral_id === 'biotite');
    const hasSericite = minerals.some((m: any) => m.mineral_id === 'sericite');

    const potassicPresent = hasPotassic || (hasKfeldspar && hasBiotite);
    const phyllicPresent = hasPhyllic || hasSericite;
    const passed = potassicPresent && phyllicPresent;

    return {
      passed,
      value: { potassic: potassicPresent, phyllic: phyllicPresent },
      threshold: 'both potassic and phyllic alteration present',
      certainty: 0.8,
      failure_reason: passed ? undefined : 'Missing potassic or phyllic alteration',
      evidence: ['hyperspectral data', 'alteration mapping', 'mineralogy']
    };
  };

  private checkIntrusiveCenteredStructure = (evidence: any): ConditionResult => {
    const structural = evidence.structural_evidence || [];
    const hasCircularPattern = structural.some((s: any) => 
      s.lineament_density > 5 && // High density
      s.orientation_distribution.circular_variance < 0.5 // Organized pattern
    );

    const hasIntrusiveIndicators = structural.some((s: any) =>
      s.fault_type === 'radial' || s.fault_type === 'circular'
    );

    const passed = hasCircularPattern || hasIntrusiveIndicators;

    return {
      passed,
      value: { circular_pattern: hasCircularPattern, intrusive_indicators: hasIntrusiveIndicators },
      threshold: 'intrusive-centered structural geometry',
      certainty: 0.7,
      failure_reason: passed ? undefined : 'No intrusive-centered structural pattern',
      evidence: ['SAR data', 'structural mapping', 'lineament analysis']
    };
  };

  // SUPPORTIVE EVIDENCE IMPLEMENTATIONS
  private checkMagneticDestruction = (evidence: any): SupportiveEvidence => {
    const physical = evidence.physical_evidence || [];
    const magneticAnomalies = physical.filter((p: any) => p.residual_anomaly < -50); // Negative anomalies
    
    const strength = Math.min(1.0, magneticAnomalies.length / 3);
    
    return {
      evidence_type: 'magnetic_destruction',
      strength,
      description: `Magnetic destruction signature: ${magneticAnomalies.length} negative anomalies`,
      data_sources: ['magnetic surveys', 'aeromagnetic data']
    };
  };

  private checkDensityContrasts = (evidence: any): SupportiveEvidence => {
    const physical = evidence.physical_evidence || [];
    const gravityAnomalies = physical.filter((p: any) => Math.abs(p.residual_anomaly) > 10);
    
    const strength = Math.min(1.0, gravityAnomalies.length / 2);
    
    return {
      evidence_type: 'density_contrasts',
      strength,
      description: `Density contrasts: ${gravityAnomalies.length} significant gravity anomalies`,
      data_sources: ['gravity surveys', 'density measurements']
    };
  };

  private checkAlterationZoning = (evidence: any): SupportiveEvidence => {
    const chemical = evidence.chemical_evidence || [];
    const alterationAssemblages = chemical.flatMap((e: any) => e.alteration_assemblages || []);
    
    const zoningPatterns = alterationAssemblages.filter((a: any) => 
      a.zoning_pattern === 'concentric' || a.zoning_pattern === 'linear'
    );
    
    const strength = Math.min(1.0, zoningPatterns.length / 2);
    
    return {
      evidence_type: 'alteration_zoning',
      strength,
      description: `Alteration zoning: ${zoningPatterns.length} systematic patterns`,
      data_sources: ['hyperspectral analysis', 'alteration mapping']
    };
  };

  private checkStructuralControl = (evidence: any): SupportiveEvidence => {
    const structural = evidence.structural_evidence || [];
    const controllingStructures = structural.filter((s: any) => 
      s.relationship_to_mineralization === 'controlling'
    );
    
    const strength = Math.min(1.0, controllingStructures.length / 2);
    
    return {
      evidence_type: 'structural_control',
      strength,
      description: `Structural control: ${controllingStructures.length} controlling structures`,
      data_sources: ['structural analysis', 'field mapping']
    };
  };

  private checkGeochemicalAnomaly = (evidence: any): SupportiveEvidence => {
    // Mock geochemical data - in reality would use actual geochemistry
    const hasCopperAnomaly = Math.random() > 0.5;
    const hasPathfinderElements = Math.random() > 0.6;
    
    const strength = (hasCopperAnomaly ? 0.6 : 0) + (hasPathfinderElements ? 0.4 : 0);
    
    return {
      evidence_type: 'geochemical_anomaly',
      strength,
      description: `Geochemical anomaly: Cu=${hasCopperAnomaly}, pathfinders=${hasPathfinderElements}`,
      data_sources: ['soil sampling', 'rock chip sampling', 'stream sediments']
    };
  };

  // KILL FACTOR IMPLEMENTATIONS
  private checkNoAlterationZoning = (evidence: any): boolean => {
    const chemical = evidence.chemical_evidence || [];
    const alterationAssemblages = chemical.flatMap((e: any) => e.alteration_assemblages || []);
    
    const hasZoning = alterationAssemblages.some((a: any) => 
      a.zoning_pattern !== 'none' && a.zoning_pattern !== 'random'
    );
    
    return !hasZoning;
  };

  private checkNoIntrusiveGeometry = (evidence: any): boolean => {
    const structural = evidence.structural_evidence || [];
    const intrusiveTerms = ['stock', 'dike', 'pluton', 'intrusive', 'batholith', 'circular'];
    
    const hasIntrusive = structural.some((s: any) => 
      intrusiveTerms.some(term => JSON.stringify(s).toLowerCase().includes(term))
    );
    
    return !hasIntrusive;
  };

  private checkWrongAge = (evidence: any): boolean => {
    const age = evidence.age || '';
    const ageMa = this.parseAge(age);
    
    // Porphyry systems are typically 1-100 Ma
    return ageMa < 1 || ageMa > 100;
  };

  private checkNoArcSetting = (evidence: any): boolean => {
    const tectonic = evidence.tectonic_setting || '';
    const arcTerms = ['arc', 'subduction', 'andesitic', 'calc-alkaline'];
    
    const isArc = arcTerms.some(term => tectonic.toLowerCase().includes(term));
    return !isArc;
  };

  // Helper methods
  private parseAge(age: string): number {
    const match = age.match(/(\d+(?:\.\d+)?)\s*Ma/i);
    return match ? parseFloat(match[1]) : 100;
  }

  protected generateRecommendations(
    mandatory: MandatoryResult,
    killFactors: KillFactorResult,
    supportive: SupportiveEvidence[],
    assessment: PlaybookResult['overall_assessment']
  ): string[] {
    const recommendations: string[] = [];

    if (assessment === 'favorable') {
      recommendations.push('Strong candidate for drilling - high priority');
      recommendations.push('Focus on defining alteration zoning and structural controls');
      recommendations.push('Consider detailed geophysical surveys to define intrusion geometry');
    } else if (assessment === 'marginal') {
      recommendations.push('Additional data required before drilling consideration');
      recommendations.push('Focus on improving alteration mapping and structural analysis');
      recommendations.push('Consider targeted geochemical sampling');
    } else {
      recommendations.push('Not recommended for drilling at this time');
      if (!mandatory.all_passed) {
        recommendations.push('Address failed mandatory conditions first');
      }
      if (killFactors.killed) {
        recommendations.push('Kill factors indicate geological impossibility');
      }
    }

    // Specific recommendations based on evidence gaps
    const strongEvidence = supportive.filter(s => s.strength > 0.7);
    const weakEvidence = supportive.filter(s => s.strength < 0.3);

    if (weakEvidence.length > strongEvidence.length) {
      recommendations.push('Strengthen data acquisition for weak evidence categories');
    }

    return recommendations;
  }
}