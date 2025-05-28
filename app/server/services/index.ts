import { connectDB } from "../db/db";
import { UserRepository } from "../repositories/user.repository";

import { EmailService } from "./email.service";

const userRepository = new UserRepository(connectDB());
const emailService = new EmailService(userRepository);

export { emailService };
