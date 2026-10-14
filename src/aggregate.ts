import { fetchFeed } from "./lib/rss";
import { getNextFeedToFetch, markFeedFetched } from "./lib/db/queries/feeds";
import { createPost } from "./lib/db/queries/posts";

export function parseDuration(durationStr: string): number {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);
    if (!match) {
        throw new Error(`invalid duration: ${durationStr} (use e.g. 500ms, 30s, 1m, 1h)`);
    }
    const value = Number(match[1]);
    const unit = match[2];
    switch (unit) {
        case "ms":
            return value;
        case "s":
            return value * 1000;
        case "m":
            return value * 60 * 1000;
        case "h":
            return value * 60 * 60 * 1000;
        default:
            throw new Error(`unknown duration unit: ${unit}`);
    }
}

export function formatDuration(ms: number): string {
    if (ms < 1000) {
        return `${ms}ms`;
    }
    const hours = Math.floor(ms / 3_600_000);
    const minutes = Math.floor((ms % 3_600_000) / 60_000);
    const seconds = (ms % 60_000) / 1000;
    let out = "";
    if (hours > 0) {
        out += `${hours}h`;
    }
    if (hours > 0 || minutes > 0) {
        out += `${minutes}m`;
    }
    return out + `${seconds}s`;
}

export async function scrapeFeeds() {
    const feed = await getNextFeedToFetch();
    if (feed === undefined) {
        console.log("No feeds to fetch. Add one with: addfeed <name> <url>");
        return;
    }

    // Mark before fetching so a broken feed moves to the back of the queue
    // instead of being retried on every tick.
    await markFeedFetched(feed.id);
    console.log(`Fetching ${feed.name} (${feed.url})...`);

    const rss = await fetchFeed(feed.url);
    let saved = 0;
    for (const item of rss.channel.item) {
        const post = await createPost({
            title: item.title,
            url: item.link,
            description: item.description,
            publishedAt: parsePublishedAt(item.pubDate),
            feedId: feed.id,
        });
        if (post !== undefined) {
            saved++;
        }
    }
    console.log(`Saved ${saved} new posts from ${feed.name} (${rss.channel.item.length} in feed)`);
}

export function parsePublishedAt(dateStr: string): Date | null {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        return null;
    }
    return date;
}
