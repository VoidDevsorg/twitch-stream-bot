import { Consoler } from "@voidpkg/console";
new Consoler({
  title: "VoidClient",
});

require("fix-esm").register();

// Client Run
import VoidClient from "./client";
const client = new VoidClient();
client.run();

export default client;
