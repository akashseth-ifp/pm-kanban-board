import { auth } from "../lib/auth";
import logger from "../lib/logger";

declare global {
    namespace Express {
        interface Request {
            user?: typeof auth.$Infer.Session.user;
            session?: typeof auth.$Infer.Session.session;
            log: typeof logger;
        }
    }
}
