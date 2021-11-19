import { commands, Disposable, ExtensionContext, QuickInput, QuickInputButton, QuickInputButtons, QuickPickItem, window } from "vscode";
import { MsalAuthenticator } from "../authentication";
import { COMMAND_NAME } from "../constants";
import * as graph from "../graph";


export async function registerCreateAppCommand(context: ExtensionContext, msal: MsalAuthenticator) {
    context.subscriptions.push(
        commands.registerCommand(`${COMMAND_NAME}.createNewApp`, async () => {
            multiStepInput(context, msal);
        }));
}


export async function multiStepInput(context: ExtensionContext, msal: MsalAuthenticator) {

    const title = 'Create new Application Registration';

    const tenantOptions: QuickPickItem[] = ['Single Tenant', 'Multitenant', 'Multitenant & Personal Accounts', 'Personal Accounts Only']
        .map(label => ({ label }));

    interface State {
        title: string;
        step: number;
        totalSteps: number;
        appRegistrationName: string;
        redirectUri: string;
        tenantType: QuickPickItem;
    }

    async function collectInputs() {
        const state = {} as Partial<State>;
        await MultiStepInput.run(input => inputAppRegistrationName(input, state));
        return state as State;
    }

    async function inputAppRegistrationName(input: MultiStepInput, state: Partial<State>) {
        state.appRegistrationName = await input.showInputBox({
            title,
            step: 1,
            totalSteps: 3,
            value: typeof state.appRegistrationName === 'string' ? state.appRegistrationName : '',
            prompt: 'Choose a name for your app registration',
            validate: validateName,
            shouldResume: shouldResume
        });
        return (input: MultiStepInput) => pickTenantType(input, state);
    }

    async function pickTenantType(input: MultiStepInput, state: Partial<State>) {
        const pick = await input.showQuickPick({
            title,
            step: 2,
            totalSteps: 3,
            placeholder: 'Type of app you need to create',
            items: tenantOptions,
            activeItem: typeof state.tenantType !== 'string' ? state.tenantType : undefined,
            shouldResume: shouldResume
        });

        state.tenantType = pick;
        return (input: MultiStepInput) => inputRedirectUri(input, state);
    }

    async function inputRedirectUri(input: MultiStepInput, state: Partial<State>) {

        state.redirectUri = await input.showInputBox({
            title,
            step: 3,
            totalSteps: 3,
            value: state.redirectUri || '',
            prompt: 'Enter the Redirect URI',
            placeholder: 'http://localhost:3000',
            validate: validateRedirectUri,
            shouldResume: shouldResume
        });
        //return (input: MultiStepInput) => pickRuntime(input, state);
    }

    /*
    async function pickRuntime(input: MultiStepInput, state: Partial<State>) {
        const additionalSteps = typeof state.resourceGroup === 'string' ? 1 : 0;
        const runtimes = await getAvailableRuntimes(state.resourceGroup!, undefined /* TODO: token);
        // TODO: Remember currently active item when navigating back.
        state.runtime = await input.showQuickPick({
            title,
            step: 3 + additionalSteps,
            totalSteps: 3 + additionalSteps,
            placeholder: 'Pick a runtime',
            items: runtimes,
            activeItem: state.runtime,
            shouldResume: shouldResume
        });
    }
    */

    function shouldResume() {
        // Could show a notification with the option to resume.
        return new Promise<boolean>((resolve, reject) => {
            // noop
        });
    }

    async function validateName(name: string) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return name === '' ? 'Provide a valid name' : undefined;
    }

    async function validateRedirectUri(input: string) {
        const httpRegex = /^(http|https):\/\/[^ "]+$/;
        const isHttpOnly = input.startsWith('http://');
        if (isHttpOnly && input.indexOf('localhost') === -1) {
            return 'Must start with "HTTPS" or "http://localhost"';
        }
        if (!httpRegex.test(input)) {
            return 'Provide a valid Redirect URL';
        }

        return undefined;
    }

    const state = await collectInputs();
    window.showInformationMessage(`Creating an Application Registration '${state.appRegistrationName}'`);
    await createAppRegistration(state.appRegistrationName, state.redirectUri, state.tenantType.label, msal);
}


async function createAppRegistration(name: string, redirectUri: string, tenantType: string, msal: MsalAuthenticator) {
    let token = await msal.GetAccessToken();
    var app = await graph.createAppRegistration(token!, name, redirectUri, tenantType);
    window.showInformationMessage(`Created Application Registration '${app.displayName}'`);
    window.showTextDocument
}
// -------------------------------------------------------
// Helper code that wraps the API for the multi-step case.
// -------------------------------------------------------

class InputFlowAction {
    static back = new InputFlowAction();
    static cancel = new InputFlowAction();
    static resume = new InputFlowAction();
}

