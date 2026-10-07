import { setUser } from "./config";

export function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("A username is required!")
    };
    const username = args[0];
    setUser(username);
    console.log(`User has been set to ${username}`)
}