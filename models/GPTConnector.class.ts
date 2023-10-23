import { Configuration, OpenAIApi, CreateCompletionRequest } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

export class GPTConnector {
    private readonly api: OpenAIApi;
    private readonly delayMs: number;

    constructor(delayMs: number = 1000) {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.api = new OpenAIApi(configuration);
        this.delayMs = delayMs;
    }

    async sendPrompt(context: string, temperature: number, prompt: string): Promise<string | undefined> {
        const gptPrompt = `Pergunta anterior: ${context}\nPrompt: ${prompt}\n`;

        try {
            const request: CreateCompletionRequest = {
                model: 'text-davinci-003',
                prompt: gptPrompt,
                max_tokens: 1000,
                temperature,
            };

            const response = await this.makeRequestWithRetries(request, 3);

            if (response.data.choices[0].text !== undefined) {
                return response.data.choices[0].text.trim();
            } else {
                throw new Error('Unexpected response from OpenAI API: No choices found.');
            }
        } catch (error) {
            console.error('Error connecting with ChatGPT', error);
        }
    }

    private async makeRequestWithRetries(request: CreateCompletionRequest, maxRetries: number): Promise<any> {
        let retries = 0;
        while (retries < maxRetries) {
            try {
                if (retries > 0) {
                    await this.delay(this.delayMs); // Add delay between retries
                }
                return await this.api.createCompletion(request);
            } catch (error) {
                console.error(`Error connecting with OpenAI API: ${error}`);
            }
        }
        throw new Error(`Exceeded maximum retries (${maxRetries}) for API request.`);
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}