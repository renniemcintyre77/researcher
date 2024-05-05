import { Runnable, RunnableOutput } from './runnable';
import DataStore from './DataStore';
declare class Action implements Runnable {
    key: string;
    id: string;
    parallel: boolean;
    checkConditions?: (datastore: DataStore) => boolean;
    runAction: (datastore: DataStore) => void;
    constructor(key: string, parallel: boolean | undefined, run: (datastore: DataStore) => void, checkConditions?: (datastore: DataStore) => boolean);
    invoke(datastore: DataStore): RunnableOutput;
}
export default Action;
