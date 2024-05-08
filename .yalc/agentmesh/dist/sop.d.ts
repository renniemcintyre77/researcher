/// <reference types="node" />
import { Runnable } from './runnable';
import { EventEmitter } from 'events';
import Action from './action';
import DataStore from './datastore';
declare class SOP implements Runnable {
    name: string;
    description: string;
    actions: Action[];
    outputs: string[];
    key: string;
    eventEmitter: EventEmitter;
    constructor(name: string, description: string);
    onActionComplete(listener: (eventData: any) => void): void;
    removeActionCompleteListener(listener: (eventData: any[]) => void): void;
    addAction(action: Action): void;
    invoke(datastore: DataStore): Promise<any>;
}
export default SOP;
