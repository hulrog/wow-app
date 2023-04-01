import { Component, OnInit } from '@angular/core';
import axios from 'axios';

@Component({
  selector: 'app-mythic-plus',
  templateUrl: './mythic-plus.component.html',
  styleUrls: ['./mythic-plus.component.scss'],
})
export class MythicPlusComponent implements OnInit {
  accessToken: string;
  constructor() {
    this.accessToken = '';
  }

  async ngOnInit() {
    const response = await axios.post(
      'https://us.battle.net/oauth/token',
      'grant_type=client_credentials',
      {
        auth: {
          username: '1902de7276ee46c396faf2730b4fe886',
          password: 'hrdP3d9JN1XEQpROXaD8snsywgjQkBWu',
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    this.accessToken = response.data.access_token;

    this.returnRuns();
  }

  async returnRuns() {
    // Ovo dohvata sve connected realm-ove za us
    const url = `https://us.api.blizzard.com/data/wow/connected-realm/index?namespace=dynamic-us&locale=en_US&access_token=${this.accessToken}`;
    const response = await axios.get(url);
    console.log(response);

    // Sad svaki od tih linkova mogu se pozvati da se dobiju zapravo realmovi

    // Ali ja necu to ja hocu samo da izvucem id-ove connected realmova da bih mogao da ih trpam u
    // https://us.api.blizzard.com/data/wow/connected-realm/11/
    // mythic-leaderboard/index?namespace=dynamic-us&locale=en_US&
    // access_token=EUjS7VVljuaFLZoIVHfbTkmdoF6rfiaISN

    // Osim toga za ovo treba i dungeonID  i period
    // https://us.api.blizzard.com/data/wow/connected-realm/11/
    // mythic-leaderboard/2/period/990 - 2 je dungeon id a 900 period (sadasnji)
    // ?namespace=dynamic-us&locale=en_US&
    // access_token=EUjS7VVljuaFLZoIVHfbTkmdoF6rfiaISN

    // dungeon id se dobija iz ovog:
    // https://us.api.blizzard.com/data/wow/connected-realm/11/
    // mythic-leaderboard/index?namespace=dynamic-us&
    // locale=en_US&access_token=EUjS7VVljuaFLZoIVHfbTkmdoF6rfiaISN

    // a periodi mogu iz ovog
    // https://us.api.blizzard.com/data/wow/
    // mythic-keystone/period/index?namespace=dynamic-us&
    // locale=en_US&access_token=EUjS7VVljuaFLZoIVHfbTkmdoF6rfiaISN
  }
}
