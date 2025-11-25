import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { GenkitResResponse } from './genkit-response.interface';

@Injectable({
  providedIn: 'root',
})
export class GenkitAi {
 private http = inject(HttpClient);

  async sendMessage(message: string): Promise<Observable<any>> {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
        })
      };
      return this.http.post<GenkitResResponse>(environment.geminiApiUrl, {
        input: message
      }, { responseType: 'json' })
        .pipe(
          map(response => {
            return { "data" : response.data ? response.data : 'No response from AI.'
                    , "chunks" : response.chunks ? response.chunks  : '' };
          }),
          catchError(this.handleError)
        );

  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

}
