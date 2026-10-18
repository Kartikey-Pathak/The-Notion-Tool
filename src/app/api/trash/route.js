import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db, isConnected } = await connectToDatabase();
    if (!isConnected || !db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const trashedPages = await db
      .collection('pages')
      .find({ isTrash: true })
      .project({
        id: 1,
        title: 1,
        icon: 1,
        trashedAt: 1,
        createdAt: 1,
        parentId: 1
      })
      .sort({ trashedAt: -1 })
      .toArray();

    return NextResponse.json({ pages: trashedPages });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { db, isConnected } = await connectToDatabase();
    if (!isConnected || !db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const trashed = await db.collection('pages').find({ isTrash: true }).toArray();
    const trashedIds = trashed.map((p) => p.id);
    const dbIds = trashed.filter((p) => p.isDatabase && p.databaseId).map((p) => p.databaseId);

    if (dbIds.length > 0) {
      await db.collection('database_records').deleteMany({ databaseId: { $in: dbIds } });
      await db.collection('databases').deleteMany({ id: { $in: dbIds } });
    }

    if (trashedIds.length > 0) {
      await db.collection('pages').deleteMany({ id: { $in: trashedIds } });
    }

    return NextResponse.json({
      success: true,
      message: 'Trash emptied permanently',
      count: trashedIds.length
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
