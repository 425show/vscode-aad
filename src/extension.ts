import { ExtensionContext, ProviderResult, Uri, window } from 'vscode';
import { MsalAuthenticator, MsalMementoCache } from './authentication';
import { registerCommands } from "./commands";
import { EXTENSION_NAME } from './constants';
import { registerTreeProvider } from './tree';

export function activate(context: ExtensionContext) {
    console.log(`${EXTENSION_NAME} is running`);

    registerProtocolHandlersForAuthentication();
    var msal = configureStorageAndAuthentication(context);

    //Initialize all the commands
    registerCommands(context);
    //Register the tree provider that shows the data
    registerTreeProvider(context, msal);
}

export function deactivate() { }

export function registerProtocolHandlersForAuthentication() {
    console.log("registering return handler");
    window.registerUriHandler({
        handleUri(uri: Uri): ProviderResult<void> {
            console.debug("return handler running");
            MsalAuthenticator.getInstance().EndLogin(uri);//.then(x => console.debug(`end login completed`));
        }
    });
}

export function configureStorageAndAuthentication(context: ExtensionContext): MsalAuthenticator {
    return MsalAuthenticator.getInstance(new MsalMementoCache(context));
}
