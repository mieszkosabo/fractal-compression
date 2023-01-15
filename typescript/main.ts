import { compress } from "./compress";

(async () => {
  compress("../monkey.gif", "../monkey.json").then(() => {
    console.log("🙏🏻 done");
  });
})();
