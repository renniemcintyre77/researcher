import { ChatGroq } from '@langchain/groq';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatTogetherAI } from '@langchain/community/chat_models/togetherai';
import { RedisCache } from "@langchain/community/caches/ioredis";
declare enum Provider {
    groq = 0,
    gemini = 1,
    openai = 2,
    togetherai = 3
}
type llmOptions = {
    provider: Provider;
    model: string;
};
type llm = ChatGroq | ChatOpenAI | ChatGoogleGenerativeAI | ChatTogetherAI;
declare const GetModel: (options: llmOptions, cache?: RedisCache) => llm;
export default GetModel;
export { Provider, llm, };
