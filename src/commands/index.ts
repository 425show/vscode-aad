import { ExtensionContext } from "vscode";
import { MsalAuthenticator } from "../authentication";
import { registerDeleteAppCommand } from "./delete";
import { registerLoginCommand } from "./login";
import { registerLogoutCommand } from "./logout";
import { registerOpenInPortalCommand } from "./openInPortal";

export function registerCommands(context: ExtensionContext, msal: MsalAuthenticator) {
    registerOpenInPortalCommand(context);
    registerLoginCommand(context);
    registerDeleteAppCommand(context, msal);
    registerLogoutCommand(context, msal);
}
