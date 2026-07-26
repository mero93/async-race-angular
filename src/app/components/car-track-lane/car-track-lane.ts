import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { LucidePencil, LucidePlay, LucideSquare, LucideTrash2 } from '@lucide/angular';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { Car, CarState } from '../../types/car';
import { CarView } from '../car-view/car-view';

@Component({
  selector: 'app-car-track-lane',
  standalone: true,
  imports: [
    CommonModule,
    HlmButtonImports,
    LucidePencil,
    LucideTrash2,
    LucidePlay,
    LucideSquare,
    CarView,
  ],
  templateUrl: './car-track-lane.html',
  host: {
    class: 'block w-full',
  },
})
export class CarTrackLane {
  car = input.required<Car>();
  carState = input.required<CarState>();
  isBusy = input<boolean>(false);

  editCar = output<Car>();
  removeCar = output<number>();
  startEngine = output<number>();
  stopEngine = output<number>();

  isEngineStarted = computed(() => {
    const status = this.carState().status;
    return status === 'started' || status === 'driving';
  });

  isEngineStopped = computed(() => {
    return this.carState().status === 'stopped';
  });
}
