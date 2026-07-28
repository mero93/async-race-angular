import { Component, input } from '@angular/core';

@Component({
  selector: 'app-car-track-lane-skeleton',
  imports: [],
  templateUrl: './car-track-lane-skeleton.html',
  host: {
    class: 'block w-full box-border overflow-hidden',
    '[style.height.px]': 'height()',
  },
})
export class CarTrackLaneSkeleton {
  readonly height = input<number | null>(null);
}
