import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import { environment } from '../../environments/environment';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild('barChart', { static: true }) barChart!: ElementRef;

  accessToken: string;
  wowTokenPriceEU: number;
  wowTokenPriceUS: number;
  wowTokenPriceKR: number;
  wowTokenPriceTW: number;
  loading: boolean;

  constructor(private tokenService: TokenService) {
    this.accessToken = "";
    this.wowTokenPriceEU = 0;
    this.wowTokenPriceEU = 0;
    this.wowTokenPriceUS = 0;
    this.wowTokenPriceKR = 0;
    this.wowTokenPriceTW = 0;
    this.loading = true;
  }

  async ngOnInit() {
    this.accessToken = await this.tokenService.getAccessToken();
    this.getWowTokenPrices(this.accessToken);
  }

  async getWowTokenPrices(accessToken: string) {
    this.loading = true;
    try {
      const responseEU = await axios.get(
        `https://eu.api.blizzard.com/data/wow/token/?namespace=dynamic-eu&locale=en_EU`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      this.wowTokenPriceEU = responseEU.data.price / 10000; // jer je u copperu pa je u goldu / 10000

      const responseUS = await axios.get(
        `https://us.api.blizzard.com/data/wow/token/?namespace=dynamic-us&locale=en_US`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      this.wowTokenPriceUS = responseUS.data.price / 10000;

      const responseKR = await axios.get(
        `https://kr.api.blizzard.com/data/wow/token/?namespace=dynamic-kr&locale=en_EU`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      this.wowTokenPriceKR = responseKR.data.price / 10000;

      const responseTW = await axios.get(
        `https://tw.api.blizzard.com/data/wow/token/?namespace=dynamic-tw&locale=en_TW`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      this.wowTokenPriceTW = responseTW.data.price / 10000;

      this.showChart();
    } catch (error) {
      console.log(error);
    }
    this.loading = false;
  }

  showChart() {
    Chart.register(...registerables);
    const barChart = new Chart(this.barChart.nativeElement, {
      type: 'bar',
      data: {
        labels: ['EU', 'US', 'KR', 'TW'],
        datasets: [
          {
            label: 'WoW Token Price',
            data: [
              this.wowTokenPriceEU,
              this.wowTokenPriceUS,
              this.wowTokenPriceKR,
              this.wowTokenPriceTW,
            ],
            backgroundColor: 'gold',
            borderColor: 'black',
            borderWidth: 2,
          },
        ],
      },
    });
  }
}
