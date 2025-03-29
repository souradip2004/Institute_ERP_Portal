import fs from "fs";
import path from "path";

const cwd = process.cwd();
const workersDir = path.join(cwd, "src/bullmq/workers");

fs.readdirSync(workersDir).forEach((file) => {
  if (file.endsWith(".ts") || file.endsWith(".js")) {
    if(!file.endsWith("workers.ts")){
      console.log("importing "+path.join(workersDir,file))
    import(path.join(workersDir, file))};
  }
});