import { commands, ExtensionContext, window } from "vscode";
import { MsalAuthenticator } from "../authentication";
import { COMMAND_NAME } from "../constants";
import * as graph from '../graph';
import { AppRegistrationMetadataItem } from "../tree/node";

export async function registerDeleteAppCommand(context: ExtensionContext, msal: MsalAuthenticator) {
    context.subscriptions.push(
        commands.registerCommand(`${COMMAND_NAME}.deleteApp`, async (x: AppRegistrationMetadataItem) => {
            const token = await msal.GetAccessToken();
            await graph.deleteAppRegistration(token!, x.id!);
            if (x !== undefined) {
                window.showInformationMessage(`Deleting app ${x.label} with id ${x.id}`);
            }
        })
    );
}
