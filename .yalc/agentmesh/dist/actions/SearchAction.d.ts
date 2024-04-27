import ToolAction from '../toolaction';
import { RunnableInput } from '../runnable';
/**
 *
 * @param {any} data - Expect searchQuery to be passed in
 * @returns {any} - Array [ { title, href, body} ]
 */
declare class SearchAction extends ToolAction {
    invoke(data: RunnableInput): Promise<any>;
}
export default SearchAction;
