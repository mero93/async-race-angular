export interface Car {
  id: number;
  name: string;
  color: string;
  engine?: Engine;
}

export interface Engine {
  velocity: number;
  distance: number;
}
