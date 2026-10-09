import { XMLParser } from "fast-xml-parser";



export type RSSFeed = {
    channel: {
        title: string;
        link: string;
        description: string;
        item: RSSItem[];
    };
};

export type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
    const resp = await fetch(
        feedURL,
        {
            method: "GET",
            headers: {
                "User-Agent": "gator",
            },
        },

    );
    if (!resp.ok) {
        throw new Error(`failed to fetch feed: ${resp.status}`);
    }
    const xml = await resp.text();

    const parser = new XMLParser({processEntities: false});
    const parsed = parser.parse(xml);
    
    const channel = parsed.rss?.channel;
    if (channel === undefined) {
        throw new Error(`Invalid feed: missing channel`);
    }
    if (typeof channel.title !== "string" || typeof channel.link !== "string" || typeof channel.description !== "string") {
        throw new Error(`Invalid feed: missing channel title, link, or description`);
    }

    let rawItems: any[] = [];
    const items: RSSItem[] = [];
    if (Array.isArray(channel.item)) {
        rawItems = channel.item;
    } else if (channel.item !== undefined) {
        rawItems = [channel.item];
    } 
    

    for (const raw of rawItems) {
        if (typeof raw.title !== "string" || typeof raw.link !== "string" || typeof raw.description !== "string" || typeof raw.pubDate !== "string") {
            continue

        }
        items.push({title: raw.title, link: raw.link, description: raw.description, pubDate: raw.pubDate });
    }

    return {
        channel:{
            title: channel.title,
            link: channel.link,
            description: channel.description,
            item: items,
        }
    };
}