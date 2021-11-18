import { ExtensionContext, TreeItem } from "vscode";
import { getIconPath } from "../util";

export class AppRegistrationEntityItem extends TreeItem {
    public objectType: string;
    public name: string;

    constructor(name: string, objectType: string) {
        super(name);
        this.objectType = objectType;
        this.name = name;
    }
}

export class AppRegistrationMetadataItem extends AppRegistrationEntityItem {
    constructor(
        appName: string,
        public appId: string,
        private objectId: string,
        public tenantId: string,
        public appDescription: string,
        extensionContext: ExtensionContext) {
        super(appName, "AppRegistrationMetadataItem");

        this.label = `${appName}-${this.appId}`;
        this.id = this.objectId;
        this.tooltip = `${appName}-${this.objectId}`;
        this.description = appDescription;
        this.iconPath = getIconPath(extensionContext, "resources/app.svg")
    }
};

export class AppRegistrationRedirectUriItem extends AppRegistrationEntityItem {
    // private uri: string;
    //private type: string;

    constructor(uri: string) {
        super(uri, "AppRegistrationRedirectUriItem");
        // this.uri = uri;
        //this.type = type;
    }
}
