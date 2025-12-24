// src/controllers/physician.controller.ts
import type { Request, Response, NextFunction } from 'express';
import providerService from '../services/provider.service.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { SettingsBody } from '../types/settings.js';
import path from 'path';
import { uploadToS3 } from '../services/s3.js';

export class ProviderController{
    list = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const items = await providerService.listProvidersGroupedBySpecialty();
        res.json(items);
      } catch (err) {
        next(err);
      }
    };

    get = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ error: 'ID is required' });

        const item = await providerService.get(id);
        if (!item) return res.status(404).json({ error: 'Provider not found' });

        res.json(item);
      } catch (err) {
        next(err);
      }
    };

    getSpecialtyLicenses = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ error: 'ID is required' });

        const item = await providerService.getLicensesBySpecialty(id);
        if (!item) return res.status(404).json({ error: 'Provider not found' });

        res.json(item);
      } catch (err) {
        next(err);
      }
    };

    getBySpecialty = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const{id, providerspecialtyId}  = req.params!;
        const state  = req.query.state as string;
        //if (!id) return res.status(400).json({ error: 'ID is required' });
        if (!id || !providerspecialtyId || !state) {
          return res.status(400).json({ error: 'id and provider specialtyId are required' });
        }
          
        const item = await providerService.getBySpecialtyId(state, providerspecialtyId);
        if (!item) return res.status(404).json({ error: 'Provider not found' });

        res.json(item);
      } catch (err) {
        next(err);
      }
    };
    getSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const { id: userId } = req.user!;
        //console.log("PROVIDER ID", userId);
        const item = await providerService.getProviderSettings(userId);
        if (!item) return res.status(404).json({ error: 'Physician not found' });

        res.json(item);
      } catch (err) {
        next(err);
      }
    };

     updateSettings = async(req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            
            const data: SettingsBody = req.body;
            //if (!id) return res.status(400).json({ error: "Provider ID is required" });
            const { id: userId } = req.user!;
            
            const settings = await providerService.update(userId, data);
            res.json(settings);
            } catch (err) {
                next(err);
            }
       }
    uploadPhoto = async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const file = req.file!;
        const key = `providers/${Date.now()}-${file.originalname}`;

        const { id: userId } = req.user!;
        if (!file) {
          return res.status(400).json({ message: "No file uploaded" });
        }
        
        const url = await uploadToS3(
          file.buffer,
          key,
          file.mimetype
        );

        //res.json({ url });
          
        

        // Save relative path (e.g. /uploads/providers/filename.jpg)
        
        //const imagepath = path.posix.join("uploads", "providers", req.file.filename);
       
        // Update provider avatar path
        const updated = await providerService.upload(url, userId);        

        res.json({ avatar: updated });
      } catch (err) {
        next(err);
      }
    }
}


