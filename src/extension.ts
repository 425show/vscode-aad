// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, ExtensionContext, window } from 'vscode';
import { AppRegistrationDataProvider } from './TreeView';

// tslint:disable-next-line:max-func-body-length
export function activate(context: ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "azure-ad-authentication" is now active!');

    window.createTreeView('azureActiveDirectoryAuth', {
        treeDataProvider: new AppRegistrationDataProvider()
    });

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = commands.registerCommand('azureAd.SelectSubscription', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        window.showInformationMessage('Select the Azure Subscription!');
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
