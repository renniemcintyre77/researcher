import AgentAction from '../agentaction';
import { RunnableInput } from '../runnable';
/**
 *
 * @param {any} data - Expect query and research to be passed in
 * @returns {any} - Object { query, summary, citedResearch }
 */
declare class SearchSummaryAction extends AgentAction {
    runAction(data: RunnableInput): Promise<{
        query: any;
        summary: string;
        citedResearch: any[];
    }>;
}
export default SearchSummaryAction;
