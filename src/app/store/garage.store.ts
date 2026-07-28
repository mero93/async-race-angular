import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { RaceApiService } from '../services/race-api.service';
import { RaceEventsService } from '../services/race-events.service';
import { Car, CarState } from '../types/car';

const ITEMS_PER_PAGE = 7;
const MS_TO_SEC = 1000;
const ROUND_SIGNIFICANCE = 2;
const PERCENTAGE = 100;

function calculateProgress(startTime: number | null, duration: number): number {
  if (!startTime || duration <= 0) return 0;
  const elapsed = performance.now() - startTime;
  return Math.min(PERCENTAGE, Math.max(0, (elapsed / duration) * PERCENTAGE));
}

export interface GarageState {
  cars: Car[];
  totalCount: number;
  currentPage: number;
  carStates: Record<number, CarState>;
  isBusy: boolean;
  isLoading: boolean;
  raceWinner: { car: Car; time: number } | null;
}

const initialState: GarageState = {
  cars: [],
  totalCount: 0,
  currentPage: 1,
  carStates: {},
  isBusy: false,
  isLoading: false,
  raceWinner: null,
};

export const GarageStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ totalCount, carStates }) => ({
    totalPages: computed(() => Math.ceil(totalCount() / ITEMS_PER_PAGE)),

    isRacing: computed(() => {
      const states = Object.values(carStates());
      return states.some((s) => s.status === 'started' || s.status === 'driving');
    }),

    isPristine: computed(() => {
      const states = Object.values(carStates());
      if (states.length === 0) return true;
      return states.every((s) => s.status === 'stopped' && s.currentPosition === 0);
    }),
  })),

  withMethods((store, api = inject(RaceApiService)) => ({
    async loadCars(page: number) {
      patchState(store, { isLoading: true });
      try {
        const data = await firstValueFrom(api.getCars(page));
        patchState(store, {
          cars: data.items,
          totalCount: data.totalCount,
          currentPage: page,
        });
      } catch (err) {
        console.error('Failed to load cars', err);
      } finally {
        patchState(store, { isLoading: false });
      }
    },
  })),

  withMethods((store) => {
    const createDefaultState = (id: number): CarState => ({
      id,
      status: 'stopped',
      currentPosition: 0,
      startTime: null,
      duration: 0,
    });

    return {
      getCarStateOrDefault: (id: number) => store.carStates()[id] ?? createDefaultState(id),

      updateCarState(id: number, partialState: Partial<CarState>) {
        patchState(store, (state) => ({
          carStates: {
            ...state.carStates,
            [id]: {
              ...(state.carStates[id] ?? createDefaultState(id)),
              ...partialState,
            },
          },
        }));
      },

      removeCarState(id: number) {
        patchState(store, (state) => {
          const remainingStates = { ...state.carStates };
          delete remainingStates[id];
          return { carStates: remainingStates };
        });
      },
    };
  }),

  withMethods((store, api = inject(RaceApiService)) => ({
    async createNewCar(name: string, color: string) {
      patchState(store, { isBusy: true });
      try {
        await firstValueFrom(api.createCar({ name, color }));
        await store.loadCars(store.currentPage());
      } catch (err) {
        console.error('Failed to create car', err);
      } finally {
        patchState(store, { isBusy: false });
      }
    },
  })),

  withMethods((store, api = inject(RaceApiService), events = inject(RaceEventsService)) => ({
    async updateExistingCar(id: number, name: string, color: string) {
      patchState(store, { isBusy: true });
      try {
        const updatedCar = await firstValueFrom(api.updateCar(id, { name, color }));
        events.notifyUpdateRequest();
        patchState(store, (state) => ({
          cars: state.cars.map((car) => (car.id === id ? updatedCar : car)),
        }));
      } catch (err) {
        console.error('Failed to update car', err);
      } finally {
        patchState(store, { isBusy: false });
      }
    },
  })),

  withMethods((store, api = inject(RaceApiService), events = inject(RaceEventsService)) => ({
    async removeCar(id: number): Promise<{ wasLastOnPage: boolean }> {
      patchState(store, { isBusy: true });
      const currentPage = store.currentPage();
      const currentCars = store.cars();
      const shouldGoPrevPage = currentCars.length === 1 && currentPage > 1;
      const hasCarsLeftOnCurrentPage = currentCars.length > 1;

      try {
        await firstValueFrom(api.deleteCar(id));
        await firstValueFrom(api.deleteWinner(id))
          .then(() => events.notifyUpdateRequest())
          .catch(() => {
            /* empty */
          });

        store.removeCarState(id);

        if (shouldGoPrevPage) {
          patchState(store, (state) => ({
            totalCount: Math.max(0, state.totalCount - 1),
          }));
          return { wasLastOnPage: true };
        }

        if (hasCarsLeftOnCurrentPage) {
          await store.loadCars(currentPage);
        } else {
          patchState(store, (state) => ({
            cars: state.cars.filter((car) => car.id !== id),
            totalCount: Math.max(0, state.totalCount - 1),
          }));
        }

        return { wasLastOnPage: false };
      } catch (err) {
        console.error('Failed to remove car', err);
        return { wasLastOnPage: false };
      } finally {
        patchState(store, { isBusy: false });
      }
    },
  })),

  withMethods((_, api = inject(RaceApiService), events = inject(RaceEventsService)) => ({
    async registerWinner(winnerCar: Car, timeInSeconds: number) {
      try {
        const result = await firstValueFrom(api.upsertWinner(winnerCar.id, timeInSeconds));
        events.notifyUpdateRequest();
        return result;
      } catch (err) {
        console.error(`Failed to register winner record for car ${winnerCar.id}`, err);
        return null;
      }
    },
  })),

  // Individual Engine Controls
  withMethods((store, api = inject(RaceApiService)) => ({
    async stopEngine(id: number) {
      try {
        await firstValueFrom(api.startStopEngine(id, 'stopped'));
      } catch (err) {
        console.error(`Failed to stop engine ${id}`, err);
      } finally {
        store.updateCarState(id, {
          status: 'stopped',
          currentPosition: 0,
          startTime: null,
          duration: 0,
        });
      }
    },
  })),

  withMethods((store, api = inject(RaceApiService)) => ({
    async startEngine(id: number) {
      store.updateCarState(id, {
        status: 'started',
        currentPosition: 0,
        duration: 0,
      });

      try {
        const data = await firstValueFrom(api.startStopEngine(id, 'started'));
        const duration = Math.round(data.distance / data.velocity);

        store.updateCarState(id, {
          status: 'driving',
          startTime: performance.now(),
          duration,
        });

        await firstValueFrom(api.driveMode(id));

        if (store.getCarStateOrDefault(id).status === 'stopped') {
          return null;
        }

        store.updateCarState(id, {
          status: 'stopped',
          currentPosition: PERCENTAGE,
        });

        return { ...data, duration };
      } catch {
        const state = store.getCarStateOrDefault(id);

        if (state.status !== 'stopped') {
          const breakPosition = calculateProgress(state.startTime, state.duration);

          store.updateCarState(id, {
            status: 'broken',
            currentPosition: breakPosition,
          });
        }

        return null;
      }
    },
  })),

  withMethods((store) => ({
    snapshotActiveCars() {
      const states = store.carStates();
      let updatedStates: Record<number, CarState> | null = null;

      Object.entries(states).forEach(([idStr, state]) => {
        if (state.status === 'driving') {
          const id = Number(idStr);
          const progress = calculateProgress(state.startTime, state.duration);

          updatedStates ??= { ...states };
          updatedStates[id] = { ...state, currentPosition: progress };
        }
      });

      if (updatedStates) {
        console.log('snapshot taken', updatedStates);
        patchState(store, { carStates: updatedStates });
      }
    },

    syncCarStatesOnReentry() {
      const states = store.carStates();
      let updatedStates: Record<number, CarState> | null = null;

      Object.entries(states).forEach(([idStr, state]) => {
        if (state.status === 'driving') {
          const id = Number(idStr);
          const progress = calculateProgress(state.startTime, state.duration);

          updatedStates ??= { ...states };
          updatedStates[id] = {
            ...state,
            currentPosition: progress,
          };
        }
      });

      if (updatedStates) {
        console.log('2. states synced:', updatedStates);
        patchState(store, { carStates: updatedStates });
      }
    },
  })),

  withMethods((store) => ({
    async resetAll() {
      patchState(store, { isBusy: true });
      try {
        const currentCars = store.cars();

        await Promise.all(
          currentCars.map(async (car) => {
            const state = store.getCarStateOrDefault(car.id);

            if (state.status === 'stopped') {
              if (state.currentPosition !== 0 || state.duration !== 0) {
                store.updateCarState(car.id, {
                  currentPosition: 0,
                  startTime: null,
                  duration: 0,
                });
              }
            } else {
              await store.stopEngine(car.id);
            }
          }),
        );
      } finally {
        patchState(store, { isBusy: false });
      }
    },

    clearWinner() {
      patchState(store, { raceWinner: null });
    },

    declareWinner(car: Car, time: number): boolean {
      if (!store.raceWinner()) {
        patchState(store, { raceWinner: { car, time } });
        return true;
      }
      return false;
    },
  })),

  withMethods((store) => ({
    async startRace(): Promise<{ car: Car; time: number } | null> {
      if (!store.isPristine()) {
        await store.resetAll();
      }

      patchState(store, { isBusy: true });
      store.clearWinner();

      try {
        const currentCars = store.cars();
        if (currentCars.length === 0) return null;

        const racePromises = currentCars.map(async (car) => {
          const result = await store.startEngine(car.id);

          if (result) {
            const timeInSec = +(result.duration / MS_TO_SEC).toFixed(ROUND_SIGNIFICANCE);

            const isFirst = store.declareWinner(car, timeInSec);

            if (isFirst) {
              await store.registerWinner(car, timeInSec);
            }
          }
        });

        await Promise.all(racePromises);

        return store.raceWinner();
      } finally {
        patchState(store, { isBusy: false });
      }
    },
  })),

  withMethods((store, api = inject(RaceApiService)) => ({
    async generateRandomCars(count = 100) {
      patchState(store, { isBusy: true });
      try {
        await api.generateRandomCars(count);
        await store.loadCars(store.currentPage());
      } catch (err) {
        console.error('Failed to generate random cars', err);
      } finally {
        patchState(store, { isBusy: false });
      }
    },
  })),
);
