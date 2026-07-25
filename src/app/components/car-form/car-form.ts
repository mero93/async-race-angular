import { Component, computed, input, output, signal } from '@angular/core';
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
  protected readonly initialData = input<Pick<Car, 'color' | 'name'>>({
    name: '',
    color: '#000000',
  });

  protected readonly carModel = signal({
    name: this.initialData().name,
    color: this.initialData().color,
    isDriving: false,
  });

  protected readonly carForm = form(this.carModel, (f) => {
    required(f.name);
    required(f.color);
  });

  protected readonly previewCar = computed<Car>(() => ({
    id: 0,
    name: this.carForm.name().value() || 'Car Preview',
    color: this.carForm.color().value() || '#000000',
  }));

  readonly save = output<Pick<Car, 'color' | 'name'>>();

  protected onSubmit(): void {
    submit(this.carForm, async () => {
      if (!this.carForm().dirty() || !this.carForm().valid()) return;

      const { name, color } = this.carModel();

      this.save.emit({ name, color });
    });
  }
}
