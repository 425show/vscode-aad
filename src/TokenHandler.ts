import { MsalAuthenticator } from './authentication';

export default class TokenHandler {
    private msal: MsalAuthenticator;

    constructor(msal: MsalAuthenticator) {
        this.msal = msal;
    }

    private async MsalReady(): Promise<boolean> {
        var accounts = await this.msal.client.getTokenCache().getAllAccounts();
        console.log(`found ${accounts.length} accounts in the msal cache`);
        return accounts.length > 0;
    }

    public async getAccessToken(): Promise<string> {
        if (!await this.MsalReady()) {
            await this.msal.StartLogin();
            return "";
        }

        var token = await this.msal.GetAccessToken();
        return token ? token : "";
    }
}
