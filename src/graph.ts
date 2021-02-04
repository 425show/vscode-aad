import graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

function getAuthenticatedClient(accessToken: string): graph.Client {
    const client = graph.Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        }
    })

    return client;
}

export async function GetAzureADAppRegistrations(accessToken: string) {
    const client = getAuthenticatedClient(accessToken);
    return await client
        .api('/applications')
        .select("appId,displayName,id")
        .top(20)
        .get();
}
