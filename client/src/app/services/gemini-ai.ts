import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AIResResponse } from './ai-response.interface';

@Injectable({
  providedIn: 'root',
})
export class GeminiAi {

  private http = inject(HttpClient);

  async sendMessage(message: string): Promise<Observable<any>> {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
        })
      };
      return this.http.post<AIResResponse>(environment.geminiApiUrl, {
        prompt: message
      }, { responseType: 'json' })
        .pipe(
          map(response => {
            // console.log('Gemini AI Response:', response);
            let innerChunks = null, accordionText = '';
            const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (searchChunks) {
                  innerChunks = searchChunks.map(
                    chunk => chunk.retrievedContext.text.replace(/\n\n/g, '<br>').replace(/\n/g, '<br>')
                  ).join(', ');
            }
            return { "data" : (response.candidates[0].content.parts[0].text) ? response.candidates[0].content.parts[0].text : 'No response from AI.'
                    , "chunks" : (innerChunks ? innerChunks: '') };
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
