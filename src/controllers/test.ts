import { Request, Response } from "express";

export let index = (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ a: 1 }));
  };