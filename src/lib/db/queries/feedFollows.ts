import { feedFollows, feeds, users } from "../schema";
import { db } from "..";
import { and, eq } from "drizzle-orm";


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
export async function deleteFeedFollow(userId: string, feedId: string) {
    const result = await db
    .delete(feedFollows)
    .where(and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feedId)))
    .returning();
    return result;
}
