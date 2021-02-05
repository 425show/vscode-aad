import { ExtensionContext } from 'vscode';
import { registerCommands } from "./commands";
import { registerTreeProvider } from './tree';

// tslint:disable-next-line:max-func-body-length
// tslint:disable-next-line: typedef
export function activate(context: ExtensionContext) {

    console.log('Congratulations, your extension "azure-ad-authentication" is now active!');

    //Initialize all the commands
    registerCommands(context);

    //Register the tree provider that shows the data
    registerTreeProvider(context);

    /*
    commands.registerCommand('azureAd.refreshEntry', () => {

    });

    commands.registerCommand('azureAd.deleteApp', () => {
    });

    commands.registerCommand('azureAd.createNewApp', () => {
        window.showInformationMessage('Create a new App Registration in Azure AD');
    });
    */
}

export function deactivate() { }




