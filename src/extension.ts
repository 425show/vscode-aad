import { commands, ExtensionContext, window } from 'vscode';
import { AppRegistrationDataProvider } from './TreeView';

// tslint:disable-next-line:max-func-body-length
export function activate(context: ExtensionContext) {

    console.log('Congratulations, your extension "azure-ad-authentication" is now active!');

    window.createTreeView('azureActiveDirectoryAuth', {
        treeDataProvider: new AppRegistrationDataProvider()
    });


    let disposable = commands.registerCommand('azureAd.SelectSubscription', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        window.showInformationMessage('Select the Azure Subscription!');
    });

    commands.registerCommand('azureAd.OpenInPortal', () => {
        window.showInformationMessage(`You selected the following item`);
    });

    commands.registerCommand('azureAd.CreateNewApp', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        window.showInformationMessage('Create a new App Registration in Azure AD');
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
