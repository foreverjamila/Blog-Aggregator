import { CommandsRegistry, registerCommand, runCommand } from "./commands";
import { handlerLogin } from "./handler";
function main() {
    const registry: CommandsRegistry = {};
    registerCommand(registry, "login", handlerLogin);
    const args = process.argv.slice(2);
    if (args.length <= 1) {
        console.log("not enough arguments");
    }
    const cmdName = args[0];
    const cmdArgs = args.slice(1);
    try {
        runCommand(registry, cmdName, ...cmdArgs)
    } catch (err) {
        console.log(err);
        process.exit(1)
    }


}

main();