import * as nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export class EmailSender {
    private userEmail: string;
    private userName: string;

    constructor(userEmail: string, userName: string) {
        this.userEmail = userEmail;
        this.userName = userName;
    }

    public async sendEmail() {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_SENDER,
                    pass: process.env.EMAIL_PASS
                }
            });
    
            const sendEmail = this.userEmail;
            const sendName = this.userName;
    
            const mailOptions = {
                from: process.env.EMAIL_SENDER,
                to: sendEmail,
                subject: 'Recuperação de Senha',
                html: 
                    `<h1>Recuperação de Senha</h1>
                    <p>Prezado ${sendName},</p>
                    <p>Recebemos uma solicitação de recuperação de senha para a sua conta. Se você não solicitou isso, por favor, ignore este email.</p>
                    <p>Se você solicitou a recuperação da senha, clique no link abaixo para redefinir sua senha:</p>
                    <p><a href="link_para_reset_de_senha">Redefinir Senha</a></p>
                    <p>Este link é válido por um curto período de tempo, portanto, aconselhamos que você aja rapidamente.</p>
                    <p>Se o botão acima não funcionar, você também pode copiar e colar o seguinte link em seu navegador:</p>
                    <p>link_para_reset_de_senha</p>
                    <p>Obrigado por usar nossos serviços.</p>
                    <p>Atenciosamente,</p>
                    <p>Geppeto Assistant</p>`,
            };
    
            return await transporter.sendMail(mailOptions);

        } catch (error) {
            console.log(error);
        }
    }
}