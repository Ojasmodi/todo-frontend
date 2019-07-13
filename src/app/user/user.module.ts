import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { SocialLoginModule, AuthServiceConfig } from "angularx-social-login";
import { GoogleLoginProvider } from 'angularx-social-login';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import * as $ from 'jquery';

let config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider("21356100177-0ho064i7cd4mge8eh0nr250gsf6pesnr.apps.googleusercontent.com")
  }
]);

export function provideConfig() {
  return config;
}

@NgModule({
  declarations: [LoginComponent, SignupComponent],
  imports: [
    CommonModule, SocialLoginModule, FormsModule, BrowserAnimationsModule,
    NgxSpinnerModule,
    ToastrModule.forRoot(),
    RouterModule.forChild([
      { path: 'signup', component: SignupComponent },
    ])
  ],
  providers: [{
    provide: AuthServiceConfig,
    useFactory: provideConfig
  }]
})
export class UserModule { }

