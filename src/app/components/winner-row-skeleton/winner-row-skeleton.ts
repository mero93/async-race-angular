import { Component } from '@angular/core';

@Component({
  selector: 'app-winner-row-skeleton',
  standalone: true,
  templateUrl: './winner-row-skeleton.html',
  host: {
    class: 'border-b border-border/40 animate-pulse',
  },
})
export class WinnerRowSkeleton {}
