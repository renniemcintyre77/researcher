import { Action, DataPath } from "./action";
import { RunnableInput } from "./runnable";
declare abstract class ToolAction extends Action {
    constructor(outputKey: string, dataPaths?: DataPath[], parallel?: boolean, checkConditions?: (data: RunnableInput) => boolean);
}
export default ToolAction;
