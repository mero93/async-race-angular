import { Component } from '@angular/core';
import { LucideCirclePlus, LucideCog, LucideFlag, LucideRotateCcw } from '@lucide/angular';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { CarForm } from '../../components/car-form/car-form';

@Component({
  selector: 'app-garage',
  imports: [HlmButtonImports, LucideCirclePlus, LucideCog, LucideFlag, LucideRotateCcw, CarForm],
  templateUrl: './garage.html',
})
export default class Garage {}
