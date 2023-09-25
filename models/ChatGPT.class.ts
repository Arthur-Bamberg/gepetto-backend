export class ChatGPT {
    public static getAnswer(question: string, lastMessage:string | null): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                let fullPrompt;

                if (lastMessage) {
                    fullPrompt = `Previous message: ${lastMessage}\nQuestion: ${question}`;
                } else {
                    fullPrompt = `Question: ${question}`;
                }

                resolve(fullPrompt);   
                
            } catch (error) {
                reject(error);
            }
        });
    }
}