import { StandardOperatingProcedure, DataStore, Action } from "agentmesh/core";
import { groqLlama3_70B } from "src/models";
import { researchAgent, questionValidator } from "src/agents";
import { SerperTool, SerperImagesTool, SearchSummaryTool } from "agentmesh/tools";
import ValidatorTool from "src/tools/validator";

const sop = new StandardOperatingProcedure('Serp and Image Search', 'Does two searches in parallel');

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

export default sop;




