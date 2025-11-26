import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonButton, IonInput } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';
import { Toster } from '../services/toster';

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
  private tosterService = inject(Toster);

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
      let name = this.emp_name.value;
      let password = this.password.value;
      if(name && password){
        
        name = name.toLowerCase().trim();
        password = password.toLowerCase().trim();
        if(name.length < 3 || password.length < 3){
          this.tosterService.presentToast('Invalid credentials', 3000, 'toaster-error');
          return;
        }else if(name === 'demo' && password === 'demo'){
          this.authService.login(name);
          this.router.navigate(['/chat']);
        }else{
          this.tosterService.presentToast('Invalid credentials', 3000, 'toaster-error');
          return;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  }
}
