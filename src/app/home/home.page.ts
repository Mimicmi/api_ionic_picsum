import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Plugins } from '@capacitor/core';

const { Network } = Plugins;

import { AlertController, ToastController } from '@ionic/angular';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  apiData: any;
  limit = 5;

  constructor(
    private http: HttpClient,
    public alertController: AlertController,
    public toastController: ToastController
  ) {
    this.toastController.create({ animated: false }).then(t => { t.present(); t.dismiss(); });
  }

  async getData(event = undefined) {
    let status = await Network.getStatus();
    if (!status.connected) {
      this.showOffline("WARNING YOU ARE OFFLINE");
      return;
    }

    const URL = "https://picsum.photos/v2/list?limit=" + this.limit;
    this.http.get(URL).subscribe((data) => {
      this.apiData = data;
      this.apiData.reverse();
      if (event) event.target.complete();
      console.log('Données récupérées:', data);
    });
  }

  doRefresh(event) {
    console.log('Begin async operation');
    this.limit += 2;
    this.getData(event);

    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  presentAlert() {
    this.alertController.create({
      header: 'Use this lightsaber?',
      message: 'Do you agree to use this lightsaber to do good across the galaxy?',
      buttons: ['Disagree', 'Agree']
    }).then(res => {
      res.present();
    });
  }


  async showOffline(message: string) {
    const toast = await this.toastController.create({
      message: message,
      // duration: 2000
      buttons: [
        {

          text: 'Done',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]

    });
    toast.present();
  }


  ionViewWillEnter() {
    this.getData();
    let handler = Network.addListener('networkStatusChange', (status) => {
      if (!status.connected) {
        // alert("Warning ! This app need network connection");
        this.presentAlert();
      }
      const message = !status.connected ? "Warning! You are offline" : "You are online";
      this.showOffline(message);
      console.log("Network status changed", status);
    });
  }
}
