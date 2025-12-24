// src/services/auth.service.ts
import prisma from '../prisma.js';
import jwt from 'jsonwebtoken';
import { notificationService } from './notification.service.js';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "24h"
//const TEST_OTP = '212223';
const OTP_EXPIRY_MINUTES = 5;

interface User {
  id: string;
  email: string | null;
  role: string;
}
const otpStore: Record<string, { otp: string; expiresAt: Date }> = {};

class AuthService {

  private generateOtp(length = 6, type: 'numeric' | 'alphabet' | 'alphanumeric' = 'numeric'): string {
    let characters = '';
    if (type === 'numeric') characters = '0123456789';
    else if (type === 'alphabet') characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    else if (type === 'alphanumeric') characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return otp;
  }

  async sendOtp(email: string): Promise<{ message: string }> {
    if (!email) throw new Error('Email is required');
    const normalizedEmail = email.trim().toLowerCase();
    // Basic email validation
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) throw new Error('Invalid email format');
    const otp = this.generateOtp(6, 'numeric');
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);    

    otpStore[normalizedEmail] = { otp, expiresAt };

     console.log(`✅ OTP for ${email}: ${otp} (type: numeric, expires in ${OTP_EXPIRY_MINUTES} mins)`);
     await notificationService.send({
        templateName: "OTP_CODE",
        recipient: email,
        variables: {
          otp: otp,
          name: email,
          expiresIn: OTP_EXPIRY_MINUTES
        }
      })
    // Ensure a user exists
    const user = await prisma.user.findFirst({ 
      where: { 
        email:{
            equals: email,
             mode: "insensitive"
        } 
       } });
    //console.log("email user: ", user);
    if (!user) return { message: 'User not registered' };

    // Generate OTP
    /* const otp = this.generateOtp(6, 'numeric');
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    otpStore[email] = { otp, expiresAt }; */

    //console.log(`OTP for ${email}: ${TEST_OTP}`);
    //console.log(`✅ OTP for ${email}: ${otp} (type: numeric, expires in ${OTP_EXPIRY_MINUTES} mins)`);
    return { message: 'OTP sent to email (check console for now)' };
  }

  async getSystemID():Promise<string> {
    let user = await prisma.user.findFirst({ 
      where: { 
        role: UserRole.SYSTEM
    } });
    return user?.id ?? "";
  }
  async verifyOtp(email: string, otp: string): Promise<{ token: string; user: User }> {
    if (!email || !otp) throw new Error('Email and OTP required');
    const normalizedEmail = email.trim().toLowerCase();
    //verify otp logic
    const storedOtp = otpStore[normalizedEmail];
    if (!storedOtp) throw new Error('No OTP sent to this identifier');

    if (new Date() > storedOtp.expiresAt) {
      delete otpStore[normalizedEmail];
      throw new Error('OTP has expired');
    }
    
    if (storedOtp.otp !== otp) {
      //console.log("stored otp: ", storedOtp.otp);
      throw new Error('Invalid OTP');
    }

    delete otpStore[normalizedEmail];

    // OTP check (using fixed OTP for now)
   //if (otp !== TEST_OTP) throw new Error('Invalid OTP');
    
    // Find or create user
    //let user = await prisma.user.findFirst({ where: { email } });
    let user = await prisma.user.findFirst({ 
      where: { 
        email:{
            equals: email,
             mode: "insensitive"
        } 
    } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          role: UserRole.PATIENT,
          created_by: 'SYSTEM',
          created_date: new Date(),
        },
      });
    }

    // Generate JWT (24h)
    const token = jwt.sign(
      { accountId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" } 
    );

    return { token, user };
  }

   generateConsultLinkToken(userId: string, consultId: string) {
    return jwt.sign(
      {
        userId,
        consultId,
        type: "CONSULT_LINK"
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
  }
  isVerifiedConsultLink(linkToken: string, consultId: string, userId: string){
    const decoded = jwt.verify(linkToken, JWT_SECRET) as {
            userId: string;
            consultId: string;
            type: string;
        };

          if (
            decoded.type === "CONSULT_LINK" &&
            decoded.consultId === consultId &&
            decoded.userId === userId
          ) {
            return true
          }
          return false;
  }
}

export default new AuthService();
