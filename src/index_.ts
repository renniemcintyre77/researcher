import PerplexitySOP from './sop/perplexity';
import { PrismaClient } from '@prisma/client'
import express from 'express';
import crypto from 'crypto';
import { DataStore } from "agentmesh/core";

const prisma = new PrismaClient()

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json()); // Middleware to parse JSON bodies

app.get('/api/sync', async (req, res) => {

    const searchQuery = req.query.query;
    if(searchQuery && searchQuery !== ""){

    const perplexity = await getSearchSop('Manual');
    const response = await perplexity.invoke({ searchQuery });

    res.json(response);


    }
});

const generateKey = (seed: string) => {
    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    // Convert hexadecimal hash to a base36 string to shorten it and keep it alphanumeric
    const encoded = BigInt('0x' + hash).toString(36).slice(0, 20); // slice to ensure consistent length
    return encoded;
}

app.get('/api/questions', async (req, res) => {

    try{
        const questions = await prisma.question.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        for(let i=0; i<questions.length; i++){
            questions[i].content = JSON.parse(questions[i].content);
        }

        const response = questions
                         .filter((question: any) => question.content)
                         .filter((question: any) => (question.content.validator && question.content.validator.valid) || (!question.content.validator))
                         .map((question: any) => {
            return {
                key: question.key,
                searchQuery: question.searchQuery,
                image: question.content.images.images.find((img: any) => img.thumbnailWidth > img.thumbnailHeight)?.thumbnailUrl,
                citationCount: question.content.summary.citedResearch.length,
                summary: question.content.summary.summary.replace(/\[citation:\d+\]/g, '').split(' ').slice(0, 20).join(' ') + "...",
            }
        })

        res.json(response);
    } catch (error: any) {
        res.status(500).send('Error fetching questions\n\n' + error.message);
        throw error;
    }

});

app.get('/api/key/:key', async (req, res) => {
    const key = req.params.key?.toString();
    if(key && key !== ""){
        // check if the question already exists
        const existingQuestion = await prisma.question.findFirst({
            where: {
                key: key,
            },
        });
        if (existingQuestion) {
            res.json({ ...existingQuestion });
            return;
        }
        res.status(500).send('Invalid key');
    } else {
        res.status(500).send('Invalid query');
    }
});

app.post('/api/question', async (req, res) => {
    const searchQuery = req.body.query?.toString();
    if(searchQuery && searchQuery !== ""){
        const key = await generateKey(searchQuery);
        // check if the question already exists
        const existingQuestion = await prisma.question.findFirst({
            where: {
                key: key,
            },
        });
        if (existingQuestion) {
            res.json({ key: existingQuestion.key });
            return;
        }
        await prisma.question.create({
            data: {
                key: key,
                searchQuery: searchQuery
            },
        });
        res.json({ key: key });
    } else {
        res.status(500).send('Invalid query');
    }
});

app.get('/api/go/:key', async (req, res) => {

    const key = req.params.key?.toString();
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);


    if(key && key !== ""){
        // check if the question already exists
        const existingQuestion = await prisma.question.findFirst({
            where: {
                key: key,
            },
        });

        if (existingQuestion && existingQuestion.content !== null) {

            const data = JSON.parse(existingQuestion.content);

            if (data['validator']) {
                res.write(`data: ${JSON.stringify({ type: 'validator', data: data.validator })}\n\n`);;
            }

            if (data['images']) {
                const images = data.images.images.map((image: any) => { return { thumbnail: image.thumbnailUrl, image: image.imageUrl }}).slice(0, 8);
                await res.write(`data: ${JSON.stringify({ type: 'images', data: images })}\n\n`);
            }

            if (data['relatedQuestions']) {
                await res.write(`data: ${JSON.stringify({ type: 'relatedQuestions', data: data.relatedQuestions })}\n\n`);
            }

            if (data['summary']) {
                await res.write(`data: ${JSON.stringify({ type: 'summary', data: data.summary })}\n\n`);
            }

            res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);


        } else {
            if(existingQuestion && existingQuestion.searchQuery && existingQuestion.searchQuery !== ""){

                const actionComplete = async (eventData: any) => {

                        console.log(`Received: ${eventData.key}`);

                        if (eventData.key === 'validator') {
                            res.write(`data: ${JSON.stringify({ type: 'validator', data: eventData.data })}\n\n`);;
                        }

                        if (eventData.key === 'serper-images') {
                            const images = eventData.data.images.map((image: any) => { return { thumbnail: image.thumbnailUrl, image: image.imageUrl }}).slice(0, 8);
                            res.write(`data: ${JSON.stringify({ type: 'images', data: images })}\n\n`);
                        }

                        if (eventData.key === 'relatedQuestions') {
                            res.write(`data: ${JSON.stringify({ type: 'relatedQuestions', data: eventData.data })}\n\n`);
                        }

                        if (eventData.key === 'summary') {
                            res.write(`data: ${JSON.stringify({ type: 'summary', data: eventData.data })}\n\n`);
                        }
                }

                PerplexitySOP.onActionComplete(actionComplete);

                const dataStore = new DataStore();
                dataStore.add('searchQuery', existingQuestion.searchQuery);
                dataStore.add('timePublished', '1d');

                const response = await PerplexitySOP.invoke(dataStore);
                // update prisma with the response
                await prisma.question.update({
                    where: {
                        id: existingQuestion.id,
                    },
                    data: {
                        content: JSON.stringify(response),
                    },
                });

                PerplexitySOP.removeActionCompleteListener(actionComplete);
                res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);

                }
        }
}
});



app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});