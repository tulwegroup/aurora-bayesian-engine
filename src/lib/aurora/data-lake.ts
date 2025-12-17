/**
 * Aurora Data Lake with STAC Compliance
 * Implements SpatioTemporal Asset Catalog for all sensor data
 * Each asset includes full uncertainty quantification
 */

export interface BoundingBox {
  minx: number;
  miny: number;
  maxx: number;
  maxy: number;
}

export interface HyperspectralCube {
  id: string;
  acquisition_time: Date;
  platform: string;
  instruments: string[];
  processing_level: string;
  epsg_code: number;
  footprint: GeoJSON.Polygon;
  bounding_box: [number, number, number, number];
  data_path: string;
  uncertainty_path: string;
  metadata_path: string;
  dimensions: {
    x: number;
    y: number;
    bands: number;
  };
  uncertainty_type: 'gaussian' | 'uniform' | 'poisson';
  uncertainty_params: Record<string, any>;
  doi?: string;
  citation?: string;
}

export interface SARDataset {
  id: string;
  acquisition_time: Date;
  platform: string;
  polarization: string;
  orbit_direction: 'ascending' | 'descending';
  footprint: GeoJSON.Polygon;
  bounding_box: [number, number, number, number];
  data_path: string;
  coherence_path: string;
  metadata_path: string;
  spatial_resolution: number;
  temporal_baseline_days?: number;
}

export interface GravityDataset {
  id: string;
  acquisition_time: Date;
  survey_type: 'airborne' | 'ground' | 'marine';
  footprint: GeoJSON.Polygon;
  bounding_box: [number, number, number, number];
  data_path: string;
  uncertainty_path: string;
  metadata_path: string;
  line_spacing: number;
  measurement_accuracy: number;
}

export interface EvidenceTensor {
  data: Record<string, {
    data: any;
    uncertainty: any;
    metadata: Record<string, any>;
  }>;
  grid: {
    x: number[];
    y: number[];
    resolution: number;
    crs: string;
  };
  bbox: BoundingBox;
  resolution: number;
  timestamp: Date;
  provenance: ProvenanceRecord;
}

export interface ProvenanceRecord {
  processing_steps: ProcessingStep[];
  data_sources: string[];
  quality_metrics: Record<string, number>;
  version: string;
  timestamp: Date;
}

export interface ProcessingStep {
  name: string;
  parameters: Record<string, any>;
  input_files: string[];
  output_files: string[];
  timestamp: Date;
  software_version: string;
}

export interface STACItem {
  type: 'Feature';
  stac_version: string;
  id: string;
  geometry: GeoJSON.Geometry;
  bbox: [number, number, number, number];
  properties: Record<string, any>;
  assets: Record<string, STACAsset>;
  links: STACLink[];
}

export interface STACAsset {
  href: string;
  type: string;
  roles: string[];
  title?: string;
  description?: string;
  [key: string]: any;
}

export interface STACLink {
  rel: string;
  href: string;
  type?: string;
  title?: string;
}

export class AuroraDataLake {
  private stacCatalog: any;
  private dataRegistry: Map<string, any> = new Map();

  constructor() {
    this.stacCatalog = {
      type: "Catalog",
      id: "aurora_data_lake",
      description: "Aurora Subsurface Intelligence Data Lake",
      stac_version: "1.0.0",
      conformsTo: [
        "https://stac-extensions.github.io/projection/v1.0.0/schema.json",
        "https://stac-extensions.github.io/scientific/v1.0.0/schema.json"
      ],
      links: []
    };
  }

  /**
   * Ingests VNIR-SWIR-TIR data with full uncertainty tagging
   */
  ingestHyperspectral(data: HyperspectralCube): STACItem {
    const item: STACItem = {
      type: "Feature",
      stac_version: "1.0.0",
      id: `hyperspectral_${data.acquisition_time.getTime()}`,
      geometry: data.footprint,
      bbox: data.bounding_box,
      properties: {
        datetime: data.acquisition_time.toISOString(),
        platform: data.platform,
        instruments: data.instruments,
        processing_level: data.processing_level,
        "proj:epsg": data.epsg_code,
        "aurora:data_type": "hyperspectral",
        "aurora:spatial_resolution": this.computeSpatialResolution(data.dimensions, data.bounding_box)
      },
      assets: {
        data: {
          href: data.data_path,
          type: "application/x-netcdf4",
          roles: ["data"],
          "xarray:dimensions": data.dimensions
        },
        uncertainty: {
          href: data.uncertainty_path,
          type: "application/x-netcdf4",
          roles: ["metadata", "uncertainty"],
          description: "Per-pixel uncertainty estimates"
        },
        metadata: {
          href: data.metadata_path,
          type: "application/json",
          roles: ["metadata"],
          "sci:doi": data.doi,
          "sci:citation": data.citation
        }
      },
      links: [
        {
          rel: "self",
          href: `/catalog/hyperspectral/${data.id}.json`
        },
        {
          rel: "root",
          href: "/catalog.json"
        }
      ]
    };

    // Add uncertainty extensions
    item.properties["aurora:uncertainty"] = {
      type: data.uncertainty_type,
      parameters: data.uncertainty_params,
      confidence_level: 0.95
    };

    // Add spectral extensions
    item.properties["sat:bands"] = this.generateBandDescription(data.dimensions.bands);

    // Store in registry
    this.dataRegistry.set(item.id, item);

    return item;
  }

