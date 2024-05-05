import { Action, DataPath } from "./action";
import { RunnableInput } from "./runnable";
import { SystemMessagePromptTemplate } from '@langchain/core/prompts';
import Agent from './agent';
import { llm } from './llm';
declare abstract class AgentAction extends Action {
    agent: Agent;
    llm: llm;
    constructor(agent: Agent, llm: llm, outputKey: string, dataPaths?: DataPath[], parallel?: boolean, checkConditions?: (data: RunnableInput) => boolean);
    getSystemPrompt(): SystemMessagePromptTemplate;
}
export default AgentAction;
