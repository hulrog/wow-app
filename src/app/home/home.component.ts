import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild('barChart', { static: true }) barChart!: ElementRef;

  wowTokenPriceEU: number;
  wowTokenPriceUS: number;
  wowTokenPriceKR: number;
  wowTokenPriceTW: number;
  loading: boolean;

  constructor() {
    this.wowTokenPriceEU = 0;
    this.wowTokenPriceEU = 0;
    this.wowTokenPriceUS = 0;
    this.wowTokenPriceKR = 0;
    this.wowTokenPriceTW = 0;
    this.loading = true;
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

    this.getWowTokenPrices(accessToken);
  }

  async getWowTokenPrices(accessToken: string) {
    this.loading = true;
    try {
      const responseEU = await axios.get(
        `https://eu.api.blizzard.com/data/wow/token/?namespace=dynamic-eu&locale=en_EU&access_token=${accessToken}`
      );
      this.wowTokenPriceEU = responseEU.data.price / 10000; // jer je u copperu pa je u goldu / 10000

      const responseUS = await axios.get(
        `https://us.api.blizzard.com/data/wow/token/?namespace=dynamic-us&locale=en_US&access_token=${accessToken}`
      );
      this.wowTokenPriceUS = responseUS.data.price / 10000;

      const responseKR = await axios.get(
        `https://kr.api.blizzard.com/data/wow/token/?namespace=dynamic-kr&locale=en_EU&access_token=${accessToken}`
      );
      this.wowTokenPriceKR = responseKR.data.price / 10000;

      const responseTW = await axios.get(
        `https://tw.api.blizzard.com/data/wow/token/?namespace=dynamic-tw&locale=en_TW&access_token=${accessToken}`
      );
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
