/// <reference types="node" />
import { Runnable, RunnableInput } from './runnable';
import { EventEmitter } from 'events';
import { Redis } from 'ioredis';
declare class SOP implements Runnable {
    name: string;
    description: string;
    actions: Runnable[];
    outputs: string[];
    data: RunnableInput;
    key: string;
    eventEmitter: EventEmitter;
    parallel: Boolean;
    redis: Redis | null;
    constructor(name: string, description: string, parallel?: boolean, redis?: Redis | null);
    updateCache(): void;
    onActionComplete(listener: (eventData: any[]) => void): void;
    removeActionCompleteListener(listener: (eventData: any[]) => void): void;
    addAction(runnable: Runnable): void;
    invoke(data: RunnableInput): Promise<any>;
}
export default SOP;
