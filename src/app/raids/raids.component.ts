import { Component, OnInit } from '@angular/core';
import axios from 'axios';

interface Entry {
  guild: {
    name: string;
    realm: {
      slug: string;
    };
  };
  rank: number;
  region: string;
}

interface Guild {
  name: string;
  realm: string;
  rank: number;
  region: string;
}

@Component({
  selector: 'app-raids',
  templateUrl: './raids.component.html',
  styleUrls: ['./raids.component.scss'],
})
export class RaidsComponent implements OnInit {
  selectedRaid: string;
  selectedFaction: string;
  selectedRegion: string;
  accessToken: string;
  namespace: string;
  locale: string;
  guilds: Guild[];
  constructor() {
    this.selectedRaid = '';
    this.selectedFaction = '';
    this.selectedRegion = '';
    this.accessToken = '';
    this.namespace = '';
    this.locale = '';
    this.guilds = [];
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
  }

  setFaction(faction: string) {
    if (this.selectedFaction === faction) {
      this.selectedFaction = '';
    } else {
      this.selectedFaction = faction;
    }
  }

  async getRaidLeaderboard() {
    //const url = `https://${this.selectedRegion}.api.blizzard.com/data/wow/leaderboard/hall-of-fame/${this.selectedRaid}/${this.selectedFaction}?namespace=${this.namespace}&locale=${this.locale}&access_token=${this.accessToken}`;
    const url = `https://eu.api.blizzard.com/data/wow/leaderboard/hall-of-fame/${this.selectedRaid}/${this.selectedFaction}?namespace=dynamic-eu&locale=en_EU&access_token=${this.accessToken}`;
    const response = await axios.get(url);

    var entries: Entry[] = response.data.entries;

    const guilds = entries.map((entry) => {
      return {
        name: entry.guild.name,
        realm: entry.guild.realm.slug,
        rank: entry.rank,
        region: entry.region,
      };
    });

    this.guilds = guilds;

    const tableHeader = document.getElementById('table-header');
    if (tableHeader) tableHeader.style.display = 'table-header-group';
  }
}
