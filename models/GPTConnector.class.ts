import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

export class GPTConnector {
    private readonly api: OpenAI;

    constructor() {
        this.api = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async sendPrompt(context: string, prompt: string): Promise<string | undefined> {
        const gptPrompt = `${context}Pergunta atual: ${prompt}`;

        try {
            const response = await this.api.chat.completions.create({
                messages: [{ role: "user", content: gptPrompt }],
                model: "gpt-3.5-turbo",
            });

            if (response.choices[0].message.content !== undefined) {
                return response.choices[0].message.content?.trim().replace('`', '');
            } else {
                throw new Error('Unexpected response from OpenAI API: No choices found.');
            }
        } catch (error) {
            console.error('Error connecting with ChatGPT', error);
        }
    }
}