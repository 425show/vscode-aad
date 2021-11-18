import { CryptoProvider, PublicClientApplication } from '@azure/msal-node';
import * as vscode from 'vscode';
import { Memento } from 'vscode';
import { EXTENSION_NAME, MSAL_CONFIG, MSAL_SCOPES, PUBLISHER_NAME } from './constants';

// see https://www.chrishasz.com/blog/2020/07/28/vscode-how-to-use-local-storage-api/
export class LocalStorageService {
    private storage: Memento;

    constructor(storage: Memento) {
        console.debug(`creating LocalStorageService`);
        this.storage = storage;
    }

    public getValue<T>(key: string): T | null {
        console.debug(`getting memento data for ${key}...`);
        return this.storage.get<T | null>(key, null);
    }

    public setValue<T>(key: string, value: T) {
        console.debug(`setting memento data for ${key}...`);
        this.storage.update(key, value);
    }
}

export class MsalMementoCache {
    private store: LocalStorageService;

    public constructor(context: vscode.ExtensionContext) {
        console.debug("creating new msalmementocache");
        this.store = new LocalStorageService(context.globalState);
    }

    public async beforeCacheAccess(cacheContext: any): Promise<void> {
        console.debug("getting msal memento cache...");
        var cacheData = this.store.getValue("msal-cache");
        cacheContext.tokenCache.deserialize(cacheData);
    }

    public async afterCacheAccess(cacheContext: any): Promise<void> {
        if (cacheContext.cacheHasChanged) {
            console.debug("memento cache changed, storing...");
            this.store.setValue("msal-cache", cacheContext.tokenCache.serialize());
        }
    };
}

export class MsalAuthenticator {
    private pkceCodes = {
        verifier: "",
        challenge: "",
        challengeMethod: "S256"
    }

    private homeAccountId: string | undefined;

    public client: PublicClientApplication;

    // for handling a single instance of the handler, use getInstance() elsewhere
    static instance?: MsalAuthenticator;

    public static getInstance(cache?: MsalMementoCache) {
        if (!this.instance) {
            this.instance = this.createInstance(cache);
        }
        return this.instance;
    }

    //msal logout
    public async Logout() {
        console.debug("logging out...");
        const redirectUrl = await vscode.env.asExternalUri(vscode.Uri.parse(`${vscode.env.uriScheme}://${PUBLISHER_NAME}.${EXTENSION_NAME}/logout`));
        var logoutUri = `https://login.microsoftonline.com/common/oauth2/v2.0/logout?${redirectUrl}`;
        await vscode.env.openExternal(vscode.Uri.parse(logoutUri));
    }

    public async StartLogin(): Promise<void> {
        const cryptoProvider = new CryptoProvider();
        var pkceCodes = await cryptoProvider.generatePkceCodes();
        this.pkceCodes.challenge = pkceCodes.challenge;
        this.pkceCodes.verifier = pkceCodes.verifier;
        // console.debug(`generated pkce challenge: ${this.pkceCodes.challenge}`);
        // console.debug(`generated pkce verifier: ${this.pkceCodes.verifier}`);

        const redirectUrl = await vscode.env.asExternalUri(vscode.Uri.parse(`${vscode.env.uriScheme}://${PUBLISHER_NAME}.${EXTENSION_NAME}/auth-end`));
        //console.debug(`redirect: ${redirectUrl}`);
        const authCodeUrlParameters = {
            scopes: MSAL_SCOPES.scopes,
            redirectUri: redirectUrl.toString().split("?")[0],
            codeChallenge: this.pkceCodes.challenge,
            codeChallengeMethod: this.pkceCodes.challengeMethod
        };

        var url = await this.client.getAuthCodeUrl(authCodeUrlParameters);
        await vscode.env.openExternal(vscode.Uri.parse(url));
    }

    public async EndLogin(uriData: vscode.Uri): Promise<string> {
        var code = uriData.query.split('code=')[1].split('&')[0];
        var token = await this.client.acquireTokenByCode({
            scopes: MSAL_SCOPES.scopes,
            code: code,
            codeVerifier: this.pkceCodes.verifier,
            redirectUri: `${vscode.env.uriScheme}://${PUBLISHER_NAME}.${EXTENSION_NAME}/auth-end`
        });
        this.homeAccountId = token?.account?.homeAccountId;
        return token ? token.accessToken : "";
    }

    public async GetAccessToken(scopes?: string[]) {
        try {
            var homeAccount = await this.client.getTokenCache().getAccountByHomeId(this.homeAccountId ? this.homeAccountId : "");
            if (!homeAccount) {
                var accounts = await this.client.getTokenCache().getAllAccounts();
                if (accounts.length == 0) console.error("no accounts - login please");
                homeAccount = accounts[0];
            }

            var tokenResult = await this.client.acquireTokenSilent({
                account: homeAccount,
                scopes: scopes ? scopes : MSAL_SCOPES.scopes
            });
            return tokenResult?.accessToken;
        } catch (ex) {
            console.error("no accounts, login first");
            return;
        }
    }

    private static createInstance(cache?: MsalMementoCache) {
        var a = new MsalAuthenticator(cache);
        return a;
    }

    // we want this private to prevent any external callers from directly instantiating, instead rely on getInstance()
    private constructor(cache?: MsalMementoCache) {
        var config;

        const cachePlugin = {
            beforeCacheAccess: async (cacheContext) => {
                await cache?.beforeCacheAccess(cacheContext);
            },
            afterCacheAccess: async (cacheContext) => {
                await cache?.afterCacheAccess(cacheContext);
            }
        };

        if (cache) {
            console.debug(`msalauthenticator private ctor; has cache`);
            config = {
                ...MSAL_CONFIG, cache: { cachePlugin } // todo: why do i have to do this - the signatures look OK
            }
        } else {
            console.debug(`msalauthenticator private ctor; no cache`);
            config = MSAL_CONFIG;
        }
        // console.debug("msal config:");
        // console.dir(config);
        const a = new PublicClientApplication(config);
        this.client = a;
    }
}
