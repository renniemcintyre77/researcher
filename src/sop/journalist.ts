import { StandardOperatingProcedure, RunnableInput, RunnableOutput } from "agentmesh/core";
import { ToolAction, AgentAction, ConditionalAction, Condition, Operator } from "agentmesh/core/actions";
import { Serper, SerperImages, SerperSummaryAction, PeopleAlsoAskAction, NewsSearchAction, NewsContentAction, SerpContentAction } from "agentmesh/tools";
import { SearchSummaryAction, RelatedQuestionsAction, SummaryAction } from "agentmesh/actions";
import { ChatPromptTemplate, HumanMessagePromptTemplate } from "agentmesh/templates";
import { StringOutputParser, StructuredOutputParser, z, OutputFixingParser } from "agentmesh/parsers";
import { groqLlama3_8B, groqLlama3_70B, togetherLlama3_70B, snowflake } from "../models";
import { researchAgent, questionValidator } from "../agents";
import { RedisClient as redis } from 'agentmesh/redis';

async function getJournalistSop(name:string) {

    const searchSop = new StandardOperatingProcedure('Serp and Image Search', 'Does two searches in parallel');
    searchSop.addAction(new NewsSearchAction('news', [{ path: '$.searchQuery', targetProperty: 'searchQuery' }, { path: '$.timePublished', targetProperty: 'timePublished' }]));
    searchSop.addAction(new NewsContentAction('news', [{ path: '$.news', targetProperty: 'news' }]));
    searchSop.addAction(new SummaryAction(await groqLlama3_70B, 'summary', [{ path: '$.news[0].data[0].content', targetProperty: 'content' }]));
    searchSop.addAction(new SerpContentAction('pageContent', [{ path: '$.serp', targetProperty: 'serps' }]));
    return searchSop;
}

export default getJournalistSop;



