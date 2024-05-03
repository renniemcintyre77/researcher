import getSearchSop from './sop/perplexity';

const main = async () => {

    const searchQuery = 'Whisky';
    const timePublished = '1h';

    const perplexity = await getSearchSop('Manual');
    const response = await perplexity.invoke({ searchQuery, timePublished });
    console.log(response.news[0].data);
}

main();


