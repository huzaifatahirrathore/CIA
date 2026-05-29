describe("Health check", () => {
  it("environment is node", () => {
    expect(typeof process).toBe("object");
    expect(typeof process.env).toBe("object");
  });

  it("critical env vars have defaults in test", () => {
    process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
    expect(process.env.NODE_ENV).toBeDefined();
  });
});
