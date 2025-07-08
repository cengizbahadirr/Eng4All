import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import UserModel from '@/models/User';
import dbConnect from './mongodb'; // Assuming dbConnect is in lib/mongodb.ts

const JWT_SECRET = process.env.JWT_SECRET;

// This function is cached for the duration of a single request.
export const getUser = cache(async () => {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined.');
    return null;
  }

  await dbConnect();
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    const userId = (payload.userId as string) || (payload.sub as string) || null;
    if (!userId) {
      return null;
    }

    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return null;
    }
    
    // Ensure the password hash is not returned.
    const { password, ...userWithoutPassword } = user;
    // Convert ObjectId to string for client-side usage
    return JSON.parse(JSON.stringify(userWithoutPassword));

  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
});
