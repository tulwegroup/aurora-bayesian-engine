/**
 * Complete Data Schemas for Aurora System
 * SQLAlchemy-style models adapted for TypeScript/Prisma
 * Implements all data types per specification 3.1-3.4
 */

export interface HyperspectralData {
  id: string;
  spatial_index: string; // GeoJSON Point
  mineral_id: string; // Primary mineral
  band_depth_vector: number[]; // Array of band depths
  spectral_fit_error: number; // RMSE of spectral fit
  alteration_assemblage_id: string; // Assemblage classification
  confidence: number; // 0-1 confidence score
  uncertainty_type: 'gaussian' | 'uniform' | 'poisson';
  uncertainty_params: Record<string, any>; // Parameters for uncertainty distribution
  acquisition_time: Date;
  processing_version: string;
  
  // Additional metadata
  sensor_type: string;
  atmospheric_correction: string;
  spatial_resolution: number;
  
  // Location
  longitude: number;
  latitude: number;
  elevation?: number;
  
  // Spectral information
  wavelength_range: [number, number]; // nm
  band_count: number;
  continuum_removal_method: string;
  
  // Quality metrics
  signal_to_noise: number;
  cloud_cover: number;
  solar_zenith_angle: number;
  
  // Geological context
  geological_unit: string;
  structural_domain: string;
  alteration_intensity: 'low' | 'moderate' | 'high';
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
}

export interface SARStructuralData {
  id: string;
  spatial_index: string; // GeoJSON LineString
  lineament_density: number; // Features per km²
  orientation_distribution: {
    bins: number[]; // Orientation bins (degrees)
    counts: number[]; // Count per bin
    mean_direction: number; // Mean orientation (degrees)
    circular_variance: number; // 0-1, lower = more organized
  };
  trap_geometry_flag: number; // 0/1 flag for trap presence
  structural_confidence: number; // 0-1 confidence
  fault_type: 'normal' | 'reverse' | 'strike-slip' | 'thrust' | 'unknown';
  length_m: number;
  displacement_m?: number;
  uncertainty_ellipse: string; // GeoJSON Polygon
  
  // Coherence metrics
  coherence_mean: number;
  coherence_std: number;
  temporal_baseline_days: number;
  
  // Acquisition parameters
  platform: string;
  polarization: string;
  orbit_direction: 'ascending' | 'descending';
  incidence_angle_range: [number, number];
  
  // Processing
  processing_method: string;
  filtering_applied: string;
  detection_algorithm: string;
  
  // Geological interpretation
  structural_age?: string;
  kinematic_indicators?: string[];
  relationship_to_mineralization: 'controlling' | 'post-mineralization' | 'pre-mineralization' | 'unknown';
  
  // Location
  longitude: number;
  latitude: number;
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
}

export interface GravityMagneticData {
  id: string;
  spatial_index: string; // GeoJSON Point
  residual_anomaly: number; // mGal or nT
  wavelength_class: 'regional' | 'residual' | 'local' | 'noise';
  depth_estimate_range: [number, number]; // [min_depth, max_depth] in meters
  ambiguity_index: number; // 0-1 ambiguity measure
  inversion_method: string;
  density_contrast?: number; // g/cm³ for gravity
  susceptibility_contrast?: number; // SI for magnetic
  uncertainty_sigma: number;
  
  // Multiple solution support
  equivalent_solutions: Array<{
    depth: number;
    contrast: number;
    geometry: string;
    misfit: number;
    weight: number;
  }>;
  solution_weights: number[];
  
  // Survey parameters
  survey_type: 'airborne' | 'ground' | 'marine' | 'satellite';
  line_spacing?: number; // meters
  station_spacing?: number; // meters
  flight_height?: number; // meters for airborne
  measurement_accuracy: number;
  
  // Processing parameters
  regional_removal_method: string;
  filtering_parameters: Record<string, any>;
  upward_continuation_height?: number;
  
  // Geological context
  source_type: 'intrusive' | 'volcanic' | 'sedimentary' | 'structural' | 'unknown';
  expected_geometry: 'sphere' | 'cylinder' | 'sheet' | 'complex' | 'unknown';
  
  // Location
  longitude: number;
  latitude: number;
  elevation?: number;
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
}

export interface SeismicData {
  id: string;
  spatial_index: string; // GeoJSON Polygon
  closure_height: number; // meters
  trap_type: 'anticline' | 'fault' | 'stratigraphic' | 'combination' | 'unconformity';
  depth_uncertainty: number; // meters
  seal_risk: number; // 0-1 risk score
  migration_pathway: string;
  charge_timing: 'early' | 'syn' | 'post' | 'unknown';
  data_quality: 'good' | 'fair' | 'poor';
  interpretation_confidence: number;
  
