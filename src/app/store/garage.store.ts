import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { RaceApiService } from '../services/race-api.service';
import { Car, CarState } from '../types/car';

const ITEMS_PER_PAGE = 7;

export interface GarageState {
  cars: Car[];
  totalCount: number;
  currentPage: number;
  carStates: Record<number, CarState>;
}

const initialState: GarageState = {
  cars: [],
  totalCount: 0,
  currentPage: 1,
  carStates: {},
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
      try {
        const data = await firstValueFrom(api.getCars(page));
        patchState(store, {
          cars: data.items,
          totalCount: data.totalCount,
          currentPage: page,
        });
      } catch (err) {
        console.error('Failed to load cars', err);
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
      try {
        await firstValueFrom(api.createCar({ name, color }));
        await store.loadCars(store.currentPage());
      } catch (err) {
        console.error('Failed to create car', err);
      }
    },

    async updateExistingCar(id: number, name: string, color: string) {
      try {
        const updatedCar = await firstValueFrom(api.updateCar(id, { name, color }));
        patchState(store, (state) => ({
          cars: state.cars.map((car) => (car.id === id ? updatedCar : car)),
        }));
      } catch (err) {
        console.error('Failed to update car', err);
      }
    },

    async removeCar(id: number): Promise<{ wasLastOnPage: boolean }> {
      const shouldGoPrevPage = store.cars().length === 1 && store.currentPage() > 1;

      try {
        await firstValueFrom(api.deleteCar(id));
        await firstValueFrom(api.deleteWinner(id)).catch(() => {
          /* empty */
        });
        store.removeCarState(id);
        return { wasLastOnPage: shouldGoPrevPage };
      } catch (err) {
        console.error('Failed to remove car', err);
        return { wasLastOnPage: false };
      }
    },
  })),

  withMethods((_, api = inject(RaceApiService)) => ({
    async registerWinner(winnerCar: Car, timeInSeconds: number) {
      try {
        return await firstValueFrom(api.upsertWinner(winnerCar.id, timeInSeconds));
      } catch (err) {
        console.error(`Failed to register winner record for car ${winnerCar.id}`, err);
        return null;
      }
    },
  })),

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

    async startEngine(id: number) {
      store.updateCarState(id, { status: 'started' });
      try {
        const data = await firstValueFrom(api.startStopEngine(id, 'started'));
        const duration = data.distance / data.velocity;

        store.updateCarState(id, {
          status: 'driving',
          startTime: performance.now(),
          duration,
        });

        await firstValueFrom(api.driveMode(id));
        return data;
      } catch {
        const currentStatus = store.getCarStateOrDefault(id).status;
        const nextStatus = currentStatus === 'driving' ? 'broken' : 'stopped';
        store.updateCarState(id, { status: nextStatus });

        return null;
      }
    },
  })),
);
