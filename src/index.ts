import { StandardOperatingProcedure, DataStore, Action, Tool, Agent } from "agentmesh/core";
import { ChatPromptTemplate, HumanMessagePromptTemplate } from "agentmesh/templates";
import { StringOutputParser, StructuredOutputParser, z, OutputFixingParser } from "agentmesh/parsers";
import { groqLlama3_8B, groqLlama3_70B, togetherLlama3_70B, snowflake } from "./models";
import { researchAgent, validatorAgent } from "./agents";
import { RedisClient as redis } from 'agentmesh/redis';
import { NewsTool, WebpageTool } from "agentmesh/tools/retrievers";
import { SearchSummaryTool, ContentSummaryTool } from "agentmesh/tools/summarizers";
import { llm } from "agentmesh/chat";
import { RateLimiter } from 'limiter';
import ValidatorTool from "./tools/validator";
import { db } from './db';
import { news as newsTable, failures as failuresTable } from './db/schema';
import { eq, inArray } from 'drizzle-orm';

const main = async () => {

    const dataStore = new DataStore();
    dataStore.add('searchQuery', 'Whisky');
    dataStore.add('timePublished', '1d');
    const rateLimit = 10;

    const sop = new StandardOperatingProcedure('Serp and Image Search', 'Does two searches in parallel');
    sop.onActionComplete((data) => {
        console.log(`Completed Action: ${data.key}`);
    });

    sop.addAction(new Action('news', false, async (datastore: DataStore) =>{

        const searchQuery = datastore.get('searchQuery');
        const timePublished = datastore.get('timePublished');
        let result = await NewsTool.invoke(searchQuery, timePublished);

        // filter out links for yahoo
        result = result.filter((n: any) => !n.link.includes('yahoo'));

        // Check db for existing links and filter out
        let existingUrls = await db.select().from(newsTable).where(inArray(newsTable.url, result.map((n: any) => n.link)));
        result = result.filter((n: any) => !existingUrls.some((e: any) => e.url === n.link));

        // Check db for existing failures and filter out
        let existingFailures = await db.select().from(failuresTable).where(inArray(failuresTable.url, result.map((n: any) => n.link)));
        result = result.filter((n: any) => !existingFailures.some((e: any) => e.url === n.link))

        datastore.add('news', { searchQuery, timePublished, data: result });
        return result;

    }));

    sop.addAction(new Action('news-content', false, async (datastore: DataStore) =>{

        let news = datastore.get('news');
        const urls = news.data.map((n:any) => n.link);
        if(urls.length > 0){

        const result = await WebpageTool.invoke(urls);

        result.forEach(async (r: any) => {
            if(!r.content || r.content.length === 0 || r.content.length > 20000) {
                await db.insert(failuresTable).values({ url: r.link, status: 'FAILED' });
            } else {
                news.data.find((n: any) => n.link === r.link).content = r.content;
            }
        });

        // Find urls that are not in the result
        const urlsNotInResult = urls.filter((u: any) => !result.some((r: any) => r.link === u));
        if(urlsNotInResult.length > 0) {
            await db.insert(failuresTable).values(urlsNotInResult.map((u: any) => ({ url: u, status: 'FAILED' })));
        }

        // Check db for existing failures and filter out
        let existingFailures = await db.select().from(failuresTable).where(inArray(failuresTable.url, urls.map((n: any) => n)));
        news.data = news.data.filter((n: any) => !existingFailures.some((e: any) => e.url === n.link))
        datastore.add('news', news);
        return result;
    } else {
        return [];
    }

    }));

    sop.addAction(new Action('news-validator', false, async (datastore: DataStore) =>{

        const limiter = new RateLimiter({ tokensPerInterval: rateLimit, interval: 'minute' });
        const news = datastore.get('news');

        const summaryPromises = [];
        for(let i=0; i<news.data.length; i++) {
            summaryPromises.push(new Promise<any>(async (resolve, reject) => {
                await limiter.removeTokens(1);
                try{
                    const result = await ValidatorTool.invoke(validatorAgent, togetherLlama3_70B, news.data[i].content, 'Whisky Enthusiasts');
                    console.log(`${news.data[i].link} - ${result.valid}`);
                    news.data[i].valid = result.valid;
                    resolve(result);
                } catch (error) {
                    reject(`Error assessing the validity of news ${i}: ${error}`);
                }
            }));
        }

        const result = await Promise.all(summaryPromises);

        // Get invalid urls
        const invalidUrls = news.data.filter((r: any) => !r.valid).map((r: any) => {url: r.link});
        if(invalidUrls.length > 0) {
            await db.insert(failuresTable).values(invalidUrls.map((u: any) => ({ url: u.url, status: 'RELEVANCE_CHECK_FAILED' })));
        }
        // filter out the news that are not valid
        news.data = news.data.filter((n: any) => n.valid);
        datastore.add('news', news)
        return result;

    }));

    sop.addAction(new Action('news-summary', false, async (datastore: DataStore) =>{

        const limiter = new RateLimiter({ tokensPerInterval: rateLimit, interval: 'minute' });
        const news = datastore.get('news');

        const summaryPromises = [];
        for(let i=0; i<news.data.length; i++) {
            summaryPromises.push(new Promise<any>(async (resolve, reject) => {
                await limiter.removeTokens(1);
                try{
                    const result = await ContentSummaryTool.invoke(researchAgent, togetherLlama3_70B, news.data[i].content);
                    console.log(`${news.data[i].title} - ${result.oneSentenceSummary}`);
                    news.data[i].summary = result;
                    resolve(result);
                } catch (error) {
                    reject(`Error summarizing news ${i}: ${error}`);
                }
            }));
        }

        const result = await Promise.all(summaryPromises);
        datastore.add('news', news)
        return result;

    }));

    sop.addAction(new Action('news-db', false, async (datastore: DataStore) =>{

        const news = datastore.get('news');
        if(news.data.length === 0) {
            return;
        }
        const newsData = news.data.map((n: any) => ({
            url: n.link,
            content: JSON.stringify(n),
        }));

        const result = await db.insert(newsTable).values(newsData);
        return result;

    }));

    const result = await sop.invoke(dataStore);

}

main();

