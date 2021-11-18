import { commands, ExtensionContext } from "vscode";
import { MsalAuthenticator } from "../authentication";
import { COMMAND_NAME } from "../constants";

export function registerLogoutCommand(context: ExtensionContext, msal: MsalAuthenticator) {
    context.subscriptions.push(
        commands.registerCommand(`${COMMAND_NAME}.Logout`, async () => {
            await msal.Logout();
        })
    );
}
