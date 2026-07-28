import {
  afterNextRender,
  Component,
  effect,
  ElementRef,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LucideCirclePlus,
  LucideCog,
  LucideFlag,
  LucideRotateCcw,
  LucideTrophy,
} from '@lucide/angular';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';

import { CarForm } from '../../components/car-form/car-form';
import { CarTrackLane } from '../../components/car-track-lane/car-track-lane';
import { CarTrackLaneSkeleton } from '../../components/car-track-lane-skeleton/car-track-lane-skeleton';
import { CarView } from '../../components/car-view/car-view';
import { Pagination } from '../../components/pagination/pagination';
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
    LucideTrophy,
    CarForm,
    CarView,
    Pagination,
    CarTrackLane,
    CarTrackLaneSkeleton,
  ],
  templateUrl: './garage.html',
})
export default class Garage implements OnInit, OnDestroy {
  readonly skeletonItems = Array.from({ length: 7 });
  readonly laneHeightPx = signal<number | null>(null);
  readonly firstLane = viewChild('firstLane', { read: ElementRef });

  readonly store = inject(GarageStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly selectedCar = signal<Car | null>(null);
  readonly winnerDialog = viewChild<HlmDialog>('winnerDialog');

  readonly isWinnerDialogOpen = signal(false);

  private readonly injector = inject(Injector);

  constructor() {
    effect(() => {
      const winner = this.store.raceWinner();
      this.isWinnerDialogOpen.set(!!winner);
    });

    effect(() => {
      const laneRef = this.firstLane();
      if (laneRef && !this.laneHeightPx()) {
        afterNextRender(
          () => {
            const el = laneRef.nativeElement;
            if (el) {
              const height = el.getBoundingClientRect().height;
              console.log('height measured:', height);
              this.laneHeightPx.set(height);
            }
          },
          { injector: this.injector },
        );
      }
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const pageParam = params['page'];

      if (!pageParam) {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { page: 1 },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
        return;
      }

      const pageNumber = Number(pageParam);
      const validPage = Number.isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;

      this.store.loadCars(validPage);
    });

    this.store.syncCarStatesOnReentry();
  }

  handleWinnerDialogStateChange(event: Event | string) {
    if (typeof event === 'string') {
      this.isWinnerDialogOpen.set(event === 'open');
    } else {
      this.isWinnerDialogOpen.set(false);
    }
  }

  ngOnDestroy() {
    this.store.snapshotActiveCars();
  }

  handleOpenCreateModal(dialog: HlmDialog) {
    this.selectedCar.set(null);
    dialog.open();
  }

  handleOpenEditModal(car: Car, dialog: HlmDialog) {
    this.selectedCar.set(car);
    dialog.open();
  }

  async handleSaveCar(data: Car | Pick<Car, 'name' | 'color'>, closeDialog: () => void) {
    try {
      if ('id' in data && data.id !== -1) {
        await this.store.updateExistingCar(data.id, data.name, data.color);
      } else {
        await this.store.createNewCar(data.name, data.color);
      }
      closeDialog();
    } finally {
      this.selectedCar.set(null);
    }
  }

  async handleGenerateCars() {
    await this.store.generateRandomCars();
  }

  handlePageChange(newPage: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: newPage },
      queryParamsHandling: 'merge',
    });
  }

  handleStartRace() {
    this.store.startRace();
  }

  async handleResetRace() {
    await this.store.resetAll();
  }

  protected measureLaneHeight(): void {
    const el = this.firstLane()?.nativeElement;
    if (el && !this.laneHeightPx()) {
      this.laneHeightPx.set(el.getBoundingClientRect().height);
    }
  }
}
