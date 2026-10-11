import { eq } from "drizzle-orm";
import { db } from "..";
import { feeds, users } from "../schema";

export async function createFeed(name: string, url: string, userId: string) {
    const [result] = await db.insert(feeds).values({name: name, url: url, userId: userId}).returning();
    return result;
}

export async function getFeedsWithUsers() {
    const result = await db.select({
        feedName: feeds.name,
        url: feeds.url,
        userName: users.name,
    }).from(feeds).innerJoin(users, eq(feeds.userId, users.id));
    return result;
}