type InputStep = (input: MultiStepInput) => Thenable<InputStep | void>;

interface QuickPickParameters<T extends QuickPickItem> {
    title: string;
    step: number;
    totalSteps: number;
    items: T[];
    activeItem?: T;
    placeholder: string;
    buttons?: QuickInputButton[];
    shouldResume: () => Thenable<boolean>;
}

interface InputBoxParameters {
    title: string;
    step: number;
    totalSteps: number;
    value: string;
    prompt: string;
    validate: (value: string) => Promise<string | undefined>;
    buttons?: QuickInputButton[];
    shouldResume: () => Thenable<boolean>;
}

class MultiStepInput {

    static async run<T>(start: InputStep) {
        const input = new MultiStepInput();
        return input.stepThrough(start);
    }

    private current?: QuickInput;
    private steps: InputStep[] = [];

    private async stepThrough<T>(start: InputStep) {
        let step: InputStep | void = start;
        while (step) {
            this.steps.push(step);
            if (this.current) {
                this.current.enabled = false;
                this.current.busy = true;
            }
            try {
                step = await step(this);
            } catch (err) {
                if (err === InputFlowAction.back) {
                    this.steps.pop();
                    step = this.steps.pop();
                } else if (err === InputFlowAction.resume) {
                    step = this.steps.pop();
                } else if (err === InputFlowAction.cancel) {
                    step = undefined;
                } else {
                    throw err;
                }
            }
        }
        if (this.current) {
            this.current.dispose();
        }
    }

    async showQuickPick<T extends QuickPickItem, P extends QuickPickParameters<T>>({ title, step, totalSteps, items, activeItem, placeholder, buttons, shouldResume }: P) {
        const disposables: Disposable[] = [];
        try {
            return await new Promise<T | (P extends { buttons: (infer I)[] } ? I : never)>((resolve, reject) => {
                const input = window.createQuickPick<T>();
                input.title = title;
                input.step = step;
                input.totalSteps = totalSteps;
                input.placeholder = placeholder;
                input.items = items;
                if (activeItem) {
                    input.activeItems = [activeItem];
                }
                input.buttons = [
                    ...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
                    ...(buttons || [])
                ];
                disposables.push(
                    input.onDidTriggerButton(item => {
                        if (item === QuickInputButtons.Back) {
                            reject(InputFlowAction.back);
                        } else {
                            resolve(<any>item);
                        }
                    }),
                    input.onDidChangeSelection(items => resolve(items[0])),
                    input.onDidHide(() => {
                        (async () => {
                            reject(shouldResume && await shouldResume() ? InputFlowAction.resume : InputFlowAction.cancel);
                        })()
                            .catch(reject);
                    })
                );
                if (this.current) {
                    this.current.dispose();
                }
                this.current = input;
                this.current.show();
            });
        } finally {
            disposables.forEach(d => d.dispose());
        }
    }

    async showInputBox<P extends InputBoxParameters>({ title, step, totalSteps, value, prompt, validate, buttons, shouldResume }: P) {
        const disposables: Disposable[] = [];
        try {
            return await new Promise<string | (P extends { buttons: (infer I)[] } ? I : never)>((resolve, reject) => {
                const input = window.createInputBox();
                input.title = title;
                input.step = step;
                input.totalSteps = totalSteps;
                input.value = value || '';
                input.prompt = prompt;
                input.buttons = [
                    ...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
                    ...(buttons || [])
                ];
                let validating = validate('');
                disposables.push(
                    input.onDidTriggerButton(item => {
                        if (item === QuickInputButtons.Back) {
                            reject(InputFlowAction.back);
                        } else {
                            resolve(<any>item);
                        }
                    }),
                    input.onDidAccept(async () => {
                        const value = input.value;
                        input.enabled = false;
                        input.busy = true;
                        if (!(await validate(value))) {
                            resolve(value);
                        }
                        input.enabled = true;
                        input.busy = false;
                    }),
                    input.onDidChangeValue(async text => {
                        const current = validate(text);
                        validating = current;
                        const validationMessage = await current;
                        if (current === validating) {
                            input.validationMessage = validationMessage;
                        }
                    }),
                    input.onDidHide(() => {
                        (async () => {
                            reject(shouldResume && await shouldResume() ? InputFlowAction.resume : InputFlowAction.cancel);
                        })()
                            .catch(reject);
                    })
                );
                if (this.current) {
                    this.current.dispose();
                }
                this.current = input;
                this.current.show();
            });
        } finally {
            disposables.forEach(d => d.dispose());
        }
    }
}

//const token = await msal.GetAccessToken();
//await graph.deleteAppRegistration(token!, x.id!);
