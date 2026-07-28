import { inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { catchError, firstValueFrom, forkJoin, map, of } from 'rxjs';

import { RaceApiService } from '../services/race-api.service';
import { RaceEventsService } from '../services/race-events.service';
import { SortBy, SortOrder, Winner, WinnerWithCar } from '../types/winner';

const WINNERS_PER_PAGE = 10;

interface WinnersState {
  winners: WinnerWithCar[];
  totalWinners: number;
  currentPage: number;
  sortBy: SortBy | undefined;
  sortOrder: SortOrder;
  isLoading: boolean;
}

const initialState: WinnersState = {
  winners: [],
  totalWinners: 0,
  currentPage: 1,
  sortBy: undefined,
  sortOrder: 'ASC',
  isLoading: false,
};

async function fetchWinnersWithCars(
  api: RaceApiService,
  winners: Winner[],
): Promise<WinnerWithCar[]> {
  if (winners.length === 0) return [];

  const requests = winners.map((winner) =>
    api.getCar(winner.id).pipe(
      map((car) => ({ ...winner, car })),
      catchError(() =>
        of({
          ...winner,
          car: { id: winner.id, name: 'Unknown Car', color: '#888888' },
        }),
      ),
    ),
  );

  return firstValueFrom(forkJoin(requests));
}

function shuffleSortState(
  currentSort: SortBy | undefined,
  currentOrder: SortOrder,
  field: SortBy,
): { sortBy: SortBy | undefined; sortOrder: SortOrder } {
  if (currentSort !== field) {
    return { sortBy: field, sortOrder: 'ASC' };
  }
  if (currentOrder === 'ASC') {
    return { sortBy: field, sortOrder: 'DESC' };
  }
  return { sortBy: undefined, sortOrder: 'ASC' };
}

export const WinnersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    totalPages: () => Math.ceil(store.totalWinners() / WINNERS_PER_PAGE) || 1,
  })),

  withMethods((store, api = inject(RaceApiService)) => ({
    async loadWinners() {
      patchState(store, { isLoading: true });

      try {
        const response = await firstValueFrom(
          api.getWinners(store.currentPage(), WINNERS_PER_PAGE, store.sortBy(), store.sortOrder()),
        );

        const totalCount = response.totalCount || 0;
        const winnersData = response.items || [];
        const winnersWithCars = await fetchWinnersWithCars(api, winnersData);

        patchState(store, {
          winners: winnersWithCars,
          totalWinners: totalCount,
          isLoading: false,
        });
      } catch (err) {
        console.error('Failed to load winners', err);
        patchState(store, { isLoading: false });
      }
    },
  })),

  withMethods((store) => ({
    async setPage(page: number) {
      if (page >= 1 && page <= store.totalPages()) {
        patchState(store, { currentPage: page });
        await store.loadWinners();
      }
    },

    async toggleSort(field: SortBy) {
      const nextSort = shuffleSortState(store.sortBy(), store.sortOrder(), field);
      patchState(store, nextSort);
      await store.loadWinners();
    },
  })),

  withHooks({
    onInit(store, events = inject(RaceEventsService)) {
      store.loadWinners();

      events.winnerRegistered$.subscribe(() => {
        store.loadWinners();
      });
    },
  }),
);
