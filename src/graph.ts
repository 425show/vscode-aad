import { PageCollection, PageIterator, PageIteratorCallback } from '@microsoft/microsoft-graph-client';
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import { spaApp } from './util';
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

/// Get all the Azure AD App registrations that are configured for SPAs
export async function getAzureADAppRegistrations(accessToken: string) {
    const client = getAuthenticatedClient(accessToken);
    let apps: spaApp[] = [];
    let response: PageCollection = await client
        .api('/applications')
        .select("appId,displayName,id,description,spa")
        .top(100)
        .get();

    let callback: PageIteratorCallback = (data: MicrosoftGraph.Application) => {
        if (data.spa && data.spa.redirectUris && data.spa?.redirectUris?.length > 0) {
            apps.push(new spaApp(
                data.displayName ? data.displayName : "no name",
                data.appId ? data.appId : "no id",
                data.id ? data.id : "no id",
                data.description ? data.description : "no description"))
        }
        return true;
    };

    let pageIterator = new PageIterator(client, response, callback);

    await pageIterator.iterate();
    return apps;
}

export async function getTenant(accessToken: string): Promise<MicrosoftGraph.Organization> {
    const client = getAuthenticatedClient(accessToken);
    return await client
        .api('/organization')
        .get()
}
///Get the Redirect URis for an App that's configured with Web authentication
export async function getRedirectUrisForSPA(accessToken: string, appId?: string) {
    const client = getAuthenticatedClient(accessToken);
    return await client
        .api(`/applications/${appId}?$select=web`)
        .select('redirectUris')
        .get();
}

export async function addNewRedirectUri(accessToken: string, appId: string, newRedirectUri: string) {
    const client = getAuthenticatedClient(accessToken);
    var webApp: MicrosoftGraph.WebApplication = await client
        .api(`/applications/${appId}?$select=web`)
        .get();

    webApp.redirectUris?.push(newRedirectUri)

    return await client
        .api(`/applications/${appId}`)
        .patch(webApp);
}

export async function deleteRedirectUri(accessToken: string, appId: string, redirectUriToRemove: string) {
    const client = getAuthenticatedClient(accessToken);
    var webApp = await getSpaAppForAppRegistration(accessToken, appId);
    removeRedirectUriFromSpaApp(webApp, redirectUriToRemove);

    await client
        .api(`/applications/${appId}`)
        .patch(webApp);
}

export async function createAppRegistration(accessToken: string, appName: string, redirectUri: string, audience: string): Promise<MicrosoftGraph.Application> {
    const client = getAuthenticatedClient(accessToken);
    let appRegistration: MicrosoftGraph.Application = {
        displayName: appName,
        description: "Created by VS Code Azure AD Extension",
        signInAudience: getAudience(audience),
        spa: {
            redirectUris: [redirectUri]
        },
        requiredResourceAccess: [   // Required resource access for the app registration to access the resources in the Azure AD tenant
            {
                resourceAppId: "00000003-0000-0000-c000-000000000000",
                resourceAccess: [
                    {
                        id: "a42657d6-7f20-40e3-b6f0-cee03008a62a",
                        type: "Scope"
                    }]
            }]
    }

    await client
        .api('/applications')
        .post(appRegistration);

    return appRegistration;
}

export async function updateRedirectUri(accessToken: string, appId: string, oldUri: string, newUri: string) {
    const client = getAuthenticatedClient(accessToken);
    var spaApp = await getSpaAppForAppRegistration(accessToken, appId);

    removeRedirectUriFromSpaApp(spaApp, oldUri);
    spaApp.redirectUris?.push(newUri);

    await client
        .api(`/applications/${appId}`)
        .patch(spaApp);
}

export async function deleteAppRegistration(accessToken: string, appId: string) {
    const client = getAuthenticatedClient(accessToken);
    return await client
        .api(`/applications/${appId}`)
        .delete();
}

async function getSpaAppForAppRegistration(accessToken: string, appId: string,): Promise<MicrosoftGraph.SpaApplication> {
    const client = getAuthenticatedClient(accessToken);
    var spaApp: MicrosoftGraph.SpaApplication = await client
        .api(`/applications/${appId}?$select=spa`)
        .get();

    return spaApp;
}

function removeRedirectUriFromSpaApp(spaApp: MicrosoftGraph.WebApplication, uriToRemove: string): MicrosoftGraph.SpaApplication {
    if (spaApp.redirectUris && spaApp.redirectUris?.length > 0) {
        for (var i = 0; i < spaApp.redirectUris?.length; i++) {
            if (spaApp.redirectUris[i] === uriToRemove) {
                spaApp.redirectUris.splice(i, 1);
                i--;
            }
        }
    }
    return spaApp;
}

function getAudience(audience: string): string {
    switch (audience) {
        case "Single Tenant":
            return "AzureADMyOrg";
        case "Multitenant":
            return "AzureADMultipleOrgs";
        case "Multitenant & Personal Accounts":
            return "AzureADandPersonalMicrosoftAccount";
        case "Personal Accounts Only":
            return "PersonalMicrosoftAccount";
        default:
            return "AzureADMyOrg";
    }
}
