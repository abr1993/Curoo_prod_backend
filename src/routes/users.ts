import express from 'express';
import type { Request, Response } from 'express';
import prisma  from '../prisma.js';
import type { CreateUserBody } from '../types/users.js';
import { attachAuditMiddleware } from '../middleware/auditFields.js';


const router = express.Router();

// Simulate authenticated user
//const getUserId = (req: Request) => 'system-user-uuid'; // replace with your auth logic


/**
 * POST /api/create-user
 */
router.post(
  '/create-user',
  async (req: Request<{}, {}, CreateUserBody>, res: Response) => {
    try {
      const { email, phone, role, display_name } = req.body;

      if (!email || !role) {
        return res.status(400).json({ error: 'email and role are required' });
      }
      //attachAuditMiddleware('system_admin_ID');
      const newUser = await prisma.user.create({
        data: {
          email: email ?? null,
          phone: phone ?? null,
          role,
          // Optional: for physicians you may want to create a profile
          //...(display_name ? { physician_profile: { create: { display_name } } } : {}),
        },
        //include: { physician_profile: true },
      });
          
    let physician_profile = null;
    // Only create physician profile if role === 'PHYSICIAN'
    if (role === 'PROVIDER') {
       physician_profile = await prisma.provider.create({
        data: {
          user_id: newUser.id,
          display_name: display_name || "",
          is_available: true,         
          
        },
      });
    }

    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
      physician_profile
      //...(role === 'PHYSICIAN' && { profile: display_name }),
    });

      //res.json({ success: true, newUser });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * GET /api/users
 */
router.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { provider: true },
    });
    res.json(users);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
