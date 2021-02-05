import {
    Event, EventEmitter, ExtensionContext,
    TreeDataProvider,
    TreeItem,
    TreeItemCollapsibleState,
    window
} from 'vscode';
import { EXTENSION_NAME } from '../constants';
import * as graph from '../graph';
import TokenHandler from "../TokenHandler";
import {
    AppRegistrationEntityItem,
    AppRegistrationMetadataItem,
    AppRegistrationRedirectUriItem
} from './node';

export class AppRegistrationDataProvider implements TreeDataProvider<AppRegistrationEntityItem>{
    private handler: TokenHandler;
    private extensionContext: ExtensionContext;

    constructor(ok: TokenHandler, context: ExtensionContext) {
        this.handler = ok;
        this.extensionContext = context;
    }

    private _onDidChangeTreeData: EventEmitter<AppRegistrationEntityItem | undefined> = new EventEmitter<AppRegistrationEntityItem | undefined>();
    readonly onDidChangeTreeData: Event<AppRegistrationEntityItem | undefined> = this._onDidChangeTreeData.event;


    refresh(app: AppRegistrationEntityItem): void {
        this._onDidChangeTreeData.fire(app);
    }

    getTreeItem(element: AppRegistrationEntityItem): TreeItem {
        const treeItem = new TreeItem(element.name, TreeItemCollapsibleState.Collapsed);
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
                    var redirectUris = await graph.getRedirectUrisForSPA(token, item.id);
                    for (var i = 0; i < redirectUris.length; i++) {
                        uris.push(new AppRegistrationRedirectUriItem(redirectUris[i]));
                    }
                    return uris;
                }
                break;

            default:
                return [];
                break;
        }
    };

    private async getAppRegistrationData(): Promise<AppRegistrationMetadataItem[]> {
        var token = await this.handler.getAccessToken();
        var apps = await graph.getAzureADAppRegistrations(token);

        var azureAdApps: AppRegistrationMetadataItem[] = [];
        apps.forEach(element => {
            azureAdApps.push(new AppRegistrationMetadataItem(
                element.name,
                element.appId,
                element.objectId,
                "tbd",
                element.desc,
                this.extensionContext));
        });
        return azureAdApps;
    }
};

export function registerTreeProvider(
    extensionContext: ExtensionContext
) {
    const treeDataProvider = new AppRegistrationDataProvider(new TokenHandler(), extensionContext);
    window.createTreeView(`${EXTENSION_NAME}.apps`, {
        showCollapseAll: true,
        treeDataProvider,
        canSelectMany: false
    });
}
