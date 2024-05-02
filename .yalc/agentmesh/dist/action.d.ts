import { Runnable, RunnableInput, RunnableOutput } from './runnable';
type DataPath = {
    path: string;
    targetProperty: string;
};
type DataPaths = DataPath[];
declare abstract class Action implements Runnable {
    key: string;
    dataPaths: DataPaths;
    constructor(outputKey: string, dataPaths?: DataPaths);
    getActionData(workingData: RunnableInput): Record<string, any>;
    invoke(input?: RunnableInput): RunnableOutput;
    protected abstract runAction(input?: RunnableInput): RunnableOutput;
}
export { Action, DataPath };
