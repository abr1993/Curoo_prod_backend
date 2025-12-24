// src/controllers/physician.controller.ts
import type { Request, Response, NextFunction } from 'express';
import specialtyService from '../services/specialty.service.js';

export const symptoms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing specialty id in route parameter" });
    }

    const items = await specialtyService.getSymptomsByProviderSpecialtyId(id);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

export const historyFields = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing specialty id in route parameter" });
    }

    const items = await specialtyService.getHistoryFieldsByProviderSpecialtyId(id);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

export const conditions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing specialty id in route parameter" });
    }

    const items = await specialtyService.getConditionsBySpecialty(id);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

export const redFlags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing specialty id in route parameter" });
    }

    const items = await specialtyService.getRedFlagsBySpecialty(id);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

export const getSpecialty = async (req: Request, res: Response, next: NextFunction) => {
  try {   

    const items = await specialtyService.getAllSpecialties();
    res.json(items);
  } catch (err) {
    next(err);
  }
};



