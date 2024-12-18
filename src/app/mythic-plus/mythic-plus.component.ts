import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import axios from 'axios';
import { TokenService } from '../services/token.service';

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
  selectedRegion: string;
  selectedNamespace: string;
  currentPeriod: number;
  finalLeaderboard: FinalLeaderboard;
  isLoading: boolean;
  constructor(private toastController: ToastController, private tokenService: TokenService) {
    this.accessToken = '';
    this.connectedRealms = [];
    this.dungeons = [];
    this.leaderboards = [];
    this.selectedDungeon = 0;
    this.selectedRegion = '';
    this.selectedNamespace = '';
    this.currentPeriod = 0;
    this.finalLeaderboard = { groups: [] };
    this.isLoading = false;
  }

  async ngOnInit() {
    
    this.accessToken = await this.tokenService.getAccessToken();
  }

  async returnDungeons() {
    //this.leaderboards = []; // izbrisi stari kad se pokrene funkcija ponovo
    const urlConnectedRealms = `https://${this.selectedRegion}.api.blizzard.com/data/wow/connected-realm/index?namespace=${this.selectedNamespace}&locale=en_US`;
    const responseConnectedRealms = await axios.get(urlConnectedRealms, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    });

    // Sad svaki od tih linkova mogu se pozvati da se dobiju zapravo realmovi
    const connectedRealms = responseConnectedRealms.data.connected_realms;
    this.connectedRealms = connectedRealms;

    // Dovoljno je izvuci 1, dungeoni su isti za svaki connected realm
    const realmLink = connectedRealms[0].href;
    // Vadi id realma iz funkcije
    const patternConnectedRealm = /\d+/g; //cifre
    const matchesConnectedRealm = realmLink.match(patternConnectedRealm);
    const connectedRealmID = matchesConnectedRealm
      ? matchesConnectedRealm[0]
      : null;

    const urlDungeonsIndex = `https:/${this.selectedRegion}.api.blizzard.com/data/wow/connected-realm/${connectedRealmID}/mythic-leaderboard/index?namespace=${this.selectedNamespace}&locale=en_US`;
    const responseDungeonsIndex = await axios.get(urlDungeonsIndex, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    });
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

  async getDungeonLeaderboard() {
    if (this.selectedDungeon == 0 || this.selectedRegion == '') {
      const toast = await this.toastController.create({
        message: 'Please select a region and a dungeon.',
        duration: 3000,
        color: 'danger',
      });
      toast.present();
      return;
    }
    this.isLoading = true;
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
    const tableHeader = document.getElementById('table-header');
    if (tableHeader) tableHeader.style.display = 'table-header-group';

    this.isLoading = false;
    return finalLeaderboard;
  }

  async getDungeonLeaderboardByRealm(connectedRealm: number) {
    const urlLeaderboard = `https://${this.selectedRegion}.api.blizzard.com/data/wow/connected-realm/${connectedRealm}/mythic-leaderboard/${this.selectedDungeon}/period/${this.currentPeriod}?namespace=${this.selectedNamespace}`;
    const responseLeaderboard = await axios.get(urlLeaderboard, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    });
    console.log(responseLeaderboard);
    const leaderboardInput = responseLeaderboard.data;
    const leaderboard = convertToLeaderboard(leaderboardInput);
    this.leaderboards.push(leaderboard);
  }

  formatDuration(duration: number): string {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = (seconds % 60).toString().padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  }

  setRegion(region: string) {
    if (this.selectedRegion === region) {
      this.selectedRegion = '';
    } else {
      this.selectedRegion = region;
      this.selectedNamespace = 'dynamic-' + region;
    }
    console.log(this.selectedRegion);
    console.log(this.selectedNamespace);
    this.returnDungeons();
  }
}

function convertToLeaderboard(json: any): Leaderboard {
  // moze da se desi da blizzard ne vrati ovo, ako na tom realmu bas nema nijedna grupa
  if (!json.leading_groups) {
    const emptyLeaderboard: Leaderboard = { groups: [] };
    return emptyLeaderboard;
  }
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

    // prepakovanje u interfejs
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
