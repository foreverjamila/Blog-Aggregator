import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
    dbUrl: string;
    currentUserName?: string
}

function getConfigFilePath(): string {
    const homedir = os.homedir();
    return path.join(homedir, ".gatorconfig.json");
}


function validateConfig(rawConfig: any): Config {
    
    if (typeof rawConfig.db_url !== "string") {
        throw new Error("db_url must be a string!");
    } 
    if (rawConfig.current_user_name !== undefined && typeof rawConfig.current_user_name !== "string") {
        throw new Error("current_user_name must be a string!");
    }

    return {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name,
    };
}

export function readConfig(): Config {
    const configObject = JSON.parse(fs.readFileSync(getConfigFilePath(), "utf-8"));
    return validateConfig(configObject);
}

function writeConfig(cfg: Config): void {
    const configObject = {
        db_url: cfg.dbUrl,
        current_user_name: cfg.currentUserName,
    };
    fs.writeFileSync(getConfigFilePath(), JSON.stringify(configObject, null, 2));
}

export function setUser(username: string) {
    const validatedConfig = readConfig();
    validatedConfig.currentUserName = username;
    writeConfig(validatedConfig);
}