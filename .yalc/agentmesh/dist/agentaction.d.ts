import { Action, DataPath } from "./action";
import { SystemMessagePromptTemplate } from '@langchain/core/prompts';
import Agent from './agent';
import { llm } from './llm';
declare abstract class AgentAction extends Action {
    agent: Agent;
    llm: llm;
    constructor(agent: Agent, llm: llm, outputKey: string, dataPaths?: DataPath[]);
    getSystemPrompt(): SystemMessagePromptTemplate;
}
export default AgentAction;
