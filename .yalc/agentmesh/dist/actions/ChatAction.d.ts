import AgentAction from '../agentaction';
import { RunnableInput } from '../runnable';
declare class ChatAction extends AgentAction {
    invoke(data: RunnableInput): Promise<{
        limerick: string[];
    }>;
}
export default ChatAction;