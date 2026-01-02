import { auth } from "../lib/auth";
import logger from "../lib/logger";
import { Board } from "../schema/board.schema";

declare global {
    namespace Express {
        interface Request {
            user?: typeof auth.$Infer.Session.user;
            session?: typeof auth.$Infer.Session.session;
            log: typeof logger;
            board?: Board;
        }
    }
}
