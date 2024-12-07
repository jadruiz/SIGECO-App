// src/types/express.d.ts
import { AuthenticatedUser } from './authenticated-user.interface';

declare namespace Express {
  export interface Request {
    user?: AuthenticatedUser;
  }
}
