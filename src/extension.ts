import { commands, env, Uri, window } from 'vscode';
import TokenHandler from './TokenHandler';
import { AppRegistrationDataProvider } from './TreeView';

//import open = require('open');

// tslint:disable-next-line:max-func-body-length
// tslint:disable-next-line: typedef
export function activate() {

    console.log('Congratulations, your extension "azure-ad-authentication" is now active!');

    window.createTreeView('azureActiveDirectoryAuth', {
        treeDataProvider: new AppRegistrationDataProvider(new TokenHandler())
    });

    commands.registerCommand('azureAd.refreshEntry', () => {
    });

    commands.registerCommand('azureAd.deleteApp', () => {
    });

    commands.registerCommand('azureAd.openInPortal', async (x) => {

        await openUri(`https://aad.portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Overview/appId/${x.appId}/IsMSAApp/`);
        if (x !== undefined) {
            window.showInformationMessage(`You selected the following item ${x.label} with id ${x.id}`);
        }
    });

    commands.registerCommand('azureAd.createNewApp', () => {
        window.showInformationMessage('Create a new App Registration in Azure AD');
    });
}

export function deactivate() { }

export async function openUri(uri: string) {
    await env.openExternal(Uri.parse(uri));
}


