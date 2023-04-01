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
    { title: 'Guilds', url: '/guilds', icon: 'people' },
    { title: 'Mythic+', url: '/mythic-plus', icon: 'add-circle' },
    { title: 'Raids', url: '/raids', icon: 'skull' },
  ];

  constructor() {}
}
