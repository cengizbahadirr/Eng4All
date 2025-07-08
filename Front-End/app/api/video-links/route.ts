import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VideoLinksModel, { IVideoLinks } from '@/models/VideoLinks';
import mongoose from 'mongoose';

// Sabit doküman ID'si
const VIDEO_LINKS_DOCUMENT_ID = '684ee154d275472c240795e7';

export async function GET() {
  try {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(VIDEO_LINKS_DOCUMENT_ID)) {
      return NextResponse.json({ success: false, error: 'Geçersiz Video Doküman ID formatı.' }, { status: 400 });
    }

    const videoLinksDoc: IVideoLinks | null = await VideoLinksModel.findById(VIDEO_LINKS_DOCUMENT_ID);

    if (!videoLinksDoc) {
      return NextResponse.json({ success: false, error: 'Video linkleri dokümanı bulunamadı.' }, { status: 404 });
    }

    // Dokümandaki tüm alanları (kategorileri) alalım
    const categories = videoLinksDoc.toObject();
    
    // _id, createdAt, updatedAt gibi Mongoose tarafından eklenen alanları kaldıralım
    const { _id, createdAt, updatedAt, __v, ...filteredCategories } = categories;

    return NextResponse.json({ success: true, data: filteredCategories });

  } catch (error) {
    console.error('Video linkleri getirme hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası.';
    return NextResponse.json({ success: false, error: `Video linkleri getirilirken bir hata oluştu: ${errorMessage}` }, { status: 500 });
  }
}
