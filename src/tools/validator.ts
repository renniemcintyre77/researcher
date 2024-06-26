import { Tool, Agent } from "agentmesh/core"
import { ChatPromptTemplate, HumanMessagePromptTemplate } from "agentmesh/templates";
import { StructuredOutputParser, z } from "agentmesh/parsers";
import { llm } from "agentmesh/chat"

type ValidatorResponse = {
    valid: boolean;
}

class ValidatorTool implements Tool {
    name = 'validator';
    description =  'validator';
    /**
     * Validates the users search query to ensure it is a valid question.
     *
     * @param {Agent} agent - The agent to do the validation.  Agent role and backstory is used to determine the validation prompt.
     * @param {llm} model - The LLM model to use for the validation.
     * @param {string} searchQuery - The users search query.
     * @returns {Promise<ToolResponse>} A promise that resolves to the tool response.
     */
    invoke = async (agent: Agent, model: llm, statement: string, audience: string) : Promise<ValidatorResponse> => {


        const prompt = ChatPromptTemplate.fromMessages([
            agent.getSystemPrompt(),
            HumanMessagePromptTemplate.fromTemplate(`

            Please use your skills to assess whether the CONTENT is relevant to the AUDIENCE and would be something they would want to read.

            STATEMENT: {{statement}}
            AUDIENCE: {{audience}}

            {{format_instructions}}
            `, { templateFormat: "mustache"} )
        ])

        const parser = StructuredOutputParser.fromZodSchema(z.object({
            valid: z.boolean().describe('Is the statement relevant to the topic?'),
        }))

        const response =  await prompt.pipe(model).pipe(parser).invoke({
            statement: statement,
            audience: audience,
            format_instructions: parser.getFormatInstructions()
        })

        return response;

    }
}
const validatorTool = new ValidatorTool();
export default validatorTool;

