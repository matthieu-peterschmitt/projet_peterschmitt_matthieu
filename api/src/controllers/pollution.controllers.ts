import db from "@/models";
import { Request, Response } from "express";

export async function getAll(req: Request, res: Response) {
  const data = await db.pollutions.findAll().catch((err) => {
    res.status(400).send(err);
  });

  res.json(data);
}

export async function getOne(req: Request, res: Response) {
  const { id } = req.params;

  const data = await db.pollutions.findByPk(id).catch((err) => {
    res.status(400).send(err);
  });

  res.setHeader("Content-Type", "application/json");
  res.send(data);
}

export async function create(req: Request, res: Response) {
  const data = await db.pollutions.create(req.body).catch((err) => {
    res.status(400).send(err);
    console.log(err);
  });

  res.json(data);
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  await db.pollutions
    .update(req.body, {
      where: { id },
    })
    .catch((err) => {
      res.status(400).send(err);
    });

  res.setHeader("Content-Type", "application/json");
  res.sendStatus(200);
}

export async function deleteOne(req: Request, res: Response) {
  const { id } = req.params;

  await db.pollutions
    .destroy({
      where: { id },
    })
    .catch((err) => {
      res.status(400).send(err);
    });

  res.setHeader("Content-Type", "application/json");
  res.sendStatus(200);
}
