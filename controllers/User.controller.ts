import { User } from "../models/User.class";
import { Authenticator } from "../models/Authenticator.class";

export class UserController {
    public static async createUser(formData: any) {
        const user = new User(
            formData.name,
            formData.email,
            formData.password,
            formData.city,
            formData.sex
        );
        await user.save();
        return Authenticator.signJWT(user.json());
    }

    public static async updateUser(user: User, formData: any) {
        if(formData.name) {
            user.name = formData.name;
        }

        if(formData.city) {
            user.city = formData.city;
        }

        if(formData.sex) {
            user.sex = formData.sex;
        }

        await user.update();
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