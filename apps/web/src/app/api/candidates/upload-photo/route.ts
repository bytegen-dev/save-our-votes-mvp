import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/config';
import { put } from '@vercel/blob';

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

    let extension = 'jpg';
    if (file.type === 'image/png') {
      extension = 'png';
    } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      extension = 'jpg';
    } else if (file.type === 'image/heic') {
      extension = 'heic';
    }

    const fileName = `candidates/candidate-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
    
    const blob = await put(fileName, file, {
      access: 'public',
      contentType: file.type,
    });

    const imageUrl = blob.url;

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
