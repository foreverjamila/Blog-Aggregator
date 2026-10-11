import type { CommandHandler } from "./commands";
import { readConfig } from "./config";
import type { User } from "./lib/db/schema";
import { getUserByName } from "./lib/db/queries/users";

export type UserCommandHandler = (cmdName: string, user: User, ...args: string[]) => Promise<void>;

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
    return async (cmdName: string, ...args: string[]) => {
        const currentUserName = readConfig().currentUserName;
        if (currentUserName === undefined) {
            throw new Error("no user is logged in");
        }
        const user = await getUserByName(currentUserName);
        if (user === undefined) {
            throw new Error(`user ${currentUserName} not found`);
        }
        await handler(cmdName, user, ...args);
    };
}
