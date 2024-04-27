# AgentMesh

Helper library for creating agentic workflows.

## Features

- Multiple llm providers
- Model swapping
- Chat
- Output caching using redis [!issue - llm caching doesn't work the same way as chat caching]
- Tool usage [TBD]
- Output conformance (JSON Array only so far)
- Chaining prompts [TBD]

## Getting Started

1. **Clone the repository**:

   ```bash
   git clone https://github.com/automationfm/AgentMesh.git your-package-name
   ```

2. **Navigate to the project directory**:

   ```bash
   cd your-package-name
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Start Development**:

   ```bash
   npm run dev
   ```

   This will watch for changes in your `src` directory and rebuild as necessary.

5. **Build for Production**:

   ```bash
   npm run build
   ```

   This will generate the necessary files in the `dist` directory.

## Scripts

- `npm run build`: Produces production version of your library.
- `npm run dev`: Runs the library in development mode with watch for changes.
- `npm run script`: Runs the temporary playground script.


### Environment Setup

In order to use the different LLM providers, a corresponding API KEY is required.

OpenAI = OPEN_AI_KEY
Groq = GROQ_API_KEY
TogetherAI = TOGETHER_AP_KEY
Google Gemini = GEMINI_API_KEY

In order to cache LLM requests, REDIS is used.  This needs to be installed and running on the default port.

The cache policy is controlled by the CACHE_TTL environment variable.  It defaults to 3600 seconds (1 hour).

Example:

```
OPEN_AI_KEY=sk-proj-xxx
CACHE_TTL=3600
```

### Code Example

The following is a description of the code in index.ts which is currently a playground to test the library.

```typescript
    let cache = await Cache.connect();
```
This opens a connection to Redis and returns a cache object for use with the models;

```typescript
    const openAi = {
        'gpt-3.5-turbo': await new llm({ provider: 'openai', model: 'gpt-3.5-turbo-0125'}, cache).initialise(),
        'gpt-4-turbo': await new llm({ provider: 'openai', model: 'gpt-4-turbo'}).initialise(),
    }
```

Here we are defining two llm object, one using gpt-3.5-turbo and the other gpt-4-turbo.

Note the cache object is passed to gpt-3.5-turbo but not gpt-4-turbo.

Passing the cache is optional.

```typescript
    const groqLlama3_70B = await new llm({ provider: 'groq', model: 'llama3-70b-8192' }, cache).initialise();
```

This is an example of creating an llm object for a different provider.  This time we're using [groq](https://wow.groq.com/why-groq/).

```typescript
    const researcher = new Chat({...Researcher}, groqLlama3_70B);
```

We can then use an llm object to create a new chat.  The chat object is passed options and a model.

The AgentOptions type allow attributes that will drive the system prompt to be set.

The following is the code from Researcher:

```typescript
const agentOptions = {
    role: 'Research Assistant',
    goal: 'To provide concise responses that are detail rich',
    backstory: `
    You have worked as a researcher for some of the biggest names such as Tim Ferriss, Seth Godin and Mark Manson.
    You are regarded as being the best in the business and they all regard you as the main reason for their success.
    Your ability to take complex subjects and distill them into easily understandable nuggets is legendary.
`
}

export default agentOptions;
```

We then create a StructuredOutputParser.

This allows us to define a schema for the format we want back from the llm.

In this example, we basically just want a list of company names

```typescript
    const arrayParser = StructuredOutputParser.fromZodSchema(
        z.object({
            companies:  z.array (
                z.string().describe('company name')
            )
        })
    )
```

We then just use the sendMessage method to prompt the llm.  We pass in the parser we created above to define the output we want.

Parser is optional here.  If this is left off, the response will always be a string.

```typescript
    let response = await researcher.sendMessage(`
I need a good company name for a company that makes whacky fish themed socks.
List 10 company names.`, arrayParser);
    console.log(response);
```

We can also use `continue` to ask the model to keep going

```typescript
    response = await researcher.continue(arrayParser);
    console.log(response);
```

We can swap models throughout the chat using the model property.

```typescript
    researcher.model = openAi['gpt-4-turbo'];

    response = await researcher.sendMessage('I think actually the socks should be animal themed, can you create a new list of 10 suggestions.', arrayParser);
    console.log(response);
```

In this example, although we hadn't used `gpt-4-turbo` so far, it will have the full chat history so will understand the task and return what we want.
Note we also pass the array parser here too.

```typescript
    await Cache.disconnect();
```

To clean up we disconnect Redis.

This is the view from the command line when we run this.

Node that the second array is a larger version of the first one because the model was smart enough to know what we wanted when we called `continue`


```js
➜  AgentMesh git:(main) npm run script

> AgentMesh@1.0.0 script
> node ./dist/index.js

{
  companies: [
    'Fin-tastic Socks',
    'Reel Socks Inc.',
    'Fishy Feet Co.',
    'Tidal Wave Socks',
    'The Sock Fishery',
    'Sea-rious Socks',
    'Fintastic Feet',
    'Oceanic Sock Co.',
    'The Catch Socks',
    'Sole Mates for Fish'
  ]
}
{
  companies: [
    'Fin-tastic Socks',
    'Reel Socks Inc.',
    'Fishy Feet Co.',
    'Tidal Wave Socks',
    'The Sock Fishery',
    'Sea-rious Socks',
    'Fintastic Feet',
    'Oceanic Sock Co.',
    'The Catch Socks',
    'Sole Mates for Fish',
    'Tales from the Deep Socks',
    'Fish Fry Socks',
    'Sock it to Me Socks',
    'The Sock Drawer Co.',
    "Finley's Sock Co.",
    'The Sock Wizard Co.',
    'Sea Socks Inc.',
    'Tidal Socks Co.',
    'Fishy Sock Co.',
    'Sock It to Me Socks',
    'Fin-tastic Socks',
    'The Sock Fishery Co.'
  ]
}
{
  companies: [
    'Critter Cozy Socks',
    'Paws and Claws Socks',
    'Wild Walk Socks',
    'Zoo Crew Socks',
    'Safari Steps Socks',
    'Animal Patter Socks',
    'Beastly Feet',
    'Jungle Jive Socks',
    'Creature Comfort Socks',
    'Fauna Footwear'
  ]
}
```

