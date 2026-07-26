import { Component, computed, input } from '@angular/core';

import { Car, CarState } from '../../types/car';

@Component({
  selector: 'app-car-view',
  standalone: true,
  templateUrl: './car-view.html',
  host: {
    class: 'block w-full max-w-sm',
  },
})
export class CarView {
  readonly car = input.required<Car>();
  readonly carState = input<CarState>();

  readonly driving = input<boolean>();

  readonly isDriving = computed(() => {
    const manualOverride = this.driving();
    if (manualOverride !== undefined) {
      return manualOverride;
    }

    const status = this.carState()?.status;
    return status === 'driving';
  });

  readonly carColor = computed(() => this.car().color || '#ef4444');
}
