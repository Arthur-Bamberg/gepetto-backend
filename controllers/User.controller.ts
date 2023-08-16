import { User } from "../models/User.class";

export class UserController {
    public static async createUser(formData: any) {
        const user = new User(formData.name, formData.email, formData.password);
        await user.save();
        return user;
    }

    public static async updateUser(user: User, formData: any) {
        if(formData.name) {
            user.name = formData.name;
        }

        if(formData.email) {
            user.email = formData.email;
        }

        if(formData.password) {
            user.password = formData.password;
        }

        if(formData.isActive) {
            user.isActive = formData.isActive;
        }

        await user.update();
    }
    
    public static async deleteUser(user: User) {
        await user.delete();
    }

    public static async getUser(idUser: number) {
        return await User.getById(idUser);
    }
}