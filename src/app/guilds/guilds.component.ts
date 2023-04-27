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

interface GuildScore {
  name: string;
  faction: string;
  score: number;
  region: string;
}

@Component({
  selector: 'app-guilds',
  templateUrl: './guilds.component.html',
  styleUrls: ['./guilds.component.scss'],
})
export class GuildsComponent implements OnInit {
  accessToken: string;
  guilds: Guild[];
  guildScores: GuildScore[];
  hallOfFame: hallOfFameEntry[];
  isLoading: boolean;
  constructor() {
    this.accessToken = '';
    this.guilds = [];
    this.guildScores = [];
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

    // Ceka da zavrse svi pozivi da bi izracunao hall
    const promises = [
      this.getWorldLeaderboard('uldir'),
      this.getWorldLeaderboard('crucible-of-storms'),
      this.getWorldLeaderboard('battle-of-dazaralor'),
      this.getWorldLeaderboard('the-eternal-palace'),
      this.getWorldLeaderboard('nyalotha-the-waking-city'),
      this.getWorldLeaderboard('castle-nathria'),
      this.getWorldLeaderboard('sanctum-of-domination'),
      this.getWorldLeaderboard('sepulcher-of-the-first-ones'),
      this.getWorldLeaderboard('vault-of-the-incarnates'),
    ];

    Promise.all(promises).then(() => {
      this.calculateGuildScores(this.hallOfFame);
    });
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
  }

  async calculateGuildScores(rankings: any[]) {
    const scores: GuildScore[] = [];
    console.log(rankings);

    for (const ranking of rankings) {
      for (const guild of ranking.guilds) {
        // Provera da li guild vec postoji u scores
        const existingScore = scores.find(
          (score) =>
            score.name === guild.name && score.faction === guild.faction
        );

        if (existingScore) {
          // Ako ima tog guilda
          const rank = guild.rank;
          let newScore = existingScore.score;
          if (rank == 1) {
            newScore += 1000;
          } else if (rank <= 5) {
            newScore += 500;
          } else if (rank <= 10) {
            newScore += 250;
          } else if (rank <= 30) {
            newScore += 100;
          } else {
            newScore += 25;
          }
          existingScore.score = newScore;
        } else {
          // Ako jos uvek nema skor
          const rank = guild.rank;
          let newScore = 0;
          if (rank == 1) {
            newScore += 1000;
          } else if (rank <= 5) {
            newScore += 500;
          } else if (rank <= 10) {
            newScore += 250;
          } else if (rank <= 30) {
            newScore += 100;
          } else {
            newScore += 25;
          }
          scores.push({
            name: guild.name,
            faction: guild.faction,
            region: guild.region,
            score: newScore,
          });
        }
      }
    }

    // Sort the scores in descending order based on score
    scores.sort((a, b) => b.score - a.score);

    this.guildScores = scores;
    console.log(this.guildScores);
  }
}
