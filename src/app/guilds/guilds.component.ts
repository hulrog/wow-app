import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-guilds',
  templateUrl: './guilds.component.html',
  styleUrls: ['./guilds.component.scss'],
})
export class GuildsComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  // ovde treba da prodjem kroz podatke koje dobijam i na raids, da nekako agregiram
  // i rangiram guildove po skoru, kao neki ukupan rank za sve ove raidove
}
