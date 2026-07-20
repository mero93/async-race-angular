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

export type CarStatus = 'stopped' | 'started' | 'driving' | 'broken';

export interface CarState {
  id: number;
  status: CarStatus;
  currentPosition: number;
  startTime: number | null;
  duration: number;
}
