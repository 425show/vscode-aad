import path = require("path");
import { env, ExtensionContext, Uri } from "vscode";

export async function openUri(uri: string) {
    await env.openExternal(Uri.parse(uri));
}

export function getIconPath(context: ExtensionContext, iconName: string) {
    return {
        dark: joinPath(context, `resources/dark/${iconName}`),
        light: joinPath(context, `resources/light/${iconName}`)
    };
}

export function joinPath(context: ExtensionContext, fragment: string) {
    let uri: string | Uri;

    // @ts-ignore
    if (context.extensionUri) {
        // @ts-ignore
        uri = Uri.joinPath(context.extensionUri, fragment);
    } else {
        uri = path.join(context.extensionPath, fragment);
    }

    return uri;
}

export class spaApp {
    public name: string;
    public appId: string;
    public objectId: string;
    public desc: string;

    constructor(name: string, appId: string, objectId: string, description: string) {

        this.name = name;
        this.appId = appId;
        this.objectId = objectId;
        this.desc = description;
    }

}
