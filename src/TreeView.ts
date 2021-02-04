import { TokenCredentials } from 'ms-rest';
import * as path from 'path';
import * as vscode from 'vscode';
import * as graph from './graph';
import { GraphClient } from './graphClient';
import TokenHandler from "./TokenHandler";

export class AppRegistrationEntityItem extends vscode.TreeItem {
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
        private appId: string,
        private objectId: string,
        public tenantId: string,
        public appDescription: string) {
        super(appName, "AppRegistrationMetadataItem");

        this.label = `${appName}-${this.appId}`
        this.id = this.objectId;
        this.tooltip = `${appName}-${this.appId}`
        this.description = appDescription
    }

    iconPath: any = {
        light: this.getIconPath('light'),
        dark: this.getIconPath('dark')
    }

    private getIconPath(theme: string): string {
        return path.join(__filename, '..', '..', '..', 'resources', theme, 'app.svg')
    }
};



export class AppRegistrationRedirectUriItem extends AppRegistrationEntityItem {
    // private uri: string;
    // private type: string;

    constructor(uri: string, type: string) {
        super(uri, "AppRegistrationRedirectUriItem");
        // this.uri = uri;
        // this.type = type;
    }
}

export class AppRegistrationDataProvider implements vscode.TreeDataProvider<AppRegistrationEntityItem>{
    private handler: TokenHandler;

    constructor(ok: TokenHandler) {
        this.handler = ok;
    }

    private _onDidChangeTreeData: vscode.EventEmitter<AppRegistrationEntityItem | undefined> = new vscode.EventEmitter<AppRegistrationEntityItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<AppRegistrationEntityItem | undefined> = this._onDidChangeTreeData.event;

    refresh(app: AppRegistrationEntityItem): void {
        this._onDidChangeTreeData.fire(app);
    }

    getTreeItem(element: AppRegistrationEntityItem): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(element.name, vscode.TreeItemCollapsibleState.Collapsed);
        //treeItem.command = { command: 'azureAd.openInPortal', title: "Open App in Azure AD", arguments: [element] };

        return treeItem;
    };

    async getChildren(element?: AppRegistrationEntityItem): Promise<AppRegistrationEntityItem[]> {
        if (!element) { //root element
            return await this.getAppRegistrationData();
        }

        switch (element?.objectType) {
            case "AppRegistrationMetadataItem":
                {
                    var uris: AppRegistrationRedirectUriItem[] = [];

                    var item = element as AppRegistrationMetadataItem;
                    var token = await this.handler.getAccessToken();
                    var graphClient = new GraphClient(new TokenCredentials(token), "jpd.ms");
                    var app = await graphClient.details.get(`applications/${item.id}?$select=web`); // it's like powershell!
                    for (var i = 0; i < app.web.redirectUris.length; i++) {
                        uris.push(new AppRegistrationRedirectUriItem(app.web.redirectUris[i], "web"));
                    }
                    return uris;
                }
                break;

            default:
                return [];
                break;
        }


        // var token = await this.handler.getAccessToken();
        // var graphClient = new GraphClient(new TokenCredentials(token), "jpd.ms");
        // var app = await graphClient.details.get("applications/" + element.id);




    };

    private async getAppRegistrationData(): Promise<AppRegistrationMetadataItem[]> {
        // TODO - call into Azure AD to get a list of applications
        var token = await this.handler.getAccessToken();
        var graphClient = new GraphClient(new TokenCredentials(token), "jpd.ms");
        //var apps = await graphClient.details.get("applications?$top=10");

        var apps = await graph.GetAzureADAppRegistrations(token);

        var azureAdApps: AppRegistrationMetadataItem[] = [];
        for (var i = 0; i < apps.value.length; i++) {
            var name = apps.value[i].displayName;
            var appId = apps.value[i].appId;
            var objectId = apps.value[i].id;
            var desc = name;
            azureAdApps.push(new AppRegistrationMetadataItem(name, appId, objectId, "tbd", desc));
        }
        return azureAdApps;
    }
};

// const azureAdApps: AppRegistrationEntry[] = [
//     new AppRegistrationEntry("test 1", 'bee32d27-242d-4287-8067-65a7d18db831', '87331a93-c272-4e6b-8ca9-3bbdce23d864', "test 1 description"),
//     new AppRegistrationEntry("test 2", '7d712f7e-8528-494b-9eeb-f293efbde2ec', '87331a93-c272-4e6b-8ca9-3bbdce23d864', "test 2 description"),
//     new AppRegistrationEntry("test 3", '050651d1-bac1-41b4-8296-e8b770aea175', '87331a93-c272-4e6b-8ca9-3bbdce23d864', "test 3 description"),
//     new AppRegistrationEntry("test 4", 'd73d3a1b-e024-4fcd-9964-6330471b6134', '87331a93-c272-4e6b-8ca9-3bbdce23d864', "test 4 description"),
//     new AppRegistrationEntry("test 5", '64eeb344-db52-4413-8bf2-05a73aae03a1', '87331a93-c272-4e6b-8ca9-3bbdce23d864', "test 5 description"),
//     new AppRegistrationEntry("test 6", '71d10739-b50e-4182-aff5-ccf7d349928f', '87331a93-c272-4e6b-8ca9-3bbdce23d864', "test 6 description"),
// ];
