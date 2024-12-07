import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root', 
})
export class TokenService {
  private accessToken: string = "";
  private expirationTime: number = 0 //token traje neko vreme

  constructor() {}

  async getAccessToken(): Promise<string> {
    const currentTime = Date.now() / 1000; // Trenutno vreme u sekundama od 1970
    // Ako je vec vratio token, i nije istekao, vrati taj
    if (this.accessToken!="" && this.expirationTime > currentTime) {
      return this.accessToken;
    }

    // Ako ne postoji token, ili je istekao, vrati novi
    const response = await axios.post(
      'https://us.battle.net/oauth/token',
      'grant_type=client_credentials',
      {
        auth: {
          username: environment.blizzardClientId,
          password: environment.blizzardClientSecret,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    // Vreme isteka tokena je trenutno vreme + koliko su odlucili da traje (za sad je 24h)
    this.expirationTime = Math.floor(Date.now() / 1000) + response.data.expires_in;

    this.accessToken = response.data.access_token;
    return this.accessToken;
  }
}