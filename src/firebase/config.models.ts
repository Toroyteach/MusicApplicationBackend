export interface Config {
    //Firebase keys
    apiKey: string,
    authDomain: string,
    projectId: string,
    storageBucket: string,
    messagingSenderId: string,
    appId: string,
    measurementId: string,

    //Firebase Admin Keys
    admintype: string,
    adminprojectId: string,
    adminprivateKeyId: string,
    adminprivateKey: string,
    adminclientEmail: string,
    adminclientId: string,
    adminauthUri: string,
    admintokenUri: string,
    adminauthProviderX509CertUrl: string,
    adminclientC509CertUrl: string,
    databaseUrl: string,

    //JWT Tokens
    secretOrKey: string,
    REFRESH_SECRET: string,
    ACCESS_SECRET: string,

    //NASA Keys
    nasaApiKey: string,

    //Dalle Key
    openAiKey: string,
}