  // 3D seismic specific
  volume_id: string;
  inline_start: number;
  inline_end: number;
  crossline_start: number;
  crossline_end: number;
  z_start: number; // milliseconds or depth
  z_end: number;
  
  // Velocity model
  velocity_model: string;
  velocity_uncertainty: number;
  
  // Reservoir properties
  amplitude_anomaly: boolean;
  avo_response?: string;
  flat_spot?: boolean;
  dim_spot?: boolean;
  
  // Trap geometry
  spill_point_depth?: number; // meters
  closure_area: number; // km²
  structural_complexity: 'simple' | 'moderate' | 'complex';
  
  // Risk factors
  seal_integrity: number; // 0-1
  reservoir_continuity: number; // 0-1
  trap_integrity: number; // 0-1
  
  // Location
  longitude: number;
  latitude: number;
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
}

export interface Target {
  id: string;
  name: string;
  commodity: 'copper_porphyry' | 'lithium_brine' | 'hydrocarbon_onshore' | 'hydrocarbon_offshore';
  status: 'prospective' | 'drilled' | 'abandoned' | 'producing';
  
  // Location
  longitude: number;
  latitude: number;
  area: number; // km²
  bbox: [number, number, number, number]; // [minx, miny, maxx, maxy]
  
  // Geological context
  geological_terrain: string;
  tectonic_setting: string;
  age: string;
  stratigraphic_unit: string;
  
  // Probability calculations
  prior_probability: number;
  posterior_probability: number;
  confidence_class: 'NOISE' | 'RECON' | 'PROSPECT' | 'PRIORITY' | 'DRILL_JUSTIFIED';
  
  // Evidence links
  chemical_evidence_ids: string[];
  structural_evidence_ids: string[];
  physical_evidence_ids: string[];
  seismic_evidence_ids: string[];
  
  // Veto information
  veto_passed: boolean;
  veto_reason?: string;
  veto_categories_checked: string[];
  
  // Metadata
  created_by: string;
  created_at: Date;
  updated_at: Date;
  last_analyzed: Date;
  
  // Drill results (if applicable)
  drill_date?: Date;
  drill_outcome?: 'success' | 'failure' | 'inconclusive';
  production_rates?: Record<string, number>;
}

export interface DrillOutcome {
  id: string;
  target_id: string;
  drill_date: Date;
  outcome: 'success' | 'failure' | 'inconclusive';
  
  // Results
  mineralization_encountered: boolean;
  thickness_m: number;
  grade?: Record<string, number>; // Commodity grades
  production_rates?: Record<string, number>;
  
  // Geological reality
  actual_geology: {
    lithology: string;
    alteration: string;
    structure: string;
    mineralogy: string[];
  };
  
  // Why system failed (if applicable)
  failure_classification?: string;
  root_cause?: string;
  system_errors?: string[];
  
  // Learning outcomes
  lessons_learned: string[];
  confidence_adjustments: Record<string, number>;
  
  created_at: Date;
}

export interface RegionalPrior {
  id: string;
  region_name: string;
  bbox: [number, number, number, number];
  commodity: string;
  
  // Regional factors
  tectonic_compatibility: number; // 0-1
  age_timing_compatibility: number; // 0-1
  stratigraphic_permissibility: number; // 0-1
  historical_analog_density: number; // 0-1
  
  // Calculated prior
  prior_probability: number;
  uncertainty: number;
  
  // Statistics
  total_targets: number;
  successful_targets: number;
  false_positive_rate: number;
  
  // Metadata
  last_updated: Date;
  updated_by: string;
}

export interface AnalogDatabase {
  id: string;
  name: string;
  commodity: string;
  location: {
    country: string;
    region: string;
    longitude: number;
    latitude: number;
  };
  
  // Geological characteristics
  age: string;
  tectonic_setting: string;
  host_rock: string;
  structural_control: string;
  alteration_type: string;
  
  // Deposit characteristics
  size_tonnes: number;
  grade: Record<string, number>;
  depth_m: number;
  geometry: string;
  
  // Discovery information
  discovery_year: number;
  discovery_method: string;
  exploration_history: string;
  
  // Similarity metrics
  similarity_factors: Record<string, number>;
  confidence_level: number;
  
  // References
  references: string[];
  data_quality: 'high' | 'medium' | 'low';
  
  created_at: Date;
  updated_at: Date;
}

