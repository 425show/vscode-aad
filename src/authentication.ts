const msal = require('@azure/msal-node');

const config = {
    auth: {
        clientId: "d0be65c9-e44b-4e29-8a94-d0edc65e2f80",
        //authority: "https://login.microsoftonline.com/christosmatskasoutlook.onmicrosoft.com",
        authority: "https://login.microsoftonline.com/organizations"
    }
};

const pca = new msal.PublicClientApplication(config);

const deviceCodeRequest = {
    deviceCodeCallback: (response) => (console.log(response.message)),
    scopes: ["https://graph.microsoft.com/.default"], //&prompt=select_account"], //"openid", "profile", "offline_access",
    timeout: 60,
};

export async function login() {
    let token: string = "";
    try {
        var response = await pca.acquireTokenByDeviceCode(deviceCodeRequest);
        token = response.accessToken;
        console.log(JSON.stringify(response));
    }
    catch (error) {
        console.log(JSON.stringify(error));
    };
    return token;
}
