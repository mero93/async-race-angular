import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LucideArrowDown, LucideArrowUp, LucideArrowUpDown } from '@lucide/angular';

import { CarView } from '../../components/car-view/car-view';
import { Pagination } from '../../components/pagination/pagination';
import { WinnerRowSkeleton } from '../../components/winner-row-skeleton/winner-row-skeleton';
import { WinnersStore } from '../../store/winners.store';
import { SortBy } from '../../types/winner';

const WINNERS_PER_PAGE = 10;

@Component({
  selector: 'app-winners',
  standalone: true,
  imports: [
    CommonModule,
    CarView,
    Pagination,
    LucideArrowUp,
    LucideArrowDown,
    LucideArrowUpDown,
    WinnerRowSkeleton,
  ],
  templateUrl: './winners.html',
  host: {
    class: 'block w-full',
  },
})
export default class Winners {
  readonly store = inject(WinnersStore);
  readonly skeletonItems = Array.from({ length: WINNERS_PER_PAGE });

  calculateRank(index: number): number {
    return (this.store.currentPage() - 1) * WINNERS_PER_PAGE + index + 1;
  }

  onSort(field: SortBy): void {
    this.store.toggleSort(field);
  }

  onPageChange(newPage: number): void {
    this.store.setPage(newPage);
  }
}
