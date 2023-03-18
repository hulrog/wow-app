import { Component } from '@angular/core';
import axios from 'axios';
import { windowWhen } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
})
export class HomeComponent {
  wowTokenPriceEU: number;
  wowTokenPriceUS: number;
  wowTokenPriceKR: number;
  wowTokenPriceTW: number;

  constructor() {
    this.wowTokenPriceEU = 0;
    this.wowTokenPriceEU = 0;
    this.wowTokenPriceUS = 0;
    this.wowTokenPriceKR = 0;
    this.wowTokenPriceTW = 0;
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

    // Retrieve WoW Token price using access token
    try {
      const responseEU = await axios.get(
        `https://eu.api.blizzard.com/data/wow/token/?namespace=dynamic-eu&locale=en_EU&access_token=${accessToken}`
      );
      this.wowTokenPriceEU = responseEU.data.price / 10000; // WoW Token price is in copper

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
    } catch (error) {
      console.log(error);
    }
  }
}
