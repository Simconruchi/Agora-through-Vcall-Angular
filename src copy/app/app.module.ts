import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CallComponent } from './call/call.component';
import { FormsModule } from '@angular/forms';
import { NgxAgoraSdkNgModule } from 'ngx-agora-sdk-ng';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    CallComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgxAgoraSdkNgModule.forRoot({
      AppID: 'd028e26ad3c7437b93ea957bd21c1930',
      Video: { codec: 'h264', mode: 'rtc', role: 'host' }
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
