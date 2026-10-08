import { setUser } from "./config";
import { getUserByName, createUser } from "./lib/db/queries/users";
export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("A username is required!")
    };
    const username = args[0];
    const existingUser = await getUserByName(username);
    if (existingUser === undefined) {
        throw new Error('user does not exist');
    }
    setUser(username);
    console.log(`User has been set to ${username}`)
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("A username is required!")
    }
    const username = args[0];
    const existingUser = await getUserByName(username);
    if (existingUser !== undefined) {
        throw new Error('username already exist');
    }
    const user = await createUser(username);
    setUser(username);
    console.log("User created");
    console.log(user);
    
}