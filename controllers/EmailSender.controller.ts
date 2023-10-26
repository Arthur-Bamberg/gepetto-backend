import { EmailSender } from "../models/EmailSender.class";

export class EmailSenderController {
    public static async sendEmail(userEmail: string, userName: string) {
        const emailSender = new EmailSender(userEmail, userName);
        return await emailSender.sendEmail();
    }
}