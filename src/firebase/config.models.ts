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
    REFRESH_SECRET: string,
    ACCESS_SECRET: string,

    //NASA Keys
    nasaApiKey: string,

    //Dalle Key
    openAiKey: string,
}