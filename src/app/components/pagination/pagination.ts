import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { LucideChevronLeft, LucideChevronRight, LucideEllipsis } from '@lucide/angular';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';

const FIRST_PAGE = 1;
const MIN_PAGE_COUNT_FOR_MIDDLE = 2;
const PAGES_IN_MIDDLE = 3;
const MIDDLE_HALF_SPAN = Math.floor(PAGES_IN_MIDDLE / 2);

const EARLY_PAGE_THRESHOLD = 2;
const LATE_PAGE_OFFSET = 1;

const EARLY_END_PAGE = 4;
const LATE_START_OFFSET = 3;

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [
    CommonModule,
    HlmPaginationImports,
    LucideChevronLeft,
    LucideChevronRight,
    LucideEllipsis,
  ],
  templateUrl: './pagination.html',
  host: {
    class: 'block w-full',
  },
})
export class Pagination {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly disabled = input<boolean>(false);

  readonly pageChange = output<number>();

  readonly pages = computed<(number | '...')[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 1) return [FIRST_PAGE];

    if (total <= MIN_PAGE_COUNT_FOR_MIDDLE + 2) {
      return Array.from({ length: total }, (_, i) => i + FIRST_PAGE);
    }

    const firstMiddlePage = FIRST_PAGE + 1;
    const lastMiddlePage = total - LATE_PAGE_OFFSET;

    let start = Math.max(firstMiddlePage, current - MIDDLE_HALF_SPAN);
    let end = Math.min(lastMiddlePage, current + MIDDLE_HALF_SPAN);

    if (current <= EARLY_PAGE_THRESHOLD) {
      end = Math.min(lastMiddlePage, EARLY_END_PAGE);
    } else if (current >= total - LATE_PAGE_OFFSET) {
      start = Math.max(firstMiddlePage, total - LATE_START_OFFSET);
    }

    const result: (number | '...')[] = [FIRST_PAGE];

    if (start > firstMiddlePage) result.push('...');
    for (let i = start; i <= end; i++) result.push(i);
    if (end < lastMiddlePage) result.push('...');
    result.push(total);

    return result;
  });
}
