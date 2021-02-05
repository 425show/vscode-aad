import { commands, ExtensionContext } from "vscode";
import { MsalAuthenticator } from "../authentication";
import { COMMAND_NAME } from "../constants";
import { registerOpenInPortalCommand } from "./openInPortal";

export function registerCommands(context: ExtensionContext) {
    registerOpenInPortalCommand(context);
    registerLoginCommand(context);
}

export function registerLoginCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(`${COMMAND_NAME}.LoginAndTellMeImPretty`, async () => {
            var msal = MsalAuthenticator.getInstance();
            await msal.StartLogin();
        })
    );
}
