import morgan from "morgan";
import fs from "fs";
import path from "path";

const logDir = "logs";

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const accessLogStream = fs.createWriteStream(
  path.join(logDir, "access.log"),
  { flags: "a" }
);

export const morganMiddleware = morgan("combined", {
  stream: accessLogStream,
});