
import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

import { expressHandler } from '@genkit-ai/express';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

if (process.env.GENKIT_ENV === 'dev') {
  console.log('Running in development mode');
  // Add other dev-specific logic here
}
const MY_FILE_STORE_NAME = 'fileSearchStores/qsasearchstore-d4azc0wxbtzg';
// Initialize Genkit with the Google AI plugin
const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY! })],
  model: googleAI.model('gemini-2.5-flash', {
    temperature: 0.1
  }),
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: z.object({ input: z.string() }),
    // Update output schema to include text and chunks
    outputSchema: z.object({ data: z.string(), chunks: z.string() }),
  },
  async ({ input }, { sendChunk }) => {
    const systemInstruction = "You are an AI assistant for quality user manuals. All your responses must be formatted using HTML tags (e.g., <b>, <i>, <p>, <ul>, <li>, <br>). Do not use Markdown.";
    let promptWithInstruction = `${systemInstruction} \n\nUser Prompt: ${input} `;
    // 1. Use ai.generate() and assign the result object to 'result'
    const result = await ai.generate({
      prompt: promptWithInstruction,
      config: {
        tools: [{
          file_search: {
            file_search_store_names: [MY_FILE_STORE_NAME]
          }
        }]
      },
    });

    // 2. Extract Grounding Metadata
    // result.raw is typed as unknown by the SDK, so narrow it before accessing nested fields.
    const resultRaw = (result as any).raw as {
      candidates?: Array<{
        groundingMetadata?: {
          groundingChunks?: Array<{
            retrievedContext: { text: string }
          }>
        }
      }>
    } | undefined;

    const groundingChunks = resultRaw?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // 3. Format the chunks into a single string
    const formattedChunks = groundingChunks
      // Map the grounding chunks to their text content
      .map(chunk => chunk.retrievedContext.text.replace(/\n\n/g, '<br>').replace(/\n/g, '').replace(/\n\r/g, '<br>').replace(/\r/g, ''))
      // Join them into one string, using HTML line breaks for formatting
      .join('<br><br>--- DOCUMENT CHUNK ---<br><br>');

    // 4. Return the structured object matching the new outputSchema
    return {
      data: result.text, // The main AI response text
      chunks: formattedChunks // The document references
    };
  },
);

// async function main() {
//   const recipe = await chatFlow({
//     input: 'how is the Director?'
//   });

//   console.log(recipe);
// }

// main().catch(console.error);

const app = express();
app.use(express.json());
const corsOptions = {
  origin: '*', // Allow requests only from this origin
  methods: ['GET', 'POST'], // Allow only GET and POST requests
  //   allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  //   credentials: false // Allow sending cookies/authorization headers
};

app.use(cors(corsOptions));


app.post('/api/chat', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  chatFlow({
    input: req.body.input
  }).then((response) => {
    res.status(200).json(response);
  }).catch((error) => {
    res.status(500).json({ error: error.message });
  });
  // console.log('Received request:', req.body);  
  // res.status(200).send('OK');
});

app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

if (process.env.GENKIT_ENV === 'dev') {
  app.listen(process.env.EXP_PORT, () => {
    console.log('Express server listening on port 8080');
  });
}

// export const chat = onRequest(app);
