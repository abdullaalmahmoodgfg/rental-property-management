import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import { rate_limit } from '@/lib/rate-limit';

async function parseForm(req: NextRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
    const formidableReq = req as any;
    return new Promise((resolve, reject) => {
        const form = formidable({
            uploadDir: path.join(process.cwd(), 'public', 'uploads'),
            keepExtensions: true,
            filename: (name, ext, part, form) => {
                return `${name}-${Date.now()}${ext}`;
            }
        });
        form.parse(formidableReq, (err, fields, files) => {
            if (err) {
                reject(err);
            }
            resolve({ fields, files });
        });
    });
}


export async function POST(req: NextRequest) {
    try {
        await rate_limit(req);
        const session = await getServerSession();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fields, files } = await parseForm(req);

        const { providerId, reading, readingDate } = fields;
        const photo = files.photo;

        if (!providerId || !reading || !readingDate) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        let photoUrl = null;
        if (photo && Array.isArray(photo) && photo.length > 0) {
            const photoFile = photo[0];
            if (photoFile.newFilename) {
                photoUrl = `/uploads/${photoFile.newFilename}`;
            }
        }


        const utilityReading = await prisma.utilityReading.create({
            data: {
                providerId: String(providerId),
                reading: parseFloat(String(reading)),
                readingDate: new Date(String(readingDate)),
                photoUrl: photoUrl,
            },
        });

        return NextResponse.json(utilityReading);
    } catch (error) {
        console.error('Error creating utility reading:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
