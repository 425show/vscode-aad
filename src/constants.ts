import * as msal from '@azure/msal-node';

export const PUBLISHER_NAME = '425show';
export const EXTENSION_NAME = 'vscode-aad-explorer';
export const COMMAND_NAME = 'azureAd'
export const MSAL_CONFIG = {
    auth: {
        clientId: "61b1a626-e268-4ae5-afdf-25f6f58dcc0f",
        authority: "https://login.microsoftonline.com/common"
    }, system: {
        loggerOptions: {
            loggerCallback(loglevel: msal.LogLevel, message: string, containsPii: boolean) {
                console.log(`${loglevel}; ${message}; ${containsPii}`);
            },
            piiLoggingEnabled: true,
            logLevel: msal.LogLevel.Info,
        }
    }
};

export const MSAL_SCOPES = {
    scopes: ["User.Read", "Application.ReadWrite.All"]
};
