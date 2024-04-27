import { Action, ActionStatus, DataPath } from "./action";
declare abstract class ToolAction extends Action {
    constructor(outputKey: string, dataPaths?: DataPath[], status?: ActionStatus);
}
export default ToolAction;
