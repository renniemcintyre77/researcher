import { Action, DataPath } from "./action";
declare abstract class ToolAction extends Action {
    constructor(outputKey: string, dataPaths?: DataPath[]);
}
export default ToolAction;
