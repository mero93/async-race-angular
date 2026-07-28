import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, firstValueFrom, map, Observable, switchMap, throwError } from 'rxjs';

import carNamesData from '../../assets/data/car-names.json';
import { Car, Engine } from '../types/car';
import { SortBy, SortOrder, Winner } from '../types/winner';

const apiUrl = 'http://127.0.0.1:3000';

const MAX_HEX_COLOR_VALUE = 0xffffff;
const HEX_BASE = 16;
const HEX_COLOR_STRING_LENGTH = 6;
const MAX_CRYPTO_VALUE = 0x100000000;
const GARAGE_PAGE_SIZE = 7;

@Injectable({
  providedIn: 'root',
})
export class RaceApiService {
  private readonly http = inject(HttpClient);

  public getCars(
    page: number,
    limit = GARAGE_PAGE_SIZE,
  ): Observable<{ items: Car[]; totalCount: number }> {
    const params = new HttpParams().set('_page', page.toString()).set('_limit', limit.toString());

    return this.http.get<Car[]>(`${apiUrl}/garage`, { params, observe: 'response' }).pipe(
      map((response: HttpResponse<Car[]>) => {
        if (!response.body) {
          throw new Error('Response body is missing');
        }
        return {
          items: response.body,
          totalCount: Number(response.headers.get('X-Total-Count')) || 0,
        };
      }),
      catchError((error) => {
        console.error('API Error in getCars:', error);
        return throwError(() => new Error(error.message || 'Failed to fetch garage data'));
      }),
    );
  }

  public getCar(id: number): Observable<Car> {
    return this.http
      .get<Car>(`${apiUrl}/garage/${id}`)
      .pipe(
        catchError((error) => throwError(() => new Error(error.message || 'Failed to fetch car'))),
      );
  }

  public createCar(car: Omit<Car, 'id'>): Observable<Car> {
    return this.http
      .post<Car>(`${apiUrl}/garage`, car)
      .pipe(
        catchError((error) => throwError(() => new Error(error.message || 'Failed to create car'))),
      );
  }

  public deleteCar(id: number): Observable<void> {
    return this.http
      .delete<void>(`${apiUrl}/garage/${id}`)
      .pipe(
        catchError((error) => throwError(() => new Error(error.message || 'Failed to delete car'))),
      );
  }

  public updateCar(id: number, car: Omit<Partial<Car>, 'id'>): Observable<Car> {
    return this.http
      .put<Car>(`${apiUrl}/garage/${id}`, car)
      .pipe(
        catchError((error) => throwError(() => new Error(error.message || 'Failed to update car'))),
      );
  }

  public startStopEngine(id: number, status: 'started' | 'stopped'): Observable<Engine> {
    const params = new HttpParams().set('id', id.toString()).set('status', status);

    return this.http
      .patch<Engine>(`${apiUrl}/engine`, null, { params })
      .pipe(
        catchError((error) =>
          throwError(() => new Error(error.message || 'Failed to manage engine')),
        ),
      );
  }

  public driveMode(id: number): Observable<{ success: boolean }> {
    const params = new HttpParams().set('id', id.toString()).set('status', 'drive');

    return this.http
      .patch<{ success: boolean }>(`${apiUrl}/engine`, null, { params })
      .pipe(catchError((error) => throwError(() => error)));
  }

  public getWinners(
    page: number,
    limit = 10,
    sort?: SortBy,
    order?: SortOrder,
  ): Observable<{ items: Winner[]; totalCount: number }> {
    let params = new HttpParams().set('_page', page.toString()).set('_limit', limit.toString());
    if (sort && order) {
      params = params.set('_sort', sort).set('_order', order);
    }

    return this.http.get<Winner[]>(`${apiUrl}/winners`, { params, observe: 'response' }).pipe(
      map((response: HttpResponse<Winner[]>) => {
        if (!response.body) {
          throw new Error('Response body is missing');
        }
        return {
          items: response.body,
          totalCount: Number(response.headers.get('X-Total-Count')) || 0,
        };
      }),
      catchError((error) =>
        throwError(() => new Error(error.message || 'Failed to fetch winners')),
      ),
    );
  }

  public getWinner(id: number): Observable<Winner> {
    return this.http
      .get<Winner>(`${apiUrl}/winners/${id}`)
      .pipe(
        catchError((error) =>
          throwError(() => new Error(error.message || 'Failed to fetch winner')),
        ),
      );
  }

  public deleteWinner(id: number): Observable<void> {
    return this.http
      .delete<void>(`${apiUrl}/winners/${id}`)
      .pipe(
        catchError((error) =>
          throwError(() => new Error(error.message || 'Failed to delete winner')),
        ),
      );
  }

  private updateWinner(winner: Winner): Observable<Winner> {
    const { id, ...rest } = winner;
    return this.http
      .put<Winner>(`${apiUrl}/winners/${id}`, rest)
      .pipe(
        catchError((error) =>
          throwError(() => new Error(error.message || 'Failed to update winner')),
        ),
      );
  }

  private createWinner(winner: Winner): Observable<Winner> {
    return this.http
      .post<Winner>(`${apiUrl}/winners`, winner)
      .pipe(
        catchError((error) =>
          throwError(() => new Error(error.message || 'Failed to create winner')),
        ),
      );
  }

  public upsertWinner(winnerId: number, time: number): Observable<Winner> {
    return this.getWinner(winnerId).pipe(
      switchMap((existing) => {
        const updatedWinner: Winner = {
          id: winnerId,
          wins: existing.wins + 1,
          time: Math.min(time, existing.time),
        };
        return this.updateWinner(updatedWinner);
      }),
      catchError(() => {
        const newWinner: Winner = {
          id: winnerId,
          wins: 1,
          time: time,
        };
        return this.createWinner(newWinner);
      }),
    );
  }

  private getRandomFloat(): number {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0] / MAX_CRYPTO_VALUE;
  }

  private getRandomColor(): string {
    return (
      '#' +
      Math.floor(this.getRandomFloat() * MAX_HEX_COLOR_VALUE)
        .toString(HEX_BASE)
        .padStart(HEX_COLOR_STRING_LENGTH, '0')
    );
  }

  private getRandomArrayItem(arr: string[]): string {
    return arr[Math.floor(this.getRandomFloat() * arr.length)];
  }

  private generateRandomCarName(): string {
    const brand = this.getRandomArrayItem(carNamesData['car-manufacturers']);
    const model = this.getRandomArrayItem(carNamesData['car-models']);

    return `${brand} ${model}`;
  }

  public async generateRandomCars(count = 100): Promise<Car[]> {
    const requests = Array.from({ length: count }, () => {
      const name = this.generateRandomCarName();
      const color = this.getRandomColor();

      return firstValueFrom(this.createCar({ name, color }));
    });

    return Promise.all(requests);
  }
}
