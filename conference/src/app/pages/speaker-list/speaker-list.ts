import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { File } from '@ionic-native/file/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { SocialSharing } from "@ionic-native/social-sharing/ngx";
import { ConferenceData } from '../../providers/conference-data';
import * as moment from 'moment';
import { from } from 'rxjs';
@Component({
  selector: 'page-speaker-list',
  templateUrl: 'speaker-list.html',
  styleUrls: ['./speaker-list.scss'],
})
export class SpeakerListPage {
  speakers: any[] = [];

  constructor(
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    public confData: ConferenceData,
    public inAppBrowser: InAppBrowser,
    public router: Router,
    public socialSharing: SocialSharing,
    public webView: WebView,
    private file: File,
    public localNotifications: LocalNotifications
  ) {
    
  }

  ionViewDidEnter() {
    this.confData.getSpeakers().subscribe((speakers: any[]) => {
      this.speakers = speakers;
      console.log(this.speakers, 'ionViewDidEnter');
      let time = moment(speakers[0].sessions[0].timeStart, ["h:mm A"]).format("HH:mm");
      console.log(typeof time);
      let n = this.speakers.map(i => {
        return {
          id: i.id,
          title: i.sessions[0].name,
          text: i.sessions[0].description,
          trigger: { every: { hour: + moment(i.sessions[0].timeStart, ["h:mm A"]).format("HH:mm").split(':')[0], minute: + moment(i.sessions[0].timeStart, ["h:mm A"]).format("HH:mm").split(':')[1] } },
          vibrate: true
        }
      })
    });

  }


  goToSpeakerTwitter(speaker: any) {
    this.inAppBrowser.create(
      `https://twitter.com/${speaker.twitter}`,
      '_blank'
    );
  }
  async openSpeakerShare(speaker: any) {
    console.log(speaker);
    console.log(this.file.applicationStorageDirectory);
    await this.file.createDir(this.file.applicationStorageDirectory, 'images', false).then(value => { console.log(value); }).catch(err => err);
    await this.file.checkDir(this.file.applicationStorageDirectory, 'images').then(data => { console.log(data); return data }).catch(err => err);
    await this.file.copyFile(`../../../assets/img/speakers`, speaker['name'], `${this.file.applicationStorageDirectory}/images`, speaker['name']).then(entry => {
      console.log(entry);
    }).catch(err => err);
    let imgFilePath = await `${this.file.applicationStorageDirectory}/images`;
    let resolvedDir;
    await this.file.resolveDirectoryUrl(imgFilePath).then(value => {
      resolvedDir = value;
    }).catch(err => err);
    console.log(resolvedDir);
    let fileObj;
    await this.file.getFile(resolvedDir, speaker['name'], { create: true }).then(value => {
      console.log(value, 'getfile');
      fileObj = value;
    }).catch(err => err);
    console.log(fileObj, 'filedata');
    let img = await this.webView.convertFileSrc(fileObj.nativeURL);
    console.log(img, 'hahahaha');
    // console.log(`http://localhost/${img}`);
    // console.log(`github.com/${speaker['github']}`);
    // console.log(speaker['sessions'][1]['name']);

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Share ' + speaker.name,
      buttons: [
        {
          text: 'Copy Link',
          handler: () => {
            console.log(
              'Copy link clicked on https://twitter.com/' + speaker.twitter
            );
            if (
              (window as any)['cordova'] &&
              (window as any)['cordova'].plugins.clipboard
            ) {
              (window as any)['cordova'].plugins.clipboard.copy(
                'https://twitter.com/' + speaker.twitter
              );
            }
          }
        },
        {
          text: 'Share via WhatsApp', handler: () => {

            this.socialSharing.shareViaWhatsApp(speaker['about'], null, `github.com/${speaker['github']}`).then(data => {
              console.log(data);
            }).catch(async err => {
              console.log(err);
              let alert = await this.alertCtrl.create({
                header: '',
                subHeader: '',
                message: 'WhatsApp Not Installed..',
                buttons: ['OK']
              })
              await alert.present().then(value => {
                setTimeout(() => {
                  alert.dismiss()
                }, 1500);
              })
              return err;

            });
          }
        },
        {
          text: 'Share via ...', handler: () => {

            this.socialSharing.share(speaker['about'], speaker['sessions'][1]['name'], null, `github.com/${speaker['github']}`).then(data => {
              console.log(data, 'share via handler');
            }).catch(err => {
              console.log(err);
              return err
            })
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  async openContact(speaker: any) {
    const mode = 'ios'; // this.config.get('mode');

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Contact ' + speaker.name,
      buttons: [
        {
          text: `Email ( ${speaker.email} )`,
          icon: mode !== 'ios' ? 'mail' : null,
          handler: () => {
            window.open('mailto:' + speaker.email);
          }
        },
        {
          text: `Call ( ${speaker.phone} )`,
          icon: mode !== 'ios' ? 'call' : null,
          handler: () => {
            window.open('tel:' + speaker.phone);
          }
        }
      ]
    });

    await actionSheet.present();
  }
}
