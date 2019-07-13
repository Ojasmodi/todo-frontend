import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    FormsModule, BrowserAnimationsModule,
    NgxSpinnerModule,
    ToastrModule.forRoot(),
    RouterModule.forChild([
      { path: 'dashboard', component: DashboardComponent },
    ])
  ]
})
export class TodoModule { }
