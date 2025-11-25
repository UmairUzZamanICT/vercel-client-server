import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private _name: string | null = null;

  login(name: string) {
    this._name = name;
    localStorage.setItem('emp_name', name);
  }

  logout() {
    this._name = null;
    localStorage.removeItem('emp_name');
  }

  get name(): string | null {
    if (!this._name) {
      this._name = localStorage.getItem('emp_name');
    }
    return this._name;
  }

  isLoggedIn(): boolean {
    return this.name !== null;
  }

}
