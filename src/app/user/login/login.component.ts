import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserMgmtService } from 'src/app/user-mgmt.service';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SocialUser, AuthService, GoogleLoginProvider } from 'angularx-social-login';
declare var $: any

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private user: SocialUser;
  public email: string;
  public password: string;
  public forget_email: string;

  constructor(public _route: ActivatedRoute, public router: Router, private toastr: ToastrService,
    private appService: UserMgmtService, private cookieService: CookieService,
    private authService: AuthService, public spinner: NgxSpinnerService) {
  }

  ngOnInit() {
  }

  // function to reset password
  resetPassword = () => {
    if (!this.forget_email || this.forget_email.trim().length == 0) {
      this.toastr.warning("Email field can't be blank!")
    }
    else {
      $('#exampleModal').modal('toggle');
      this.spinner.show();
      let data = {
        email: this.forget_email
      }
      this.appService.resetPassword(data)
        .subscribe((apiResponse) => {
          this.spinner.hide()
          if (apiResponse['status'] === 200) {
            console.log(apiResponse)
            this.toastr.success("Please login again.", "Your password has been sent to your registered email");
            this.router.navigate(['/home']);
          }
          else if (apiResponse['status'] === 404) {
            this.toastr.error(apiResponse['message']);
          }
          else {
            this.toastr.error(apiResponse['message']);
          }
        }, (err) => {
          this.spinner.hide()
          this.toastr.error('Some error occured.')
        });
    } // end condition
    this.forget_email = ""
  }

  // function for sign-in  with email and password
  public signin = () => {
    if (!this.email || this.email.trim().length == 0) {
      this.toastr.warning('Enter email')
    }
    else if (!this.password || this.password.trim().length == 0) {
      this.toastr.warning('enter password')
    }
    else {
      this.spinner.show()
      let data = {
        email: this.email,
        password: this.password
      }
      this.appService.signinFunction(data)
        .subscribe((apiResponse) => {
          this.spinner.hide()
          if (apiResponse.status === 200) {
            // console.log(apiResponse)
            this.cookieService.delete('authToken')
            this.cookieService.delete('userId')
            this.cookieService.delete('userName')
            this.cookieService.set('authToken', apiResponse.data.authToken);
            this.cookieService.set('userId', apiResponse.data.userDetails.userId);
            this.cookieService.set('userName', apiResponse.data.userDetails.firstName + ' ' + apiResponse.data.userDetails.lastName);
            this.appService.setUserInfoInLocalStorage(apiResponse.data.userDetails)
            this.toastr.show('Login Successful');
            this.router.navigate(['/dashboard']);
          } else {
            this.toastr.error(apiResponse.message)
          }
        }, (err) => {
          this.spinner.hide()
          this.toastr.error('Some error occured')
        });
    }
  }

  // function for sign in with google/social login
  signInWithGoogle(): any {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then((user) => {
      let data = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
      this.spinner.show()
      this.appService.signinWithGoogle(data)
        .subscribe((apiResponse) => {
          this.spinner.hide()
          if (apiResponse.status === 200) {
            // console.log(apiResponse)
            this.cookieService.delete('authToken')
            this.cookieService.delete('userId')
            this.cookieService.delete('userName')
            this.cookieService.set('authToken', apiResponse.data.authToken);
            this.cookieService.set('userId', apiResponse.data.userDetails.userId);
            this.cookieService.set('userName', apiResponse.data.userDetails.firstName + ' ' + apiResponse.data.userDetails.lastName);
            this.appService.setUserInfoInLocalStorage(apiResponse.data.userDetails)
            this.toastr.show('Login Successful');
            this.router.navigate(['/dashboard']);
          } else {
            this.toastr.error("Error")
          }
        }, (err) => {
          this.spinner.hide()
          this.toastr.error('Some error occured')
        });
    })
  }
}

