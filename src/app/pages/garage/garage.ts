import { Component } from '@angular/core';
import { LucideCirclePlus, LucideCog, LucideFlag, LucideRotateCcw } from '@lucide/angular';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-garage',
  imports: [HlmButtonImports, LucideCirclePlus, LucideCog, LucideFlag, LucideRotateCcw],
  templateUrl: './garage.html',
})
export default class Garage {}
