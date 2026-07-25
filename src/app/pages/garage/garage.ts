import { Component, inject } from '@angular/core';
import { LucideCirclePlus, LucideCog, LucideFlag, LucideRotateCcw } from '@lucide/angular';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';

import { CarForm } from '../../components/car-form/car-form';
import { GarageStore } from '../../store/garage.store';
import { Car } from '../../types/car';

@Component({
  selector: 'app-garage',
  imports: [
    HlmButtonImports,
    HlmDialogImports,
    LucideCirclePlus,
    LucideCog,
    LucideFlag,
    LucideRotateCcw,
    CarForm,
  ],
  templateUrl: './garage.html',
})
export default class Garage {
  readonly store = inject(GarageStore);

  async handleCreateCar(data: Pick<Car, 'name' | 'color'>, closeDialog: () => void) {
    await this.store.createNewCar(data.name, data.color);
    console.log(this.store.cars());
    closeDialog();
  }

  async handleGenerateCars() {
    await this.store.generateRandomCars();
    console.log(this.store.cars());
  }
}
