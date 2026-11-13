import type { IncomingMessage, ServerResponse } from "node:http";
import { handleApiRequest } from "./_backend.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  return handleApiRequest(req, res);
}
