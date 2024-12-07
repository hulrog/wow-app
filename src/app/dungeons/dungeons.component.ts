import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';

interface Affix {
  id: number;
  name: string;
  description: string;
  icon: string;
  icon_url: string;
}

interface Dungeon {
  id: number;
  slug: string;
  name: string;
  short_name: string;
}
@Component({
  selector: 'app-dungeons',
  templateUrl: 'dungeons.component.html',
  styleUrls: ['dungeons.component.scss'],
})
export class DungeonsComponent implements OnInit {
  @ViewChild('barChart', { static: true }) barChart!: ElementRef;

  affixes: Affix[];
  dungeons: Dungeon[];
  selectedAffix: any = null;
  selectedSeason: number = 0;
  seasonName: string = '';
  loading: boolean;
  numberOfSeasons: number = 0;

  constructor() {
    this.affixes = [];
    this.dungeons = [];
    this.loading = false;
  }

  async ngOnInit() {
    this.loading = true;

    this.getCurrentAffixes();
    this.getDungeons(0);
  }

  async getCurrentAffixes() {
    this.loading = true;
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

  async getDungeons(season: number) {
    this.loading = true;
    try {
      const response = await axios.get(
        `https://raider.io/api/v1/mythic-plus/static-data?expansion_id=9`
      );
      this.dungeons = response.data.seasons[season].dungeons;
      this.numberOfSeasons = response.data.seasons.length;
      this.seasonName = response.data.seasons[season].name;
    } catch (error) {
      console.log(error);
    }
    this.loading = false;
  }

  incrementSeason() {
    this.selectedSeason = (this.selectedSeason + 1) % this.numberOfSeasons;
    this.getDungeons(this.selectedSeason);
  }

  decrementSeason() {
    this.selectedSeason =
      (this.selectedSeason - 1 + this.numberOfSeasons) % this.numberOfSeasons;
    this.getDungeons(this.selectedSeason);
  }
}
