import { setUser, readConfig } from "./config";


function main() {
    setUser("Jamila");
    const config = readConfig();
    console.log(config);

}

main();