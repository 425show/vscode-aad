import * as path from 'path';
import { Context } from 'vm';
import * as vscode from 'vscode';

export class AppRegistrationEntry extends vscode.TreeItem {
    constructor(
        private appName: string,
        private appId: string,
        public tenantId: string,
        public appDescription: string) {
        super(appName, vscode.TreeItemCollapsibleState.None)
        this.label = `${appName}-${appId}`
        this.id = appId
        this.tooltip = `${appName}-${appId}`
        this.description = appDescription
    }

    get name(): string {
        return this.appName;
    }

    iconPath: any = {
        light: this.getIconPath('light'),
        dark: this.getIconPath('dark')
    }

    private getIconPath(theme: string): string {
        return path.join(__filename, '..', '..', '..', 'resources', theme, 'app.svg')
    }
};

export class AppRegistrationDataProvider implements vscode.TreeDataProvider<AppRegistrationEntry>{

    private _onDidChangeTreeData: vscode.EventEmitter<AppRegistrationEntry | undefined> = new vscode.EventEmitter<AppRegistrationEntry | undefined>();
    readonly onDidChangeTreeData: vscode.Event<AppRegistrationEntry | undefined> = this._onDidChangeTreeData.event;

    constructor(context: Context) {
        const test = context;
    }

    refresh(app: AppRegistrationEntry): void {
        this._onDidChangeTreeData.fire(app);
    }

    getTreeItem(element: AppRegistrationEntry): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(element.name, vscode.TreeItemCollapsibleState.None);
        treeItem.command = { command: 'azureAd.openInPortal', title: "Open App in Azure AD", arguments: [element] };
        return treeItem;
    };

    getChildren(element?: AppRegistrationEntry): AppRegistrationEntry[] {
        if (!element) {
            return this.getAppRegistrationData();
        }
        return [];
    };

    private getAppRegistrationData(): AppRegistrationEntry[] {
        // TODO - call into Azure AD to get a list of applications
        return azureAdApps;
    }
};

const azureAdApps: AppRegistrationEntry[] = [
    new AppRegistrationEntry("test 1", 'bee32d27-242d-4287-8067-65a7d18db831', '87331a93-c272-4e6b-8ca9-3bbdce23d864', "test 1 description"),
    new AppRegistrationEntry("test 2", '7d712f7e-8528-494b-9eeb-f293efbde2ec', '87331a93-c272-4e6b-8ca9-3bbdce23d864', "test 2 description"),
    new AppRegistrationEntry("test 3", '050651d1-bac1-41b4-8296-e8b770aea175', '87331a93-c272-4e6b-8ca9-3bbdce23d864', "test 3 description"),
    new AppRegistrationEntry("test 4", 'd73d3a1b-e024-4fcd-9964-6330471b6134', '87331a93-c272-4e6b-8ca9-3bbdce23d864', "test 4 description"),
    new AppRegistrationEntry("test 5", '64eeb344-db52-4413-8bf2-05a73aae03a1', '87331a93-c272-4e6b-8ca9-3bbdce23d864', "test 5 description"),
    new AppRegistrationEntry("test 6", '71d10739-b50e-4182-aff5-ccf7d349928f', '87331a93-c272-4e6b-8ca9-3bbdce23d864', "test 6 description"),
];