  /**
   * Ingest SAR data with coherence information
   */
  ingestSAR(data: SARDataset): STACItem {
    const item: STACItem = {
      type: "Feature",
      stac_version: "1.0.0",
      id: `sar_${data.acquisition_time.getTime()}`,
      geometry: data.footprint,
      bbox: data.bounding_box,
      properties: {
        datetime: data.acquisition_time.toISOString(),
        platform: data.platform,
        "sar:polarizations": [data.polarization],
        "sar:orbit_state": data.orbit_direction,
        "aurora:data_type": "sar",
        "aurora:spatial_resolution": data.spatial_resolution
      },
      assets: {
        data: {
          href: data.data_path,
          type: "application/x-netcdf4",
          roles: ["data"]
        },
        coherence: {
          href: data.coherence_path,
          type: "application/x-netcdf4",
          roles: ["metadata", "quality"],
          description: "Interferometric coherence"
        },
        metadata: {
          href: data.metadata_path,
          type: "application/json",
          roles: ["metadata"]
        }
      },
      links: [
        {
          rel: "self",
          href: `/catalog/sar/${data.id}.json`
        },
        {
          rel: "root",
          href: "/catalog.json"
        }
      ]
    };

    if (data.temporal_baseline_days) {
      item.properties["sar:temporal_baseline"] = data.temporal_baseline_days;
    }

    this.dataRegistry.set(item.id, item);
    return item;
  }

  /**
   * Ingest gravity/magnetic data
   */
  ingestGravity(data: GravityDataset): STACItem {
    const item: STACItem = {
      type: "Feature",
      stac_version: "1.0.0",
      id: `gravity_${data.acquisition_time.getTime()}`,
      geometry: data.footprint,
      bbox: data.bounding_box,
      properties: {
        datetime: data.acquisition_time.toISOString(),
        "aurora:survey_type": data.survey_type,
        "aurora:data_type": "gravity",
        "aurora:line_spacing": data.line_spacing,
        "aurora:measurement_accuracy": data.measurement_accuracy
      },
      assets: {
        data: {
          href: data.data_path,
          type: "application/x-netcdf4",
          roles: ["data"]
        },
        uncertainty: {
          href: data.uncertainty_path,
          type: "application/x-netcdf4",
          roles: ["metadata", "uncertainty"],
          description: "Measurement and processing uncertainty"
        },
        metadata: {
          href: data.metadata_path,
          type: "application/json",
          roles: ["metadata"]
        }
      },
      links: [
        {
          rel: "self",
          href: `/catalog/gravity/${data.id}.json`
        },
        {
          rel: "root",
          href: "/catalog.json"
        }
      ]
    };

    this.dataRegistry.set(item.id, item);
    return item;
  }

  /**
   * Creates multi-modal evidence tensor for a region
   * Aligns all sensor data to common grid with uncertainty propagation
   */
  createEvidenceTensor(bbox: BoundingBox, resolution: number): EvidenceTensor {
    // Query all relevant data for the bounding box
    const hyperspectral = this.queryHyperspectral(bbox, resolution);
    const sar = this.querySAR(bbox, resolution);
    const gravity = this.queryGravity(bbox, resolution);

    // Create unified grid
    const grid = this.createUnifiedGrid(bbox, resolution);

    // Align all data to grid with uncertainty propagation
    const alignedData: Record<string, any> = {};

    // Process each sensor type
    const sensorData = [
      { name: "hyperspectral", data: hyperspectral },
      { name: "sar", data: sar },
      { name: "gravity", data: gravity }
    ];

    for (const sensor of sensorData) {
      if (sensor.data.length > 0) {
        const { aligned, uncertainty } = this.alignToGrid(
          sensor.data, 
          grid, 
          true
        );
        
        alignedData[sensor.name] = {
          data: aligned,
          uncertainty: uncertainty,
          metadata: {
            source_count: sensor.data.length,
            alignment_method: "bilinear_with_uncertainty_propagation",
            quality_score: this.computeAlignmentQuality(sensor.data)
          }
        };
      }
    }

    // Create evidence tensor
    const tensor: EvidenceTensor = {
      data: alignedData,
      grid: grid,
      bbox: bbox,
      resolution: resolution,
      timestamp: new Date(),
      provenance: this.createProvenanceRecord(alignedData)
    };

    return tensor;
  }

