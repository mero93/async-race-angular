import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RaceEventsService {
  private readonly winnerRegisteredSubject = new Subject<void>();
  readonly winnerRegistered$ = this.winnerRegisteredSubject.asObservable();

  notifyWinnerRegistered(): void {
    this.winnerRegisteredSubject.next();
  }
}
