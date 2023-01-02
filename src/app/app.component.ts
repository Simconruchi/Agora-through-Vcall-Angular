import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'agora-Vcall';
  hide: boolean = false;

  constructor(private router: Router) { }
  open(value: any) {
    this.hide = true;
    this.router.navigate([`/staging/${value}`]);
  }
}
