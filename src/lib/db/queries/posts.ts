import { desc, eq } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, posts } from "../schema";

export type NewPost = typeof posts.$inferInsert;

export async function createPost(post: NewPost) {
    const [result] = await db
    .insert(posts)
    .values(post)
    .onConflictDoNothing({ target: posts.url })
    .returning();
    return result;
}

export async function getPostsForUser(userId: string, limit: number) {
    const result = await db
    .select({
        title: posts.title,
        url: posts.url,
        description: posts.description,
        publishedAt: posts.publishedAt,
        feedName: feeds.name,
    })
    .from(posts)
    .innerJoin(feedFollows, eq(posts.feedId, feedFollows.feedId))
    .innerJoin(feeds, eq(posts.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
    return result;
}
