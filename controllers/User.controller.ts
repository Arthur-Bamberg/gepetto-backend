import { User } from "../models/User.class";
import { Authenticator } from "../models/Authenticator.class";

export class UserController {
    public static async createUser(formData: any) {
        const user = new User(formData.name, formData.email, formData.password);
        await user.save();
        return Authenticator.signJWT(user.json());
    }

    public static async changePassword(idUser: number, password: string) {
        await User.changePassword(idUser, password);
    }
    
    public static async deleteUser(user: User) {
        await user.delete();
    }

    public static async getUser(idUser: number) {
        return await User.getById(idUser);
    }

    public static async emailIsUnique(email: string) {
        return await User.emailIsUnique(email);
    }

    public static async authenticateByChangePasswordId(changePasswordId: string) {
        return await User.authenticateByChangePasswordId(changePasswordId);
    }
}