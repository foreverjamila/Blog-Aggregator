import { feedFollows, feeds, users } from "../schema";
import { db } from "..";
import { eq } from "drizzle-orm";


export async function createFeedFollow(userId: string, feedId: string) {
    const [newFeedFollow] = await db.insert(feedFollows).values({userId: userId, feedId: feedId}).returning();
    const [result] = await db
    .select({
        id: feedFollows.id, createdAt: feedFollows.createdAt, updatedAt: feedFollows.updatedAt,
        userName: users.name,
        feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.id, newFeedFollow.id))
    return result;
    
}

export async function getFeedFollowsForUser(userId: string) {
    const result = await db
    .select({
        id: feedFollows.id, createdAt: feedFollows.createdAt, updatedAt: feedFollows.updatedAt,
        userName: users.name,
        feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.userId, userId))
    return result;
}