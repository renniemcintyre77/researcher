// src/tools/test.ts
var TestTool = {
  name: "test",
  description: "test",
  invoke: async (searchQuery, timePublished) => {
    console.log("Running Test Tool" + searchQuery + timePublished);
    return { searchQuery, timePublished };
  }
};
var test_default = TestTool;
export {
  test_default as TestTool
};
