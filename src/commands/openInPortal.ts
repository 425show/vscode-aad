import { commands, ExtensionContext, window } from "vscode";
import { COMMAND_NAME } from "../constants";
import { AppRegistrationMetadataItem } from "../tree/node";
import { openUri } from "../util";

export async function registerOpenInPortalCommand(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(`${COMMAND_NAME}.openInPortal`, async (x: AppRegistrationMetadataItem) => {
            await openUri(`https://aad.portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Overview/appId/${x.id}/IsMSAApp/`);
            if (x !== undefined) {
                window.showInformationMessage(`You selected the following item ${x.label} with id ${x.id}`);
            }
        })
    );
}

