import { Component, OnInit } from '@angular/core';
import axios from 'axios';

interface Entry {
  faction: {
    type: string;
  };
  guild: {
    name: string;
    realm: {
      slug: string;
    };
  };
  rank: number;
  region: string;
  timestamp: number;
}

interface Guild {
  name: string;
  faction: string;
  realm: string;
  rank: number;
  region: string;
}

interface hallOfFameEntry {
  raid: string;
  guilds: Guild[];
}

@Component({
  selector: 'app-guilds',
  templateUrl: './guilds.component.html',
  styleUrls: ['./guilds.component.scss'],
})
export class GuildsComponent implements OnInit {
  accessToken: string;
  guilds: Guild[];
  hallOfFame: hallOfFameEntry[];
  isLoading: boolean;
  constructor() {
    this.accessToken = '';
    this.guilds = [];
    this.hallOfFame = [];
    this.isLoading = false;
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

    this.getWorldLeaderboard('vault-of-the-incarnates');
    this.getWorldLeaderboard('uldir');
  }

  // ovde treba da prodjem kroz podatke koje dobijam i na raids, da nekako agregiram
  // i rangiram guildove po skoru, kao neki ukupan rank za sve ove raidove
  async getWorldLeaderboard(raid: string) {
    // Podaci za hordu:
    const urlHorde = `https://eu.api.blizzard.com/data/wow/leaderboard/hall-of-fame/${raid}/horde?namespace=dynamic-eu&locale=en_EU&access_token=${this.accessToken}`;
    const responseHorde = await axios.get(urlHorde);
    var entriesHorde: Entry[] = responseHorde.data.entries;

    // Podaci za alijansu
    const urlAlliance = `https://eu.api.blizzard.com/data/wow/leaderboard/hall-of-fame/${raid}/alliance?namespace=dynamic-eu&locale=en_EU&access_token=${this.accessToken}`;
    const responseAlliance = await axios.get(urlAlliance);
    var entriesAlliance: Entry[] = responseAlliance.data.entries;

    const entriesCombined: Entry[] = entriesHorde.concat(entriesAlliance);
    var combinedRank = 1;
    const guilds: Guild[] = entriesCombined
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, 100)
      .map((entry) => {
        return {
          name: entry.guild.name,
          faction: entry.faction.type,
          realm: entry.guild.realm.slug,
          rank: combinedRank++,
          region: entry.region,
        };
      });

    this.guilds = guilds;

    const hallOfFameEntry: hallOfFameEntry = { raid: raid, guilds: guilds };
    this.hallOfFame.push(hallOfFameEntry);
    console.log(this.hallOfFame);
  }
}
