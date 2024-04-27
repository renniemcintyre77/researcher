import { Runnable, RunnableInput, RunnableOutput } from './runnable';
declare enum ActionStatus {
    PENDING = 0,
    ACTIVE = 1,
    COMPLETE = 2,
    FAILED = 3
}
type DataPath = {
    path: string;
    targetProperty: string;
};
type DataPaths = DataPath[];
declare abstract class Action implements Runnable {
    key: string;
    status: ActionStatus;
    dataPaths: DataPaths;
    constructor(outputKey: string, dataPaths?: DataPaths, status?: ActionStatus);
    getActionData(workingData: RunnableInput): Record<string, any>;
    abstract invoke(input?: RunnableInput): RunnableOutput;
}
export { Action, ActionStatus, DataPath };
