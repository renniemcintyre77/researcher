import { SystemMessagePromptTemplate } from '@langchain/core/prompts';
declare class Agent {
    role: string;
    goal: string;
    backstory: string;
    constructor(role: string, goal: string, backstory: string);
    getSystemPrompt(): SystemMessagePromptTemplate;
}
export default Agent;
