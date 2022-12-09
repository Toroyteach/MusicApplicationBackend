export interface Config {
    apiKey: string,
    authDomain: string,
    projectId: string,
    storageBucket: string,
    messagingSenderId: string,
    appId: string,
    measurementId: string,

    //JWT Tokens
    secretOrKey: string,

    //NASA Keys
    nasaApiKey: string,

    //Dalle Key
    openAiKey: string,
}