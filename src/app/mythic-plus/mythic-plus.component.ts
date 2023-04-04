import { Component, OnInit } from '@angular/core';
import axios from 'axios';

interface Leaderboard {
  groups: Group[];
}

interface Group {
  keystone: number;
  players: Player[];
  duration: number;
}
interface GroupWithRank extends Group {
  rank: number;
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

interface GroupWithRank extends Group {
  rank: number;
}

interface FinalLeaderboard {
  groups: GroupWithRank[];
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
  currentPeriod: number;
  finalLeaderboard: FinalLeaderboard;
  constructor() {
    this.accessToken = '';
    this.connectedRealms = [];
    this.dungeons = [];
    this.leaderboards = [];
    this.selectedDungeon = 0;
    this.currentPeriod = 0;
    this.finalLeaderboard = { groups: [] };
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
  }

  async returnDungeons() {
    //this.leaderboards = []; // izbrisi stari kad se pokrene funkcija ponovo
    // Ovo dohvata sve connected realm-ove za us
    const urlConnectedRealms = `https://us.api.blizzard.com/data/wow/connected-realm/index?namespace=dynamic-us&locale=en_US&access_token=${this.accessToken}`;
    const responseConnectedRealms = await axios.get(urlConnectedRealms);

    // Sad svaki od tih linkova mogu se pozvati da se dobiju zapravo realmovi
    const connectedRealms = responseConnectedRealms.data.connected_realms;
    this.connectedRealms = connectedRealms;

    // // Za EU
    // const urlConnectedRealmsEU = `https://eu.api.blizzard.com/data/wow/connected-realm/index?namespace=dynamic-eu&locale=en_GB&access_token=${this.accessToken}`;
    // const responseConnectedRealmsEU = await axios.get(urlConnectedRealmsEU);

    // // Sad svaki od tih linkova mogu se pozvati da se dobiju zapravo realmovi
    // const connectedRealmsEU = responseConnectedRealmsEU.data.connected_realms;
    // console.log(connectedRealmsEU);

    // Dovoljno je izvuci 1, dungeoni su isti za svaki connected realm
    const realmLink = connectedRealms[0].href;
    // Vadi id realma iz funkcije
    const patternConnectedRealm = /\d+/g; //cifre
    const matchesConnectedRealm = realmLink.match(patternConnectedRealm);
    const connectedRealmID = matchesConnectedRealm
      ? matchesConnectedRealm[0]
      : null;

    const urlDungeonsIndex = `https://us.api.blizzard.com/data/wow/connected-realm/${connectedRealmID}/mythic-leaderboard/index?namespace=dynamic-us&locale=en_US&access_token=${this.accessToken}`;
    const responseDungeonsIndex = await axios.get(urlDungeonsIndex);
    const dungeonArray: DungeonEntry[] =
      responseDungeonsIndex.data.current_leaderboards;

    const dungeons: Dungeon[] = dungeonArray.map((dungeon) => {
      return {
        name: dungeon.name,
        id: dungeon.id,
        link: dungeon.key.href,
      };
    });
    this.dungeons = dungeons;

    const dungeonLink = dungeons[0].link;
    const patternPeriod = /\/(\d+)[^/]*$/; // cifre posle backslasha
    const matchesPeriod = dungeonLink.match(patternPeriod);
    const currentPeriod = matchesPeriod ? matchesPeriod[1] : null;
    if (currentPeriod) this.currentPeriod = parseInt(currentPeriod);
  }

  getDungeonLeaderboard() {
    this.leaderboards = []; //ciscenje
    console.log(this.selectedDungeon);
    console.log(this.currentPeriod);
    console.log(this.connectedRealms);

    let completedRequests = 0;
    const totalRequests = this.connectedRealms.length;

    for (var i = 0; i < totalRequests; i++) {
      const realmLink = this.connectedRealms[i].href;
      const patternConnectedRealm = /\d+/g; //cifre
      const matchesConnectedRealm = realmLink.match(patternConnectedRealm);
      const connectedRealmID = matchesConnectedRealm
        ? matchesConnectedRealm[0]
        : null;

      // Povecava brojac
      this.getDungeonLeaderboardByRealm(connectedRealmID).then(() => {
        completedRequests++;

        // Tek kad se svi zahtevi pozovu onda napravi finalLeaderboard
        if (completedRequests === totalRequests) {
          this.formFinalLeaderboard();
        }
      });
    }
  }

  formFinalLeaderboard() {
    this.finalLeaderboard = { groups: [] }; // ciscenje
    console.log(this.leaderboards);
    // Sve leaderboarde u jedan
    const groups: Group[] = this.leaderboards.flatMap((l) => l.groups);

    // Uklanjanje duplikata - koji imaju isti keystoen i duration
    // zato sto moze da se desi da su radili ljudi sa razlicitih realmova
    const uniqueGroups = groups.reduce((acc: Group[], group: Group) => {
      const isDuplicate = acc.some(
        (g) => g.duration === group.duration && g.keystone === group.keystone
      );
      if (!isDuplicate) {
        acc.push(group);
      }
      return acc;
    }, []);

    // Prvo se sortira po keystonu, pa onda sto kracem durationu
    const sortedGroups = uniqueGroups.sort((a, b) => {
      if (a.keystone !== b.keystone) {
        return b.keystone - a.keystone;
      } else {
        return a.duration - b.duration;
      }
    });

    // Novi rang
    const finalLeaderboard: FinalLeaderboard = {
      groups: sortedGroups
        .map((group, index) => ({
          ...group,
          rank: index + 1,
        }))
        .slice(0, 100),
    };

    this.finalLeaderboard = finalLeaderboard;
    // console.log(this.leaderboards);
    console.log(this.finalLeaderboard);
    return finalLeaderboard;
  }

  async getDungeonLeaderboardByRealm(connectedRealm: number) {
    const urlLeaderboard = `https://us.api.blizzard.com/data/wow/connected-realm/${connectedRealm}/mythic-leaderboard/${this.selectedDungeon}/period/${this.currentPeriod}?namespace=dynamic-us&access_token=${this.accessToken}`;
    const responseLeaderboard = await axios.get(urlLeaderboard);
    const leaderboardInput = responseLeaderboard.data;
    const leaderboard = convertToLeaderboard(leaderboardInput);
    this.leaderboards.push(leaderboard);
    this.formFinalLeaderboard();
  }
}

function convertToLeaderboard(json: any): Leaderboard {
  const groups: Group[] = [];
  const leaderboardData = json.leading_groups;
  for (let i = 0; i < leaderboardData.length; i++) {
    const groupData = leaderboardData[i];
    const players: Player[] = [];

    // pojedinacni igraci
    for (let j = 0; j < groupData.members.length; j++) {
      const member: any = groupData.members[j];
      const player: Player = {
        faction: member.faction.type,
        name: member.profile.name,
      };
      players.push(player);
    }

    // kalkulacija score-a grupe
    const group: Group = {
      keystone: groupData.keystone_level,
      players,
      duration: groupData.duration,
    };

    groups.push(group);
  }

  const leaderboard: Leaderboard = {
    groups: groups.slice(0, 100),
  };

  return leaderboard;
}
