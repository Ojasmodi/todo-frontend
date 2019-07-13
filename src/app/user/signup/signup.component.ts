import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserMgmtService } from 'src/app/user-mgmt.service';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  public firstName: string;
  public lastName: string;
  public mobile: any;
  public email: string;
  public password: string;
  public countryCodes = [
    '880', '32', '226', '359', '387', '+91', '+1-246', '681', '590', '+1-441', '673', '591', '973', '257', '229', '975', '+1-876', '267', '685', '599', '55',
    '+44-1481', '594', '995', '+1-473', '44', '241', '503', '224', '220', '299', '350', '233', '968', '216', '962', '385', '509', '36',
    '84', '677', '251', '252', '263', '966', '34', '291', '382', '373', '261', '590', '212', '377', '998', '95', '223', '853', '976',
    '298', '505', '31', '47', '264', '678', '687', '227', '672', '234', '64', '977', '674', '683', '682', '225', '41', '57', '86',
    '+1-869', '269', '239', '421', '82', '386', '850', '965', '221', '378', '232', '248', '7', '+1-345', '65', '46', '249', '+1-809', ' 1-829',
  ]
  public cc;

  constructor(
    public appService: UserMgmtService,
    public router: Router,
    private toastr: ToastrService,
    public cookieService: CookieService,
    private spinner: NgxSpinnerService) {
  }

  ngOnInit() {
  }

  // function to go back to login page
  public goToSignIn: any = () => {
    this.router.navigate(['/']);
  }

  // function for sign up
  public signupFunction: any = () => {
    if (!this.firstName || this.firstName.trim().length == 0) {
      this.toastr.warning('Enter first name.')
    } else if (!this.lastName || this.lastName.trim().length == 0) {
      this.toastr.warning('Enter last name.')
    } else if (!this.mobile) {
      this.toastr.warning('Enter valid mobile.')
    }
    else if (!this.cc) {
      this.toastr.warning('Select country code')
    } else if (!this.email || this.email.trim().length == 0) {
      this.toastr.warning('Enter email.')
    }
    else if (!this.verifyEmail(this.email)) {
      this.toastr.warning('Enter valid email.')
    }
    else if (!this.password || this.password.trim().length < 8) {
      this.toastr.warning('Enter valid password.')
    }
    else {
      this.spinner.show()
      const data = {
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        mobileNumber: this.cc + this.mobile,
        email: this.email.trim(),
        password: this.password.trim(),
      };
      // console.log(data);
      this.appService.signupFunction(data)
        .subscribe((apiResponse) => {
          this.spinner.hide()
          if (apiResponse.status === 200) {
            this.toastr.success('Signup successful!')
            this.goToSignIn();
          } else {
            this.toastr.error(apiResponse.message);
          }
        }, (err) => {
          this.spinner.hide()
          this.toastr.error('Some error occured.');
        });
    } // end condition
  } // end signupFunction

  // function to verify for valid email
  public verifyEmail = (email) => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if (email.match(emailRegex)) {
      return true;
    } else {
      return false;
    }
  }
}


