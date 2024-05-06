import { StandardOperatingProcedure, DataStore, Action, Tool, Agent } from "agentmesh/core";
// import { Serper, SerperImages, SerperSummaryAction, PeopleAlsoAskAction, NewsSearchAction, NewsContentAction, SerpContentAction } from "agentmesh/tools";
// import { SearchSummaryAction, RelatedQuestionsAction, SummaryAction } from "agentmesh/actions";
import { ChatPromptTemplate, HumanMessagePromptTemplate } from "agentmesh/templates";
import { StringOutputParser, StructuredOutputParser, z, OutputFixingParser } from "agentmesh/parsers";
import { groqLlama3_8B, groqLlama3_70B, togetherLlama3_70B, snowflake } from "./models";
import { researchAgent, questionValidator } from "./agents";
import { RedisClient as redis } from 'agentmesh/redis';
import { SerperTool, SerperImagesTool, SearchSummaryTool } from "agentmesh/tools";
import { llm } from "agentmesh/chat";

const main = async () => {

    const ValidatorTool: Tool = {
        name: 'validator',
        description: 'validator',
        invoke: async (agent: Agent, model: llm, searchQuery: string) => {


            const prompt = ChatPromptTemplate.fromMessages([
                agent.getSystemPrompt(),
                HumanMessagePromptTemplate.fromTemplate(`

                Please use your skills to assess whether this is a valid question:

                {{query}}

                {{format_instructions}}
                `, { templateFormat: "mustache"} )
            ])

            const parser = StructuredOutputParser.fromZodSchema(z.object({
                valid: z.boolean().describe('Is the question valid?'),
                reason: z.string().describe('Why is the question valid?')
            }))

            const response =  await prompt.pipe(model).pipe(parser).invoke({
                query: searchQuery,
                format_instructions: parser.getFormatInstructions()
            })

            return response;

        }
    }

    const dataStore = new DataStore();
    dataStore.add('searchQuery', 'What is the most popular Whisky?');
    dataStore.add('timePublished', '1d');

    const sop = new StandardOperatingProcedure('Serp and Image Search', 'Does two searches in parallel');
    sop.onActionComplete((data) => {
        console.log(`Completed Action: ${data.key}`);
    });

    sop.addAction(new Action('validator', false, async (datastore: DataStore) =>{

        const searchQuery = datastore.get('searchQuery');
        const result = await ValidatorTool.invoke(questionValidator, groqLlama3_70B, searchQuery);
        datastore.add('validator', result);
        return result;

    }));

    const validator = (datastore: DataStore) => {
        const validator = datastore.get('validator');
        return validator.valid;
    }

    sop.addAction(new Action('serper', true, async (datastore: DataStore) =>{

        const searchQuery = datastore.get('searchQuery');
        const result = await SerperTool.invoke(searchQuery);
        datastore.add('serps', result);
        return result;

    }, validator));

    sop.addAction(new Action('serper-images', true, async (datastore: DataStore) =>{

        const searchQuery = datastore.get('searchQuery');
        const result = await SerperImagesTool.invoke(searchQuery);
        datastore.add('images', result);
        return result;

    }, validator));

    sop.addAction(new Action('relatedQuestions', false, async (datastore: DataStore) => {

        const serps = datastore.get('serps');
        let result;
        if(serps.peopleAlsoAsk){
            result = serps.peopleAlsoAsk.map((q: any) => q.question);
        } else {
            result = serps.relatedSearches.map((q: any) => q.query).slice(0,4)
        }
        datastore.add('relatedQuestions', result);
        return result;

    }, validator));

    sop.addAction(new Action('summary', false, async (datastore: DataStore) => {

        const searchQuery = datastore.get('searchQuery');
        const serps = datastore.get('serps');
        const result = await SearchSummaryTool.invoke(researchAgent, groqLlama3_70B, serps.organic, searchQuery);
        datastore.add('summary', result);
        return result;

    }, validator));

    const result = await sop.invoke(dataStore);
    console.log(`Result: ${JSON.stringify(result)}`);

}

main();


