import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideCarFront, LucideMenu, LucideTrophy } from '@lucide/angular';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    HlmButtonImports,
    HlmDialogImports,
    NgOptimizedImage,
    LucideMenu,
    LucideTrophy,
    LucideCarFront,
  ],
  templateUrl: './header.html',
  host: {
    class:
      'block w-full border-b border-border/40 bg-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-secondary/60 sticky top-0 z-50',
  },
})
export class Header {}
