import { setUser, readConfig } from "./config";
import { getUserByName, createUser, deleteAllUsers, getUsers } from "./lib/db/queries/users";
import { fetchFeed } from "./lib/rss";
import type { Feed, User } from "./lib/db/schema";
import { createFeed } from "./lib/db/queries/feeds";

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

export async function handlerAgg(cmdName: string, ...args: string[]) {
    const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
    console.log(JSON.stringify(feed, null, 2));
}

export async function handlerAddFeed(cmdName: string, ...args: string[]) {
    if (args.length < 2) {
        throw new Error("usage: addfeed <name> <url>");
    };
    const feedName = args[0];
    const url = args[1];
    const currentUserName = readConfig().currentUserName;
    if (currentUserName === undefined) {
        throw new Error("no user is logged in");
    }
    const user = await getUserByName(currentUserName);
    if (user === undefined) {
        throw new Error("user not found")
    }
    const feed = await createFeed(feedName, url, user.id);
    printFeed(feed, user);

}

function printFeed(feed: Feed, user: User) {
    
    console.log(`* ID: ${feed.id}`);
    console.log(`* Name: ${feed.name}`);
    console.log(`* URL: ${feed.url}`);
    console.log(`* User: ${user.name}`);
    console.log(`* Created: ${feed.createdAt}`);

}