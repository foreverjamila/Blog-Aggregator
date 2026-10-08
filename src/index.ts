import { CommandsRegistry, registerCommand, runCommand } from "./commands";
import { handlerLogin } from "./handler";
function main() {
    const registry: CommandsRegistry = {};
    registerCommand(registry, "login", handlerLogin);
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error();
        ("not enough arguments");
        process.exit(1);
    }
    const cmdName = args[0];
    const cmdArgs = args.slice(1);
    try {
        runCommand(registry, cmdName, ...cmdArgs)
    } catch (err) {
        if (err instanceof Error) {
           console.error(err.message); 
        } else {
            console.error(err);
        }
        process.exit(1)
    }


}

main();