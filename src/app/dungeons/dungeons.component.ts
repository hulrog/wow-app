import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';

interface Affix {
  id: number;
  name: string;
  description: string;
  icon: string;
  wowhead_url: string;
}

@Component({
  selector: 'app-dungeons',
  templateUrl: 'dungeons.component.html',
  styleUrls: ['dungeons.component.scss'],
})
export class DungeonsComponent implements OnInit {
  @ViewChild('barChart', { static: true }) barChart!: ElementRef;

  affixes: Affix[];
  selectedAffix: any = null;

  constructor() {
    this.affixes = [];
  }

  async ngOnInit() {
    // Retrieve access token using client ID and client secret
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
    const accessToken = response.data.access_token;

    this.getCurrentAffixes();
  }

  async getCurrentAffixes() {
    try {
      const response = await axios.get(
        `https://raider.io/api/v1/mythic-plus/affixes?region=eu&locale=en`
      );
      this.affixes = response.data.affix_details;
      console.log(this.affixes);
    } catch (error) {
      console.log(error);
    }
  }
}
