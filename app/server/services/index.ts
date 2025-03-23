import UserModel from "../models/User.model";
import { UserRepository } from "../repositories/user.repository";
import { EmailService } from "./email.service";

const userRepository = new UserRepository(UserModel);
const emailService = new EmailService(userRepository);

export { emailService };
