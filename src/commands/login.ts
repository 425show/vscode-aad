import { commands, ExtensionContext } from "vscode";
import { MsalAuthenticator } from "../authentication";
import { COMMAND_NAME } from "../constants";

export function registerLoginCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(`${COMMAND_NAME}.LoginAndTellMeImPretty`, async () => {
            var msal = MsalAuthenticator.getInstance();
            await msal.StartLogin();
        })
    );
}
