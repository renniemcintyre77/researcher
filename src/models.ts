import { ChatModel, ChatModelProvider, ChatCache } from 'agentmesh/chat'
import { RedisClient as redis } from 'agentmesh/redis';

const cache = ChatCache.getInstance(redis);
const groqLlama3_70B = new ChatModel({ provider: ChatModelProvider.groq, model: 'llama3-70b-8192' }, cache).initialise();
const groqLlama3_8B = new ChatModel({ provider: ChatModelProvider.groq, model: 'llama3-8b-8192' }, cache).initialise();
const togetherLlama3_70B = new ChatModel({ provider: ChatModelProvider.togetherai, model: 'meta-llama/Llama-3-70b-chat-hf' }, cache).initialise();
const snowflake = new ChatModel({ provider: ChatModelProvider.togetherai, model: 'Snowflake/snowflake-arctic-instruct' }, cache).initialise();

export {
    groqLlama3_8B,
    groqLlama3_70B,
    togetherLlama3_70B,
    snowflake
}
