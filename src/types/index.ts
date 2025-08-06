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
