import { setUser, readConfig } from "./config";
import { getUserByName, createUser, deleteAllUsers, getUsers } from "./lib/db/queries/users";
import { formatDuration, parseDuration, scrapeFeeds } from "./aggregate";
import { users, type Feed, type User } from "./lib/db/schema";
import { createFeed, getFeedByUrl, getFeedsWithUsers } from "./lib/db/queries/feeds";
import { createFeedFollow, deleteFeedFollow, getFeedFollowsForUser } from "./lib/db/queries/feedFollows";

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
    if (args.length < 1) {
        throw new Error("usage: agg <time_between_reqs> (e.g. 30s, 1m)");
    }
    const timeBetweenRequests = parseDuration(args[0]);
    console.log(`Collecting feeds every ${formatDuration(timeBetweenRequests)}`);

    const handleError = (err: unknown) => {
        console.error(`Error scraping feeds: ${err instanceof Error ? err.message : err}`);
    };

    // Track the scrape in progress so ticks never overlap and shutdown can wait for it.
    let inFlight: Promise<void> | null = null;
    const tick = () => {
        if (inFlight !== null) {
            console.log("Previous scrape still running, skipping this tick");
            return;
        }
        inFlight = scrapeFeeds()
            .catch(handleError)
            .finally(() => {
                inFlight = null;
            });
    };

    tick();
    const interval = setInterval(tick, timeBetweenRequests);

    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            console.log("Shutting down feed aggregator...");
            clearInterval(interval);
            resolve();
        });
    });

    if (inFlight !== null) {
        console.log("Waiting for the current scrape to finish...");
        await inFlight;
    }
}

export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]) {
    if (args.length < 2) {
        throw new Error("usage: addfeed <name> <url>");
    };
    const feedName = args[0];
    const url = args[1];
    const feed = await createFeed(feedName, url, user.id);
    printFeed(feed, user);

    const follow = await createFeedFollow(user.id, feed.id);
    console.log(`${follow.userName} is now following ${follow.feedName}`);
}

function printFeed(feed: Feed, user: User) {
    
    console.log(`* ID: ${feed.id}`);
    console.log(`* Name: ${feed.name}`);
    console.log(`* URL: ${feed.url}`);
    console.log(`* User: ${user.name}`);
    console.log(`* Created: ${feed.createdAt}`);

}

export async function handlerFeeds(cmdName: string, ...args: string[]) {
    const feedsWithUser = await getFeedsWithUsers();
    if (feedsWithUser.length === 0) {
            console.log("no feeds found")
        }
    for (const feed of feedsWithUser) {
        console.log(`* ${feed.feedName}`);
        console.log(`URL: ${feed.url}`);
        console.log(`User: ${feed.userName}`);
    }
    return;
}

export async function handlerFollow(cmdName: string, user: User, ...args: string[]) {
    if (args.length < 1) {
        throw new Error("usage: follow <url>");
    }
    const url = args[0];
    const feed = await getFeedByUrl(url);
    if (feed === undefined) {
        throw new Error(`feed not found: ${url}`);
    }
    const follow = await createFeedFollow(user.id, feed.id);
    console.log(`${follow.userName} is now following ${follow.feedName}`);
}

export async function handlerFollowing(cmdName: string, user: User, ...args: string[]) {
    const follows = await getFeedFollowsForUser(user.id);
    if (follows.length === 0) {
        console.log(`${user.name} is not following any feeds`);
        return;
    }
    console.log(`${user.name} is following:`);
    for (const follow of follows) {
        console.log(`* ${follow.feedName}`);
    }
}


export async function handlerUnfollow(cmdName: string, user: User, ...args: string[]) {
    if (args.length < 1) {
        throw new Error("usage: unfollow <url>");
    }
    const url = args[0];
    const feed = await getFeedByUrl(url);
    if (feed === undefined) {
        throw new Error(`feed not found: ${url}`);
    }
    const deleted = await deleteFeedFollow(user.id, feed.id);
    if (deleted.length === 0) {
        throw new Error(`${user.name} is not following ${feed.name}`);
    }
    console.log(`${user.name} unfollowed ${feed.name}`);
}
