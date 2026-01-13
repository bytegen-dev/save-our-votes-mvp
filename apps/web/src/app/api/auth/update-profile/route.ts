import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/config';
import { MongoClient } from 'mongodb';

const getDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/save-our-votes';
  const dbName = process.env.MONGODB_DB_NAME || 'save-our-votes';

  const client = new MongoClient(mongoUri);
  await client.connect();
  return client.db(dbName);
};

export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: request.headers,
      cookies: request.cookies,
    });

    if (!session?.user) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email } = body;

    const database = await getDB();
    const userCollection = database.collection('user');

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    await userCollection.updateOne(
      { id: session.user.id },
      { $set: updateData }
    );

    const updatedUser = await userCollection.findOne({ id: session.user.id });

    return NextResponse.json({
      status: 'success',
      data: {
        user: {
          id: updatedUser?.id,
          name: updatedUser?.name,
          email: updatedUser?.email,
          image: updatedUser?.image,
        },
      },
    });
  } catch (error: any) {
    console.error('Failed to update profile:', error);
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
