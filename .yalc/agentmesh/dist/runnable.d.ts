type RunnableInput = any;
type RunnableOutput = any;
interface Runnable {
    key: string;
    invoke(input: RunnableInput): RunnableOutput;
}
export { Runnable, RunnableInput, RunnableOutput };
