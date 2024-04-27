import Tool from './tool';
declare class Toolkit {
    name: string;
    description: string;
    private tools;
    constructor(name: string, description: string, tools: Tool[]);
    invoke(name: string, inputs: string): Promise<void>;
}
export default Toolkit;
