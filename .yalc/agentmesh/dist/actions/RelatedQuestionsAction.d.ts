import AgentAction from '../agentaction';
import { RunnableInput } from '../runnable';
/**
 *
 * @param {any} data - Expect query and research to be passed in
 * @returns {any} - Array [ relatedQuestions ]
 */
declare class RelatedQuestionsAction extends AgentAction {
    invoke(data: RunnableInput): Promise<string[]>;
}
export default RelatedQuestionsAction;
