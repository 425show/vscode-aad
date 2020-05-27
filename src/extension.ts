import { commands, env, Uri, window } from 'vscode';
import TokenHandler from './TokenHandler';
import { AppRegistrationDataProvider } from './TreeView';

import open = require('open');

// tslint:disable-next-line:max-func-body-length
// tslint:disable-next-line: typedef
export function activate() {

    console.log('Congratulations, your extension "azure-ad-authentication" is now active!');

    window.createTreeView('azureActiveDirectoryAuth', {
        treeDataProvider: new AppRegistrationDataProvider(new TokenHandler())
    });

    commands.registerCommand('azureAd.selectSubscription', (x) => {
        console.log(x);
        // Display a message box to the user
        window.showInformationMessage('Select the Azure Subscription!');
    });

    commands.registerCommand('azureAd.loginAndTellMeImPretty', async () => {
        //var token = await getAccessToken();

    });

    commands.registerCommand('azureAd.refreshEntry', () => {
    });

    commands.registerCommand('azureAd.deleteApp', () => {
    });

    commands.registerCommand('azureAd.openInPortal', () => {

        // TODO Open the App Regisrations in Azure AD in the portal
        // await open('https://aad.portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Overview/appId/' + x.id);
        // if (x !== undefined) {
        //     window.showInformationMessage(`You selected the following item ${x.label} with id ${x.id}`);
        // }
    });

    commands.registerCommand('azureAd.createNewApp', () => {
        window.showInformationMessage('Create a new App Registration in Azure AD');
    });
}

export function deactivate() { }

export async function openUri(uri: string) {
    await env.openExternal(Uri.parse(uri));
}


