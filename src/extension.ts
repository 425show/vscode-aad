import { TokenCredentials } from 'ms-rest';
import { AzureEnvironment } from 'ms-rest-azure';
import { commands, env, Uri, window } from 'vscode';
import * as account from './account';
import { GraphClient } from './graphClient';
import { AppRegistrationDataProvider, AppRegistrationEntry } from './TreeView';


import open = require('open');

// tslint:disable-next-line:max-func-body-length
export function activate() {

    console.log('Congratulations, your extension "azure-ad-authentication" is now active!');

    window.createTreeView('azureActiveDirectoryAuth', {
        treeDataProvider: new AppRegistrationDataProvider()
    });

    commands.registerCommand('azureAd.selectSubscription', (x) => {
        console.log(x);
        // Display a message box to the user
        window.showInformationMessage('Select the Azure Subscription!');
    });

    commands.registerCommand('azureAd.loginAndTellMeImPretty', async () => {
        var tenant = "microsoft.com";
        const tokenResponse = await account.login('641d7b63-e779-4b23-9ef1-26481c4e3f63', AzureEnvironment.Azure, false, tenant,
            openUri,
            async () => console.log('Browser did not connect to local server within 10 seconds.'))
            .catch(console.error);

        if (tokenResponse) {
            window.showInformationMessage(tokenResponse.accessToken);
            var meData: any = await fetchMyDetails(tokenResponse.accessToken, tenant);
            window.showInformationMessage("Hi " + meData.me.givenName + ", " + meData.me.userPrincipalName + "!");
        } else {
            window.showErrorMessage("bad token response i guess");
        }
        window.showInformationMessage('Hello World from aad-app-creator!');
    });

    commands.registerCommand('azureAd.refreshEntry', () => {
    });

    commands.registerCommand('azureAd.deleteApp', () => {
    });

    commands.registerCommand('azureAd.openInPortal', async (x: AppRegistrationEntry) => {

        // TODO Open the App Regisrations in Azure AD in the portal
        await open('https://microsoft.com');
        if (x !== undefined) {
            window.showInformationMessage(`You selected the following item ${x.label} with id ${x.id}`);
        }
    });

    commands.registerCommand('azureAd.createNewApp', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        window.showInformationMessage('Create a new App Registration in Azure AD');
    });

    //context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }


async function openUri(uri: string) {
    await env.openExternal(Uri.parse(uri));
}


async function fetchMyDetails(accessToken: any, tenant: string) {
    //const { username, clientId, tokenCache, domain } = <any>session.credentials;
    const cred = new TokenCredentials(accessToken, "Bearer");
    //const graphCredentials = new DeviceTokenCredentials({ username, clientId, tokenCache, domain, tokenAudience: 'https://graph.microsoft.com/' });

    const client = new GraphClient(cred, tenant);
    return {
        me: await client.details.get("me")
    };
}
