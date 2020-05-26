import { commands, ExtensionContext, window } from 'vscode';
import { AppRegistrationDataProvider, AppRegistrationEntry } from './TreeView';
import open = require('open');

// tslint:disable-next-line:max-func-body-length
export function activate(context: ExtensionContext) {

    console.log('Congratulations, your extension "azure-ad-authentication" is now active!');

    window.createTreeView('azureActiveDirectoryAuth', {
        treeDataProvider: new AppRegistrationDataProvider(context)
    });


    let disposable = commands.registerCommand('azureAd.selectSubscription', (x) => {
        //

        console.log(x);
        // Display a message box to the user
        window.showInformationMessage('Select the Azure Subscription!');
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

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