// Prisma schema generation helper
export const generatePrismaSchema = (): string => {
  return `
// Aurora Subsurface Intelligence Database Schema
// Generated for PostgreSQL with PostGIS extension

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model HyperspectralData {
  id                        String   @id @default(cuid())
  spatial_index             String   // PostGIS point
  mineral_id                String
  band_depth_vector         Float[]  // Array of band depths
  spectral_fit_error        Float
  alteration_assemblage_id  String
  confidence                Float
  uncertainty_type          String   // gaussian, uniform, poisson
  uncertainty_params        Json     // Parameters for uncertainty distribution
  acquisition_time          DateTime
  processing_version        String
  
  // Additional metadata
  sensor_type               String
  atmospheric_correction    String
  spatial_resolution        Float
  
  // Location
  longitude                 Float
  latitude                  Float
  elevation                 Float?
  
  // Spectral information
  wavelength_range_min      Float
  wavelength_range_max      Float
  band_count                Int
  continuum_removal_method  String
  
  // Quality metrics
  signal_to_noise           Float
  cloud_cover               Float
  solar_zenith_angle        Float
  
  // Geological context
  geological_unit           String
  structural_domain         String
  alteration_intensity      String   // low, moderate, high
  
  // Timestamps
  created_at                DateTime @default(now())
  updated_at                DateTime @updatedAt
  
  @@map("hyperspectral_data")
}

model SARStructuralData {
  id                      String   @id @default(cuid())
  spatial_index           String   // PostGIS linestring
  lineament_density       Float
  orientation_bins        Float[]  // Orientation bins (degrees)
  orientation_counts      Int[]    // Count per bin
  mean_direction          Float    // Mean orientation (degrees)
  circular_variance       Float    // 0-1, lower = more organized
  trap_geometry_flag      Int      // 0/1 flag for trap presence
  structural_confidence   Float
  fault_type              String   // normal, reverse, strike-slip, thrust, unknown
  length_m                Float
  displacement_m          Float?
  uncertainty_ellipse     String   // PostGIS polygon
  
  // Coherence metrics
  coherence_mean          Float
  coherence_std           Float
  temporal_baseline_days  Int
  
  // Acquisition parameters
  platform                String
  polarization            String
  orbit_direction         String   // ascending, descending
  incidence_angle_min     Float
  incidence_angle_max     Float
  
  // Processing
  processing_method       String
  filtering_applied       String
  detection_algorithm     String
  
  // Geological interpretation
  structural_age          String?
  kinematic_indicators    String[]
  relationship_to_mineralization String // controlling, post-mineralization, pre-mineralization, unknown
  
  // Location
  longitude               Float
  latitude                Float
  
  // Timestamps
  created_at              DateTime @default(now())
  updated_at              DateTime @updatedAt
  
  @@map("sar_structural_data")
}

model GravityMagneticData {
  id                    String   @id @default(cuid())
  spatial_index         String   // PostGIS point
  residual_anomaly      Float
  wavelength_class      String   // regional, residual, local, noise
  depth_estimate_min    Float
  depth_estimate_max    Float
  ambiguity_index       Float
  inversion_method      String
  density_contrast      Float?   // g/cm³ for gravity
  susceptibility_contrast Float?  // SI for magnetic
  uncertainty_sigma     Float
  
  // Multiple solution support
  equivalent_solutions   Json     // Array of alternative models
  solution_weights      Float[]
  
  // Survey parameters
  survey_type           String   // airborne, ground, marine, satellite
  line_spacing          Float?   // meters
  station_spacing       Float?   // meters
  flight_height         Float?   // meters for airborne
  measurement_accuracy  Float
  
  // Processing parameters
  regional_removal_method String
  filtering_parameters  Json
  upward_continuation_height Float?
  
  // Geological context
  source_type            String   // intrusive, volcanic, sedimentary, structural, unknown
  expected_geometry      String   // sphere, cylinder, sheet, complex, unknown
  
  // Location
  longitude              Float
  latitude               Float
  elevation              Float?
  
  // Timestamps
  created_at             DateTime @default(now())
  updated_at             DateTime @updatedAt
  
  @@map("gravity_magnetic_data")
}

model SeismicData {
  id                      String   @id @default(cuid())
  spatial_index           String   // PostGIS polygon
  closure_height          Float    // meters
  trap_type               String   // anticline, fault, stratigraphic, combination, unconformity
  depth_uncertainty       Float    // meters
  seal_risk               Float    // 0-1 risk score
  migration_pathway       String
  charge_timing           String   // early, syn, post, unknown
  data_quality            String   // good, fair, poor
  interpretation_confidence Float
  
  // 3D seismic specific
  volume_id               String
  inline_start            Int
  inline_end              Int
  crossline_start         Int
  crossline_end           Int
  z_start                 Float    // milliseconds or depth
  z_end                   Float
  
  // Velocity model
  velocity_model          String
  velocity_uncertainty    Float
  
  // Reservoir properties
  amplitude_anomaly       Boolean
  avo_response            String?
  flat_spot               Boolean?
  dim_spot                Boolean?
  
  // Trap geometry
  spill_point_depth       Float?   // meters
  closure_area            Float    // km²
  structural_complexity   String   // simple, moderate, complex
  
  // Risk factors
  seal_integrity          Float    // 0-1
  reservoir_continuity    Float    // 0-1
  trap_integrity          Float    // 0-1
  
  // Location
  longitude               Float
  latitude                Float
  
  // Timestamps
  created_at              DateTime @default(now())
  updated_at              DateTime @updatedAt
  
  @@map("seismic_data")
}

model Target {
  id                        String   @id @default(cuid())
  name                      String
  commodity                 String   // copper_porphyry, lithium_brine, hydrocarbon_onshore, hydrocarbon_offshore
  status                    String   // prospective, drilled, abandoned, producing
  
  // Location
  longitude                 Float
  latitude                  Float
  area                      Float    // km²
  bbox_minx                 Float
  bbox_miny                 Float
  bbox_maxx                 Float
  bbox_maxy                 Float
  
  // Geological context
  geological_terrain        String
  tectonic_setting          String
  age                       String
  stratigraphic_unit        String
  
  // Probability calculations
  prior_probability          Float
  posterior_probability     Float
  confidence_class          String   // NOISE, RECON, PROSPECT, PRIORITY, DRILL_JUSTIFIED
  
  // Evidence links
  chemical_evidence_ids     String[]
  structural_evidence_ids   String[]
  physical_evidence_ids     String[]
  seismic_evidence_ids      String[]
  
  // Veto information
  veto_passed               Boolean
  veto_reason               String?
  veto_categories_checked   String[]
  
  // Metadata
  created_by                String
  created_at                DateTime @default(now())
  updated_at                DateTime @updatedAt
  last_analyzed             DateTime
  
  // Drill results (if applicable)
  drill_date                DateTime?
  drill_outcome             String?  // success, failure, inconclusive
  production_rates          Json?    // Commodity rates
  
  @@map("targets")
}

model DrillOutcome {
  id                        String   @id @default(cuid())
  target_id                 String
  drill_date                DateTime
  outcome                   String   // success, failure, inconclusive
  
  // Results
  mineralization_encountered Boolean
  thickness_m               Float
  grade                     Json?    // Commodity grades
  production_rates          Json?    // Commodity rates
  
  // Geological reality
  actual_lithology          String
  actual_alteration         String
  actual_structure          String
  actual_mineralogy         String[]
  
  // Why system failed (if applicable)
  failure_classification     String?
  root_cause                String?
  system_errors             String[]
  
  // Learning outcomes
  lessons_learned           String[]
  confidence_adjustments    Json
  
  created_at                DateTime @default(now())
  
  @@map("drill_outcomes")
}

model RegionalPrior {
  id                        String   @id @default(cuid())
  region_name               String
  bbox_minx                 Float
  bbox_miny                 Float
  bbox_maxx                 Float
  bbox_maxy                 Float
  commodity                 String
  
  // Regional factors
  tectonic_compatibility    Float    // 0-1
  age_timing_compatibility  Float    // 0-1
  stratigraphic_permissibility Float  // 0-1
  historical_analog_density Float   // 0-1
  
  // Calculated prior
  prior_probability         Float
  uncertainty               Float
  
  // Statistics
  total_targets             Int
  successful_targets       Int
  false_positive_rate       Float
  
  // Metadata
  last_updated              DateTime @updatedAt
  updated_by                String
  
  @@map("regional_priors")
}

model AnalogDatabase {
  id                        String   @id @default(cuid())
  name                      String
  commodity                 String
  country                   String
  region                    String
  longitude                 Float
  latitude                  Float
  
  // Geological characteristics
  age                       String
  tectonic_setting          String
  host_rock                 String
  structural_control        String
  alteration_type           String
  
  // Deposit characteristics
  size_tonnes               Float
  grade                     Json     // Commodity grades
  depth_m                   Float
  geometry                  String
  
  // Discovery information
  discovery_year            Int
  discovery_method          String
  exploration_history       String
  
  // Similarity metrics
  similarity_factors        Json
  confidence_level          Float
  
  // References
  references                String[]
  data_quality              String   // high, medium, low
  
  created_at                DateTime @default(now())
  updated_at                DateTime @updatedAt
  
  @@map("analog_database")
}
`;
};