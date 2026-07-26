import { Component, computed, effect, input, output, signal } from '@angular/core';
import { form, FormField, FormRoot, required, submit } from '@angular/forms/signals';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';

import { Car } from '../../types/car';
import { CarView } from '../car-view/car-view';

@Component({
  selector: 'app-car-form',
  standalone: true,
  imports: [
    FormField,
    FormRoot,
    HlmInputImports,
    HlmFieldImports,
    HlmButtonImports,
    HlmSwitchImports,
    CarView,
  ],
  templateUrl: './car-form.html',
  host: {
    class: 'block w-full',
  },
})
export class CarForm {
  initialCar() {
    throw new Error('Method not implemented.');
  }
  readonly initialData = input<Car | null>(null);

  protected readonly carModel = signal({
    name: '',
    color: '#000000',
    isDriving: false,
  });

  protected readonly carForm = form(this.carModel, (f) => {
    required(f.name);
    required(f.color);
  });

  protected readonly previewCar = computed<Car>(() => ({
    id: 0,
    name: this.carForm.name().value() || 'Car Preview',
    color: this.carForm.color().value(),
  }));

  readonly save = output<Car>();
  readonly isBusy = input<boolean>(false);

  constructor() {
    effect(() => {
      const data = this.initialData();
      this.carModel.set({
        name: data?.name ?? '',
        color: data?.color ?? '#000000',
        isDriving: false,
      });
    });
  }

  protected onSubmit(): void {
    submit(this.carForm, async () => {
      if (!this.carForm().dirty() || !this.carForm().valid() || this.isBusy()) return;

      const { name, color } = this.carModel();

      const existing = this.initialData();

      this.save.emit({ name, color, id: existing ? existing.id : -1 });
    });
  }
}
