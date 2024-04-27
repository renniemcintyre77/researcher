import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { HumanMessagePromptTemplate } from '@langchain/core/prompts';
import { RunnableLike } from "@langchain/core/runnables";
import { StringOutputParser, StructuredOutputParser } from '@langchain/core/output_parsers';
import { ZodTypeAny } from 'zod';
type Message = HumanMessage | HumanMessagePromptTemplate | AIMessage | SystemMessage;
type OutputParser = StringOutputParser | StructuredOutputParser<ZodTypeAny>;
type AgentOptions = {
    role: string;
    goal: string;
    backstory: string;
};
declare class Chat {
    agentOptions: AgentOptions;
    chatHistory: Message[];
    model: RunnableLike;
    constructor(options: AgentOptions, model: RunnableLike);
    continue(parser?: OutputParser): Promise<any>;
    sendMessage(message: string, parser?: OutputParser): Promise<any>;
    private addMessage;
    private getPromptTemplate;
    getHistory(): Message[];
    setHistory(messages: Message[]): void;
    getMessages(): Promise<string>;
}
export default Chat;