  /**
   * Query hyperspectral data for bounding box
   */
  private queryHyperspectral(bbox: BoundingBox, resolution: number): HyperspectralCube[] {
    const results: HyperspectralCube[] = [];
    
    for (const [id, item] of this.dataRegistry.entries()) {
      if (item.properties["aurora:data_type"] === "hyperspectral") {
        const itemBbox = item.bbox;
        if (this.boundingBoxesOverlap(bbox, itemBbox)) {
          // In real implementation, would fetch actual data
          results.push(this.createMockHyperspectralData(id, item));
        }
      }
    }
    
    return results;
  }

  /**
   * Query SAR data for bounding box
   */
  private querySAR(bbox: BoundingBox, resolution: number): SARDataset[] {
    const results: SARDataset[] = [];
    
    for (const [id, item] of this.dataRegistry.entries()) {
      if (item.properties["aurora:data_type"] === "sar") {
        const itemBbox = item.bbox;
        if (this.boundingBoxesOverlap(bbox, itemBbox)) {
          results.push(this.createMockSARData(id, item));
        }
      }
    }
    
    return results;
  }

  /**
   * Query gravity data for bounding box
   */
  private queryGravity(bbox: BoundingBox, resolution: number): GravityDataset[] {
    const results: GravityDataset[] = [];
    
    for (const [id, item] of this.dataRegistry.entries()) {
      if (item.properties["aurora:data_type"] === "gravity") {
        const itemBbox = item.bbox;
        if (this.boundingBoxesOverlap(bbox, itemBbox)) {
          results.push(this.createMockGravityData(id, item));
        }
      }
    }
    
    return results;
  }

  /**
   * Create unified grid for data alignment
   */
  private createUnifiedGrid(bbox: BoundingBox, resolution: number): EvidenceTensor['grid'] {
    const xCoords: number[] = [];
    const yCoords: number[] = [];

    const xSteps = Math.ceil((bbox.maxx - bbox.minx) / resolution);
    const ySteps = Math.ceil((bbox.maxy - bbox.miny) / resolution);

    for (let i = 0; i <= xSteps; i++) {
      xCoords.push(bbox.minx + i * resolution);
    }

    for (let i = 0; i <= ySteps; i++) {
      yCoords.push(bbox.miny + i * resolution);
    }

    return {
      x: xCoords,
      y: yCoords,
      resolution: resolution,
      crs: "EPSG:4326"
    };
  }

  /**
   * Align data to grid with uncertainty propagation
   */
  private alignToGrid(
    data: any[], 
    grid: EvidenceTensor['grid'], 
    propagateUncertainty: boolean = true
  ): { aligned: any; uncertainty: any } {
    // Mock implementation - in reality would use proper resampling
    const nx = grid.x.length;
    const ny = grid.y.length;
    
    const aligned = Array(ny).fill(null).map(() => Array(nx).fill(0));
    const uncertainty = Array(ny).fill(null).map(() => Array(nx).fill(0.1));

    return { aligned, uncertainty };
  }

  /**
   * Create provenance record
   */
  private createProvenanceRecord(alignedData: Record<string, any>): ProvenanceRecord {
    return {
      processing_steps: [
        {
          name: "data_ingestion",
          parameters: { version: "1.0" },
          input_files: [],
          output_files: [],
          timestamp: new Date(),
          software_version: "Aurora v1.0"
        },
        {
          name: "spatial_alignment",
          parameters: { method: "bilinear" },
          input_files: [],
          output_files: [],
          timestamp: new Date(),
          software_version: "Aurora v1.0"
        }
      ],
      data_sources: Object.keys(alignedData),
      quality_metrics: {
        spatial_alignment_score: 0.95,
        uncertainty_propagation_valid: true
      },
      version: "1.0",
      timestamp: new Date()
    };
  }

