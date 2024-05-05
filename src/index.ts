import { StandardOperatingProcedure, DataStore, Action } from "agentmesh/core";
// import { Serper, SerperImages, SerperSummaryAction, PeopleAlsoAskAction, NewsSearchAction, NewsContentAction, SerpContentAction } from "agentmesh/tools";
// import { SearchSummaryAction, RelatedQuestionsAction, SummaryAction } from "agentmesh/actions";
import { ChatPromptTemplate, HumanMessagePromptTemplate } from "agentmesh/templates";
import { StringOutputParser, StructuredOutputParser, z, OutputFixingParser } from "agentmesh/parsers";
import { groqLlama3_8B, groqLlama3_70B, togetherLlama3_70B, snowflake } from "./models";
import { researchAgent, questionValidator } from "./agents";
import { RedisClient as redis } from 'agentmesh/redis';
import { TestTool } from "agentmesh/tools";

const main = async () => {

    const dataStore = new DataStore();
    dataStore.add('searchQuery', 'Whisky');
    dataStore.add('timePublished', '1d');

    const sop = new StandardOperatingProcedure('Serp and Image Search', 'Does two searches in parallel');
    sop.onActionComplete((data) => {
        console.log(`Completed Actions: ${JSON.stringify(data)}`);
    });

    sop.addAction(new Action('test', false, async (datastore: DataStore) =>{

        const searchQuery = datastore.get('searchQuery');
        const timePublished = datastore.get('timePublished');

        console.log('In the action');
        const result = await TestTool.invoke(searchQuery, timePublished);
        console.log(result);
        return 'Hello from this first action';

    }));

    const result = await sop.invoke(dataStore);
    console.log(`Result: ${JSON.stringify(result)}`);


    // sop.addAction(new Serper('serp',[{ path: '$.searchQuery', targetProperty: 'searchQuery' }], true));

    // sop.addAction(new NewsSearchAction('news',
    //     [{ path: '$.searchQuery', targetProperty: 'searchQuery' },
    //     { path: '$.timePublished', targetProperty: 'timePublished' }],
    //     true,
    //     ({ searchQuery, timePublished }: { searchQuery: string, timePublished: string }) => {
    //         console.log(`Searching for ${searchQuery} with time published ${timePublished}`);
    //         redis.set('searchQuery', searchQuery);
    //         redis.set('timePublished', timePublished);
    //         return true;
    //     }
    // ));
    // const response = await sop.invoke({ searchQuery, timePublished });
    // console.log(response.news[0].data);
}

main();


