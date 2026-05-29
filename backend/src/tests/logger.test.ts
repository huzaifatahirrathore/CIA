import path from "path";
import fs from "fs";

describe("Logger utility", () => {
  it("logger module can be loaded", () => {
    const loggerPath = path.resolve(__dirname, "../utils/logger");
    expect(() => require(loggerPath)).not.toThrow();
  });

  it("logs directory is writable", () => {
    const logsDir = path.resolve(__dirname, "../../logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    expect(fs.existsSync(logsDir)).toBe(true);
  });
});
