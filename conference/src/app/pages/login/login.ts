import { Component, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { UserData } from '../../providers/user-data';

import { UserOptions } from '../../interfaces/user-options';

import { GooglePlus } from '@ionic-native/google-plus/ngx';



@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  styleUrls: ['./login.scss'],
})
export class LoginPage {
  login: UserOptions = { username: '', password: '' };
  submitted = false;

  constructor(
    public userData: UserData,
    public router: Router,
    private googlePlus: GooglePlus,
  ) { }

  onLogin(form: NgForm) {
    this.submitted = true;

    if (form.valid) {
      this.userData.login(this.login.username);
      this.router.navigateByUrl('/app/tabs/schedule');
    }
  }

  onSignup() {
    this.router.navigateByUrl('/signup');
  }

  onGoogleLogin(){
    this.googlePlus.login({
    'scopes': 'profile email', // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
		'webClientId': '833776005269-bhjk25kourisrvq0rrmhldgh1bnghu9q.apps.googleusercontent.com', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
		'offline': true // Optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
    })
    .then(res => {

      this.userData.googlelogin(res)
      .then(()=>{
       window.dispatchEvent(new CustomEvent('user:googlelogin'));
       this.router.navigateByUrl('/app/tabs/schedule');
      });

    
    })
    .catch(err => console.error(err));
  }

  onFacebookLogin(){

  }

}

interface OAuthRespose{
  name:string;
  image:string;
}
