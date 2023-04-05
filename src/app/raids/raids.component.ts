import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
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

@Component({
  selector: 'app-raids',
  templateUrl: './raids.component.html',
  styleUrls: ['./raids.component.scss'],
})
export class RaidsComponent implements OnInit {
  selectedRaid: string;
  selectedFaction: string;
  accessToken: string;
  namespace: string;
  locale: string;
  guilds: Guild[];
  isLoading: boolean;
  constructor(private toastController: ToastController) {
    this.selectedRaid = '';
    this.selectedFaction = '';
    this.accessToken = '';
    this.namespace = '';
    this.locale = '';
    this.guilds = [];
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
  }

  setFaction(faction: string) {
    if (this.selectedFaction === faction) {
      this.selectedFaction = '';
    } else {
      this.selectedFaction = faction;
    }
  }

  async getRaidLeaderboard() {
    if (this.selectedFaction == '' || this.selectedRaid == '') {
      const toast = await this.toastController.create({
        message: 'Please select a faction and a raid.',
        duration: 3000,
        color: 'danger',
      });
      toast.present();
      return;
    }
    this.isLoading = true;
    if (this.selectedFaction == 'both') {
      this.getWorldLeaderboard();
    } else {
      const url = `https://eu.api.blizzard.com/data/wow/leaderboard/hall-of-fame/${this.selectedRaid}/${this.selectedFaction}?namespace=dynamic-eu&locale=en_EU&access_token=${this.accessToken}`;
      const response = await axios.get(url);

      var entries: Entry[] = response.data.entries;

      const guilds = entries.map((entry) => {
        return {
          name: entry.guild.name,
          faction: entry.faction.type,
          realm: entry.guild.realm.slug,
          rank: entry.rank,
          region: entry.region,
        };
      });

      this.guilds = guilds;
    }

    const tableHeader = document.getElementById('table-header');
    if (tableHeader) tableHeader.style.display = 'table-header-group';
    this.isLoading = false;
  }

  async getWorldLeaderboard() {
    // Podaci za hordu:
    const urlHorde = `https://eu.api.blizzard.com/data/wow/leaderboard/hall-of-fame/${this.selectedRaid}/horde?namespace=dynamic-eu&locale=en_EU&access_token=${this.accessToken}`;
    const responseHorde = await axios.get(urlHorde);
    var entriesHorde: Entry[] = responseHorde.data.entries;

    // Podaci za alijansu
    const urlAlliance = `https://eu.api.blizzard.com/data/wow/leaderboard/hall-of-fame/${this.selectedRaid}/alliance?namespace=dynamic-eu&locale=en_EU&access_token=${this.accessToken}`;
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
  }
}
