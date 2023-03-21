import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Home', url: '/home', icon: 'home' },
    { title: 'Dungeons', url: '/dungeons', icon: 'shield' },
    { title: 'Raids', url: '/raids', icon: 'skull' },
  ];

  constructor() {}
}
