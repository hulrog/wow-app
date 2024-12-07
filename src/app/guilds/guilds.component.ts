import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import { environment } from '../../environments/environment';
import { TokenService } from '../services/token.service';

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

interface Raid {
  name: string;
  slug: string;
}

@Component({
  selector: 'app-guilds',
  templateUrl: './guilds.component.html',
  styleUrls: ['./guilds.component.scss'],
})
export class GuildsComponent implements OnInit {
  @ViewChild('barChart', { static: true }) barChart!: ElementRef;

  accessToken: string;
  guilds: Guild[];
  guildScores: GuildScore[];
  raids: Raid[];
  hallOfFame: hallOfFameEntry[];
  isLoading: boolean;
  selectedView: string;
  constructor(private tokenService: TokenService) {
    this.accessToken = '';
    this.guilds = [];
    this.guildScores = [];
    this.raids = [];
    this.hallOfFame = [];
    this.isLoading = false;
    this.selectedView = 'table';
  }

  async ngOnInit() {
    this.accessToken = await this.tokenService.getAccessToken();
    this.isLoading = true;

    // ovde bi morao da se doda sledeci expansion ako izadje...
    const promisesSlugs = [
      this.getRaidSlugs(7),
      this.getRaidSlugs(8),
      this.getRaidSlugs(9),
      this.getRaidSlugs(10)
    ];

    Promise.all(promisesSlugs).then(() => {
      Promise.all(this.raids.map((raid) => this.getWorldLeaderboard(raid.slug)))
        .then(() => {
          this.calculateGuildScores(this.hallOfFame);
        })
        .catch((error) => {
          console.error('Error fetching leaderboards:', error);
        });
    });
  }

  async getRaidSlugs(expansionId: number): Promise<void> {
    const url = `https://raider.io/api/v1/raiding/static-data?expansion_id=${expansionId}`;
    const response = await axios.get(url);

    const newRaids = response.data.raids
      .filter((raid: any) => !raid.slug.includes('fated')) // fated raidovi ne bi trebalo da imaju rang
      .map((raid: any) => ({
        name: raid.name,
        slug: raid.slug,
      }));

    this.raids = [...this.raids, ...newRaids];
    console.log(this.raids);
  }

  // ovde treba da prodjem kroz podatke koje dobijam i na raids, da nekako agregiram
  // i rangiram guildove po skoru, kao neki ukupan rank za sve ove raidove
  async getWorldLeaderboard(raid: string) {
    // Podaci za hordu:
    try {
      const urlHorde = `https://eu.api.blizzard.com/data/wow/leaderboard/hall-of-fame/${raid}/horde?namespace=dynamic-eu&locale=en_EU`;
      const responseHorde = await axios.get(urlHorde, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      });
      var entriesHorde: Entry[] = responseHorde.data.entries;

      // Podaci za alijansu
      const urlAlliance = `https://eu.api.blizzard.com/data/wow/leaderboard/hall-of-fame/${raid}/alliance?namespace=dynamic-eu&locale=en_EU`;
      const responseAlliance = await axios.get(urlAlliance, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      });
      var entriesAlliance: Entry[] = responseAlliance.data.entries;
    } catch (error) {
      console.log(`Hall of Fame not found for raid ${raid}`);
      return;
    }

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
    this.isLoading = false;
    this.showChart();
  }

  showChart() {
    Chart.register(...registerables);
    const top10Guilds = this.guildScores.slice(0, 10);
    const barChart = new Chart(this.barChart.nativeElement, {
      type: 'bar',
      data: {
        labels: top10Guilds.map((guild) => guild.name),
        datasets: [
          {
            label: 'Guild Scores',
            data: top10Guilds.map((guild) => guild.score),
            backgroundColor: top10Guilds.map((guild) => {
              switch (guild.region) {
                case 'eu':
                  return 'skyblue';
                case 'us':
                  return 'darkblue';
                case 'kr':
                  return 'white';
                case 'cn':
                  return 'red';
                case 'tw':
                  return 'yellow';
                default:
                  return 'gray';
              }
            }),
            borderColor: 'black',
            borderWidth: 2,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: true,
            labels: {
              generateLabels: function (chart) {
                const labels = ['EU', 'US', 'KR', 'CN', 'TW'];
                const colors = [
                  'skyblue',
                  'darkblue',
                  'white',
                  'red',
                  'yellow',
                ];
                return labels.map((label, index) => {
                  return {
                    text: label,
                    fillStyle: colors[index],
                  };
                });
              },
              boxWidth: 20,
            },
          },
        },
      },
    });
  }
}
