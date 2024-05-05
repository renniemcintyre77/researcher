import { StandardOperatingProcedure, RunnableInput, RunnableOutput } from "agentmesh/core";
import { ToolAction, AgentAction, ConditionalAction, Condition, Operator } from "agentmesh/core/actions";
import { Serper, SerperImages, SerperSummaryAction, PeopleAlsoAskAction, RelatedSearchesAction } from "agentmesh/tools";
import { SearchSummaryAction, RelatedQuestionsAction } from "agentmesh/actions";
import { ChatPromptTemplate, HumanMessagePromptTemplate } from "agentmesh/templates";
import { StringOutputParser, StructuredOutputParser, z, OutputFixingParser } from "agentmesh/parsers";
import { groqLlama3_8B, groqLlama3_70B, togetherLlama3_70B, snowflake } from "../models";
import { researchAgent, questionValidator } from "../agents";
import { RedisClient as redis } from 'agentmesh/redis';

class ValidatorAction extends AgentAction {

    async runAction(data: RunnableInput) : Promise<RunnableOutput>
    {
        let { query } = this.getActionData(data);

        const prompt = ChatPromptTemplate.fromMessages([
            this.getSystemPrompt(),
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

        try {
            const response =  await prompt.pipe(this.llm).pipe(parser).invoke({
                role: this.agent.role,
                goal: this.agent.goal,
                backstory: this.agent.backstory,
                query: query,
                format_instructions: parser.getFormatInstructions()
            })

            return response;
        } catch (error: any) {
            const fixParser = OutputFixingParser.fromLLM(this.llm, parser);
            const response = fixParser.parse(error.message);
            return response;
        }

    }
}

class TestAction extends ToolAction {

    async runAction(data: RunnableInput): Promise<RunnableOutput>{

        const { searchQuery } = this.getActionData(data);
        return {
            name: "Rennie Mcintyre",
            age: "47"
        }

    }
}

async function getSearchSop(name:string) {

    const sop = new StandardOperatingProcedure(name, 'Perplexity Style Search', false);
    sop.addAction(new ValidatorAction(questionValidator, await groqLlama3_70B, 'validator', [{ path: '$.searchQuery', targetProperty: 'query' }]));

    const searchSop = new StandardOperatingProcedure('Serp and Image Search', 'Does two searches in parallel', true);
    searchSop.addAction(new SerperImages('images', [{ path: '$.searchQuery', targetProperty: 'searchQuery' }]));
    searchSop.addAction(new Serper('serp',[{ path: '$.searchQuery', targetProperty: 'searchQuery' }]));

    const summarySop = new StandardOperatingProcedure('Summary', 'Creates a summary of the Serp results');

    const ifPAA = new ConditionalAction(
        'IfPeopleAlsoAsk',
        { dataPath: { path:'$.serp.peopleAlsoAsk', targetProperty: 'peopleAlsoAsk' }, operator: Operator.IS_NOT_NULL, value: true},
        new PeopleAlsoAskAction('relatedQuestions', [{ path: '$.serp.peopleAlsoAsk', targetProperty: 'peopleAlsoAsk' }]),
        new RelatedSearchesAction('relatedQuestions', [{ path: '$.serp.relatedSearches', targetProperty: 'relatedSearches' }])
    )
    summarySop.addAction(new SerperSummaryAction(researchAgent, await groqLlama3_70B, 'summary', [{ path: '$.searchQuery', targetProperty: 'query' }, { path: '$.serp.organic', targetProperty: 'research' }]));

    const mainSop = new StandardOperatingProcedure('Main', 'Main SOP');
    mainSop.addAction(searchSop);
    mainSop.addAction(summarySop);
    mainSop.addAction(ifPAA);

    const ifAction = new ConditionalAction(
        'ifAction',
        { dataPath: { path:'$.validator.valid', targetProperty: 'validator' }, operator: Operator.EQUALS, value: true},
        mainSop,
        new TestAction('test', [{ path: '$.searchQuery', targetProperty: 'searchQuery' }]));
    sop.addAction(ifAction);

    return sop;
}

export default getSearchSop;



