"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const genkit_1 = require("genkit");
const google_genai_1 = require("@genkit-ai/google-genai");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (process.env.GENKIT_ENV === 'dev') {
    console.log('Running in development mode');
    // Add other dev-specific logic here
}
const MY_FILE_STORE_NAME = 'fileSearchStores/qsasearchstore-d4azc0wxbtzg';
// Initialize Genkit with the Google AI plugin
const ai = (0, genkit_1.genkit)({
    plugins: [(0, google_genai_1.googleAI)({ apiKey: process.env.GEMINI_API_KEY })],
    model: google_genai_1.googleAI.model('gemini-2.5-flash', {
        temperature: 0.1
    }),
});
const chatFlow = ai.defineFlow({
    name: 'chatFlow',
    inputSchema: genkit_1.z.object({ input: genkit_1.z.string() }),
    // Update output schema to include text and chunks
    outputSchema: genkit_1.z.object({ data: genkit_1.z.string(), chunks: genkit_1.z.string() }),
}, async ({ input }, { sendChunk }) => {
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
    const resultRaw = result.raw;
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
});
// async function main() {
//   const recipe = await chatFlow({
//     input: 'how is the Director?'
//   });
//   console.log(recipe);
// }
// main().catch(console.error);
const app = (0, express_1.default)();
app.use(express_1.default.json());
const corsOptions = {
    origin: '*', // Allow requests only from this origin
    methods: ['GET', 'POST'], // Allow only GET and POST requests
    //   allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
    //   credentials: false // Allow sending cookies/authorization headers
};
app.use((0, cors_1.default)(corsOptions));
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
