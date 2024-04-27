interface Tool {
    name: string;
    description: string;
    invoke(input?: string): Promise<string>;
}
export default Tool;
