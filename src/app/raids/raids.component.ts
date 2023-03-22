import { Component, OnInit } from '@angular/core';
import axios from 'axios';

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
  constructor() {
    this.selectedRaid = '';
    this.selectedFaction = 'horde';
    this.selectedRegion = '';
    this.accessToken = '';
    this.namespace = '';
    this.locale = '';
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
    this.selectedFaction = faction;
  }

  setNamespaceAndLocale() {
    if (this.selectedRegion === 'eu') {
      this.namespace = 'dynamic-eu';
      this.locale = 'en_EU';
    } else if (this.selectedRegion === 'us') {
      this.namespace = 'dynamic-us';
      this.locale = 'en_US';
    }
  }

  async getRaidLeaderboard() {
    const url = `https://${this.selectedRegion}.api.blizzard.com/data/wow/leaderboard/hall-of-fame/${this.selectedRaid}/${this.selectedFaction}?namespace=${this.namespace}&locale=${this.locale}&access_token=${this.accessToken}`;
    const response = await axios.get(url);

    console.log(response.data);
    // TODO obraditi response i prikazati na frontu leaderboard
  }
}
