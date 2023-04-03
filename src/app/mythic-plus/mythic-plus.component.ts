import { Component, OnInit } from '@angular/core';
import axios from 'axios';

interface Leaderboard {
  groups: Group[];
}

interface Group {
  keystone: number;
  players: Player[];
  score: number;
}

interface Player {
  faction: string;
  name: string;
}

interface DungeonEntry {
  id: number;
  name: string;
  key: {
    href: string;
  };
}
interface Dungeon {
  id: number;
  name: string;
  link: string;
}
@Component({
  selector: 'app-mythic-plus',
  templateUrl: './mythic-plus.component.html',
  styleUrls: ['./mythic-plus.component.scss'],
})
export class MythicPlusComponent implements OnInit {
  accessToken: string;
  connectedRealms: any[];
  dungeons: Dungeon[];
  leaderboards: Leaderboard[];
  selectedDungeon: number;
  constructor() {
    this.accessToken = '';
    this.connectedRealms = [];
    this.dungeons = [];
    this.leaderboards = [];
    this.selectedDungeon = 0;
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

    this.returnDungeons();
    //this.returnRuns();
  }

  async returnDungeons() {
    // Ovo dohvata sve connected realm-ove za us
    const urlConnectedRealms = `https://us.api.blizzard.com/data/wow/connected-realm/index?namespace=dynamic-us&locale=en_US&access_token=${this.accessToken}`;
    const responseConnectedRealms = await axios.get(urlConnectedRealms);

    // Sad svaki od tih linkova mogu se pozvati da se dobiju zapravo realmovi
    const connectedRealms = responseConnectedRealms.data.connected_realms;
    console.log(connectedRealms);
    this.connectedRealms = connectedRealms;
    console.log(connectedRealms);

    // // Za EU
    // const urlConnectedRealmsEU = `https://eu.api.blizzard.com/data/wow/connected-realm/index?namespace=dynamic-eu&locale=en_GB&access_token=${this.accessToken}`;
    // const responseConnectedRealmsEU = await axios.get(urlConnectedRealmsEU);

    // // Sad svaki od tih linkova mogu se pozvati da se dobiju zapravo realmovi
    // const connectedRealmsEU = responseConnectedRealmsEU.data.connected_realms;
    // console.log(connectedRealmsEU);

    // Dovoljno je izvuci 1, dungeoni su isti za svaki connected realm
    const realmLink = connectedRealms[0].href;
    // Vadi id realma iz funkcije
    const pattern = /\d+/g;
    const matches = realmLink.match(pattern);
    const connectedRealmID = matches ? matches[0] : null;
    console.log(connectedRealmID);

    const urlDungeonsIndex = `https://us.api.blizzard.com/data/wow/connected-realm/${connectedRealmID}/mythic-leaderboard/index?namespace=dynamic-us&locale=en_US&access_token=${this.accessToken}`;
    const responseDungeonsIndex = await axios.get(urlDungeonsIndex);
    const dungeonArray: DungeonEntry[] =
      responseDungeonsIndex.data.current_leaderboards;
    console.log(dungeonArray);

    const dungeons: Dungeon[] = dungeonArray.map((dungeon) => {
      return {
        name: dungeon.name,
        id: dungeon.id,
        link: dungeon.key.href,
      };
    });
    console.log(dungeons);
    this.dungeons = dungeons;
    console.log(this.dungeons);
  }

  async returnRuns() {
    const urlLeaderboard = `https://us.api.blizzard.com/data/wow/connected-realm/113/mythic-leaderboard/2/period/900?namespace=dynamic-us&access_token=${this.accessToken}`;
    const responseLeaderboard = await axios.get(urlLeaderboard);
    const leaderboard = responseLeaderboard.data.leading_groups;
    console.log(leaderboard);
  }
}
