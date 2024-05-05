type ToolResponse = any;
interface Tool {
    name: string;
    description: string;
    invoke: (...args: any[]) => Promise<ToolResponse>;
}
export { Tool, ToolResponse };
