export interface PalitoData {
  hole_id: string;
  max_depth?: number;
  z?: number;
  water_level?: number;
  depths: number[];
  geology: string[];
  interp?: string[];
  nspt: {
    start_depth: number;
    interval: number;
    values: string[];
  };
}

export interface Cluster {
  startIndex: number;
  endIndex: number;
  layers: number[];
  totalNeeded: number;
  totalAvailable: number;
  needsExtraSpace: number;
  layerSizes: LayerSize[];
  unchanged?: boolean;
}

export interface LayerSize {
  layerIndex?: number;
  originalHeight: number;
  textHeight: number;
  finalHeight: number;
  from: number;
  to: number;
}