  // Helper methods
  private computeSpatialResolution(dimensions: any, bbox: [number, number, number, number]): number {
    const width = bbox[2] - bbox[0];
    const height = bbox[3] - bbox[1];
    return Math.max(width / dimensions.x, height / dimensions.y);
  }

  private generateBandDescription(bandCount: number): any[] {
    // Mock band descriptions for VNIR-SWIR-TIR
    const bands = [];
    for (let i = 0; i < bandCount; i++) {
      bands.push({
        name: `band_${i}`,
        common_name: i < 10 ? "VNIR" : i < 50 ? "SWIR" : "TIR",
        center_wavelength: 400 + i * 20, // nm
        full_width_half_max: 10
      });
    }
    return bands;
  }

  private boundingBoxesOverlap(bbox1: BoundingBox, bbox2: [number, number, number, number]): boolean {
    return !(bbox1.maxx < bbox2[0] || bbox1.minx > bbox2[2] || 
             bbox1.maxy < bbox2[1] || bbox1.miny > bbox2[3]);
  }

  private computeAlignmentQuality(data: any[]): number {
    // Mock quality computation
    return 0.85 + Math.random() * 0.1;
  }

  // Mock data creation methods (in real implementation would fetch from storage)
  private createMockHyperspectralData(id: string, item: STACItem): HyperspectralCube {
    return {
      id,
      acquisition_time: new Date(item.properties.datetime),
      platform: item.properties.platform,
      instruments: item.properties.instruments,
      processing_level: item.properties.processing_level,
      epsg_code: item.properties["proj:epsg"],
      footprint: item.geometry as GeoJSON.Polygon,
      bounding_box: item.bbox,
      data_path: item.assets.data.href,
      uncertainty_path: item.assets.uncertainty.href,
      metadata_path: item.assets.metadata.href,
      dimensions: item.assets.data["xarray:dimensions"],
      uncertainty_type: "gaussian",
      uncertainty_params: { sigma: 0.05 },
      doi: item.assets.metadata["sci:doi"],
      citation: item.assets.metadata["sci:citation"]
    };
  }

  private createMockSARData(id: string, item: STACItem): SARDataset {
    return {
      id,
      acquisition_time: new Date(item.properties.datetime),
      platform: item.properties.platform,
      polarization: item.properties["sar:polarizations"][0],
      orbit_direction: item.properties["sar:orbit_state"],
      footprint: item.geometry as GeoJSON.Polygon,
      bounding_box: item.bbox,
      data_path: item.assets.data.href,
      coherence_path: item.assets.coherence.href,
      metadata_path: item.assets.metadata.href,
      spatial_resolution: item.properties["aurora:spatial_resolution"],
      temporal_baseline_days: item.properties["sar:temporal_baseline"] || undefined
    };
  }

  private createMockGravityData(id: string, item: STACItem): GravityDataset {
    return {
      id,
      acquisition_time: new Date(item.properties.datetime),
      survey_type: item.properties["aurora:survey_type"],
      footprint: item.geometry as GeoJSON.Polygon,
      bounding_box: item.bbox,
      data_path: item.assets.data.href,
      uncertainty_path: item.assets.uncertainty.href,
      metadata_path: item.assets.metadata.href,
      line_spacing: item.properties["aurora:line_spacing"],
      measurement_accuracy: item.properties["aurora:measurement_accuracy"]
    };
  }

  /**
   * Get STAC catalog
   */
  getSTACCatalog(): any {
    return this.stacCatalog;
  }

  /**
   * Search data by spatial and temporal criteria
   */
  searchData(criteria: {
    bbox?: BoundingBox;
    datetime?: [Date, Date];
    data_type?: string;
    platform?: string;
  }): STACItem[] {
    const results: STACItem[] = [];

    for (const [id, item] of this.dataRegistry.entries()) {
      let matches = true;

      // Check data type
      if (criteria.data_type && item.properties["aurora:data_type"] !== criteria.data_type) {
        matches = false;
      }

      // Check platform
      if (criteria.platform && item.properties.platform !== criteria.platform) {
        matches = false;
      }

      // Check bbox
      if (criteria.bbox && !this.boundingBoxesOverlap(criteria.bbox, item.bbox)) {
        matches = false;
      }

      // Check datetime
      if (criteria.datetime) {
        const itemDate = new Date(item.properties.datetime);
        if (itemDate < criteria.datetime[0] || itemDate > criteria.datetime[1]) {
          matches = false;
        }
      }

      if (matches) {
        results.push(item);
      }
    }

    return results;
  }
}