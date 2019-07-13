import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { TodoModule } from './todo/todo.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UserModule } from './user/user.module';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './user/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CookieService } from 'ngx-cookie-service';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule, NgxSpinnerModule,
    HttpClientModule, UserModule, TodoModule,
    RouterModule.forRoot([
      { path: 'login', component: LoginComponent, pathMatch: 'full' },
      { path: '*', component: LoginComponent },
      { path: '**', component: LoginComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ]),
    BrowserAnimationsModule
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
