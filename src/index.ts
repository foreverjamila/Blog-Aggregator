import { CommandsRegistry, registerCommand, runCommand } from "./commands";
import { handlerAddFeed, handlerAgg, handlerLogin, handlerRegister, handlerReset, handlerUsers } from "./handler";

async function main() {
    const registry: CommandsRegistry = {};
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegister);
    registerCommand(registry, "reset", handlerReset);
    registerCommand(registry, "users", handlerUsers);
    registerCommand(registry, "agg", handlerAgg);
    registerCommand(registry, "addfeed", handlerAddFeed);
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error("not enough arguments");
        process.exit(1);
    }
    const cmdName = args[0];
    const cmdArgs = args.slice(1);
    try {
        await runCommand(registry, cmdName, ...cmdArgs)
    } catch (err) {
        if (err instanceof Error) {
           console.error(err.message); 
        } else {
            console.error(err);
        }
        process.exit(1)
    }
    process.exit(0);


}

main();