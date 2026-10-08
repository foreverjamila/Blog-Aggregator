import { setUser, readConfig } from "./config";
import { getUserByName, createUser, deleteAllUsers, getUsers } from "./lib/db/queries/users";
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

export async function handlerReset(cmdName: string, ...args: string[]) {
    await deleteAllUsers();
    console.log("Database reset successfully");

}

export async function handlerUsers(cmdName: string, ...args: string[]) {
    const users = await getUsers();
    const currentUserName = readConfig().currentUserName;
    for (const user of users) {
        if (user.name === currentUserName) {
            console.log(`* ${user.name} (current)`);
        } else {
            console.log(`* ${user.name}`);
        }
    }
}