import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/config';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const getDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/save-our-votes';
  const dbName = process.env.MONGODB_DB_NAME || 'save-our-votes';

  const client = new MongoClient(mongoUri);
  await client.connect();
  return client.db(dbName);
};

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { status: 'error', message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { status: 'error', message: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const database = await getDB();
    const userCollection = database.collection('user');
    const sessionCollection = database.collection('session');

    const user = await userCollection.findOne({ id: session.user.id });

    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { status: 'error', message: 'User password not found' },
        { status: 404 }
      );
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { status: 'error', message: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await userCollection.updateOne(
      { id: session.user.id },
      {
        $set: {
          password: hashedPassword,
          passwordChangedAt: new Date(),
        },
      }
    );

    await sessionCollection.deleteMany({ userId: session.user.id });

    return NextResponse.json({
      status: 'success',
      message: 'Password changed successfully. Please sign in again.',
    });
  } catch (error: any) {
    console.error('Failed to change password:', error);
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Failed to change password' },
      { status: 500 }
    );
  }
}
