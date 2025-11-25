import { inject, Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
import { addIcons } from "ionicons";
import { alertCircleOutline } from 'ionicons/icons';

@Injectable({
  providedIn: 'root',
})
export class Toster {

  private toastCtrl = inject(ToastController);
  constructor() {
    addIcons({ alertCircleOutline }); // Register the icons
  }

  async presentToast(mesage: string, dura?: number, colorCss?: string) {
    if (!dura) {
      dura = 4000;
    }
    if(!colorCss) {
      colorCss = 'toaster-success ';
    }
    const toast = await this.toastCtrl.create({
      message: mesage,
      duration: dura,
      icon: alertCircleOutline,
      cssClass: colorCss,
      position: 'bottom'
    });
    toast.present();
  }
}
