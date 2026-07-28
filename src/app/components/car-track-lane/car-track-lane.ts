import {
  Component,
  computed,
  effect,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LucidePencil, LucidePlay, LucideSquare, LucideTrash2 } from '@lucide/angular';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { Car, CarState } from '../../types/car';
import { CarView } from '../car-view/car-view';

const FINISH_LINE_PERCENT = 100;
const CAR_WIDTH_PX = 160;
const CONTAINER_PADDING_PX = 32;

@Component({
  selector: 'app-car-track-lane',
  standalone: true,
  imports: [HlmButtonImports, LucidePencil, LucideTrash2, LucidePlay, LucideSquare, CarView],
  templateUrl: './car-track-lane.html',
})
export class CarTrackLane {
  readonly car = input.required<Car>();
  readonly carState = input.required<CarState>();
  readonly isBusy = input<boolean>(false);

  readonly editCar = output<Car>();
  readonly removeCar = output<number>();
  readonly startEngine = output<number>();
  readonly stopEngine = output<number>();

  readonly trackContainer = viewChild<ElementRef<HTMLDivElement>>('trackContainer');

  protected readonly currentPosPx = signal<number>(0);

  protected readonly currentTransformStyle = computed(() => `translateX(${this.currentPosPx()}px)`);

  protected readonly canStartEngine = computed(() => {
    const state = this.carState();
    return state.status === 'stopped' && (state.currentPosition ?? 0) === 0;
  });

  protected readonly canStopEngine = computed(() => {
    const state = this.carState();
    const pos = state.currentPosition ?? 0;

    return (
      state.status === 'driving' ||
      state.status === 'started' ||
      state.status === 'broken' ||
      pos > 0
    );
  });

  private animFrameId: number | null = null;

  constructor() {
    effect((onCleanup) => {
      const state = this.carState();
      const containerEl = this.trackContainer()?.nativeElement;
      if (!containerEl) return;

      this.clearAnimation();
      onCleanup(() => this.clearAnimation());

      const totalTrackPx = containerEl.clientWidth - CAR_WIDTH_PX - CONTAINER_PADDING_PX;
      const percentToPx = (p: number) => (p / FINISH_LINE_PERCENT) * totalTrackPx;

      if (state.status === 'driving') {
        this.runAnimation(totalTrackPx, state.duration, state.startTime);
      } else {
        this.currentPosPx.set(percentToPx(state.currentPosition ?? 0));
      }
    });
  }

  private clearAnimation(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private runAnimation(
    totalTrackPx: number,
    duration: number,
    storeStartTime: number | null,
  ): void {
    if (!storeStartTime) return;

    const animate = () => {
      const elapsed = performance.now() - storeStartTime;
      const progressRatio = Math.min(1, Math.max(0, elapsed / duration));
      const currentPx = progressRatio * totalTrackPx;

      this.currentPosPx.set(currentPx);

      if (progressRatio < 1 && this.carState().status === 'driving') {
        this.animFrameId = requestAnimationFrame(animate);
      }
    };

    this.animFrameId = requestAnimationFrame(animate);
  }

  protected onStartEngine(): void {
    if (this.canStartEngine()) {
      this.startEngine.emit(this.car().id);
    }
  }

  protected onStopEngine(): void {
    if (this.canStopEngine()) {
      this.stopEngine.emit(this.car().id);
    }
  }
}
