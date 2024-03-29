import axios from 'axios';

class AccessToken {
  gcDomain: string;
  apiDomain: string;
  siteId: string;
  protected apiKey: string;
  protected apiSecret: string;
  isTestEnv: boolean;
  protected accessToken: string;
  protected fullAccessToken: string;

  constructor(siteId: string, apiKey: string, apiSecret: string, isTestEnv: boolean = false) {
    this.siteId = siteId;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.isTestEnv = isTestEnv;
    this.gcDomain = isTestEnv ? 'drhadmin-sys-drx.drextenv.net' : 'store.digitalriver.com';
    this.apiDomain = isTestEnv ? 'dispatch-test.digitalriver.com' : 'api.digitalriver.com';
  }

  public async getSessionToken(): Promise<string> {
    try {
      const url = `https://${this.gcDomain}/store/${this.siteId}/SessionToken?format=json`;
      const response = await axios.get(url);

      return response.data.session_token;
    } catch (error) {
      console.error(error);
    }
  }

  public async getAccessToken(): Promise<string> {
    try {
      const sessionToken = await this.getSessionToken();
      const url = `https://${this.apiDomain}/oauth20/token.json`;
      const response = await axios.post(url, {
        dr_session_token: sessionToken,
        grant_type: 'password'
      }, {
        auth: {
          username: this.apiKey,
          password: this.apiSecret
        }
      });

      this.accessToken = response.data.token.access_token;

      return this.accessToken;
    } catch (error) {
      console.error(error);
    }
  }

  public async getFullAccessToken(extRefId: string): Promise<string> {
    try {
      if (!this.accessToken) {
        await this.getAccessToken();
      }

      const url = `https://${this.apiDomain}/oauth20/token.json`;
      const response = await axios.post(url, {
        grant_type: 'client_credentials',
        dr_external_reference_id: extRefId,
        dr_limited_token: this.accessToken
      }, {
        auth: {
          username: this.apiKey,
          password: this.apiSecret
        }
      });

      this.fullAccessToken = response.data.token.access_token;

      return this.fullAccessToken;
    } catch (error) {
      console.error(error);
    }
  }
}