import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/config';
import { MongoClient } from 'mongodb';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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
      cookies: request.cookies,
    });

    if (!session?.user) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        { status: 'error', message: 'No file provided' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { status: 'error', message: 'Only PNG, JPG, JPEG, or HEIC images are allowed' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { status: 'error', message: 'Image size must be less than 5MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), 'public', 'avatars');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    let extension = 'png';
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      extension = 'jpg';
    } else if (file.type === 'image/heic') {
      extension = 'heic';
    }

    const fileName = `${session.user.id}-${Date.now()}.${extension}`;
    const filePath = join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    const imageUrl = `/avatars/${fileName}`;

    const database = await getDB();
    const userCollection = database.collection('user');

    await userCollection.updateOne(
      { id: session.user.id },
      { $set: { image: imageUrl } }
    );

    return NextResponse.json({
      status: 'success',
      data: {
        image: imageUrl,
      },
    });
  } catch (error: any) {
    console.error('Failed to upload avatar:', error);
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}
