import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/config';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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
    const file = formData.get('photo') as File;

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

    const uploadsDir = join(process.cwd(), 'apps', 'web', 'public', 'candidates');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    let extension = 'png';
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      extension = 'jpg';
    } else if (file.type === 'image/heic') {
      extension = 'heic';
    }

    const fileName = `candidate-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
    const filePath = join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    const imageUrl = `/candidates/${fileName}`;

    return NextResponse.json({
      status: 'success',
      data: {
        photo: imageUrl,
      },
    });
  } catch (error: any) {
    console.error('Failed to upload candidate photo:', error);
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Failed to upload photo' },
      { status: 500 }
    );
  }
}
