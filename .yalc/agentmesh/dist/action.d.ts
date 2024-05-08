import { Runnable, RunnableOutput } from './runnable';
import DataStore from './datastore';
declare class Action implements Runnable {
    key: string;
    id: string;
    parallel: boolean;
    checkConditions?: (datastore: DataStore) => boolean;
    /**
     *
     * @param datastore - The datastore
     * @param complete - Whether the action is already complete (use if caching datastore between runs)
     */
    runAction: (datastore: DataStore, complete: boolean) => void;
    constructor(key: string, parallel: boolean | undefined, run: (datastore: DataStore, complete: boolean) => void, checkConditions?: (datastore: DataStore) => boolean);
    invoke(datastore: DataStore): RunnableOutput;
}
export default Action;
