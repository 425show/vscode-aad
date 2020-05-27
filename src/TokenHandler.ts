import { TokenCredentials } from 'ms-rest';
import { AzureEnvironment } from 'ms-rest-azure';
import { window } from 'vscode';
import * as account from './account';
import { openUri } from './extension';
import { GraphClient } from './graphClient';

// todo: move this
// todo: handle refresh token
// todo: store the refresh token somewhere safe
// todo: persist so login doesn't happen every start
// tood: check token expiration
export default class TokenHandler {
    private accessToken: string;

    public async getAccessToken(): Promise<string> {
        if (this.accessToken === undefined || this.accessToken === null || this.accessToken === "") {
            var tenant = "common";
            //61b1a626-e268-4ae5-afdf-25f6f58dcc0f
            const tokenResponse = await account.login('61b1a626-e268-4ae5-afdf-25f6f58dcc0f', AzureEnvironment.Azure, false, tenant, openUri, async () => console.log('Browser did not connect to local server within 10 seconds.'))
                .catch(console.error);
            if (tokenResponse) {
                this.accessToken = tokenResponse.accessToken;
                var meData: any = await this.fetchGraphData("me", tokenResponse.accessToken, tenant);
                window.showInformationMessage("Hi " + meData.me.givenName + ", " + meData.me.userPrincipalName + "!");
            }
            else {
                window.showErrorMessage("bad token response i guess");
            }
        }
        return this.accessToken;
    }

    public async fetchGraphData(path: string, accessToken: any, tenant: string) {
        const cred = new TokenCredentials(accessToken, "Bearer");
        const client = new GraphClient(cred, tenant);
        return {
            me: await client.details.get(path)
        };
    }
}
