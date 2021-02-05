import { ExtensionContext } from "vscode";
import { registerOpenInPortalCommand } from "./openInPortal";

export function registerCommands(context: ExtensionContext) {
    registerOpenInPortalCommand(context);
}
