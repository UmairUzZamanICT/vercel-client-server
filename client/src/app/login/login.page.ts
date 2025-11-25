import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonButton, IonInput } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonInput, IonButton, IonItem, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {

  private readonly authService = inject(Auth);
  private readonly router = inject(Router);

  credentials: FormGroup|any;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.credentials = this.fb.group({
			emp_name: ['', [Validators.required, Validators.minLength(3)]], //, Validators.email
			password: ['', [Validators.required, Validators.minLength(3)]]
		});
  }

  // Easy access for form fields
	get emp_name() {
		return this.credentials.get('emp_name');
	}

	get password() {
		return this.credentials.get('password');
	}

  login() {
    try {
      const name = this.emp_name.value;
      // console.log('Logging in with username:', name);
      if (name) {
        this.authService.login(name);
        this.router.navigate(['/chat']);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  }
}
