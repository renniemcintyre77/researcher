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
import prisma from "./db";

const main = async () => {

    const dataStore = new DataStore();
    dataStore.add('searchQuery', 'Whisky');
    dataStore.add('timePublished', '1h');
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

        datastore.add('news', { searchQuery, timePublished, data: result });
        return result;

    }));

    sop.addAction(new Action('news-content', false, async (datastore: DataStore) =>{

        const news = datastore.get('news');
        const urls = news.data.map((n:any) => n.link);
        const result = await WebpageTool.invoke(urls);
        // update news with content
        news.data.forEach((n: any) => {
            const correspondingResult = result.find((r: any) => r.link === n.link);
            if (correspondingResult) {
                n.content = correspondingResult.content;
            }
        });

        // filter out results that are more than 20000 characters
        news.data = news.data.filter((n: any) => n.content && n.content.length < 20000);
        datastore.add('news', news);
        return result;

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
        const newsData = news.data.map((n: any) => ({
            url: n.link,
            data: JSON.stringify(n),
        }));

        const existingUrls = await Promise.all(
            newsData.map(async (item: any) => {
                const exists = await prisma.news.findUnique({
                    where: { url: item.url }
                });
                return exists ? null : item;
            })
        );

        const filteredNewsData = existingUrls.filter((item) => item !== null);
        console.log(`filteredNewsData.length: ${filteredNewsData.length}`);
        const result = await prisma.news.createMany({ data: filteredNewsData });
        return result;

    }));

    const result = await sop.invoke(dataStore);
    // console.log(`Result: ${JSON.stringify(result.news.data[5].content)}`);

}

main();

