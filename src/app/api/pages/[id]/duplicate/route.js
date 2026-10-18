import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { db, isConnected } = await connectToDatabase();
    if (!isConnected || !db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const sourcePage = await db.collection('pages').findOne({ id });
    if (!sourcePage) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const newPageId = `page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const clonedBlocks = (sourcePage.blocks || []).map((b) => ({
      ...b,
      id: `b_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    }));

    let newDatabaseId = null;
    if (sourcePage.isDatabase && sourcePage.databaseId) {
      const sourceDb = await db.collection('databases').findOne({ id: sourcePage.databaseId });
      if (sourceDb) {
        newDatabaseId = `db_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const clonedDb = {
          ...sourceDb,
          id: newDatabaseId,
          pageId: newPageId,
          title: `${sourceDb.title} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        delete clonedDb._id;
        await db.collection('databases').insertOne(clonedDb);

        // Clone records
        const sourceRecords = await db
          .collection('database_records')
          .find({ databaseId: sourcePage.databaseId })
          .toArray();

        if (sourceRecords.length > 0) {
          const clonedRecords = sourceRecords.map((r) => {
            const copy = { ...r };
            delete copy._id;
            copy.id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            copy.databaseId = newDatabaseId;
            copy.createdAt = new Date().toISOString();
            copy.updatedAt = new Date().toISOString();
            return copy;
          });
          await db.collection('database_records').insertMany(clonedRecords);
        }
      }
    }

    const newPage = {
      ...sourcePage,
      id: newPageId,
      title: `${sourcePage.title} (Copy)`,
      databaseId: newDatabaseId,
      isFavorite: false,
      isTrash: false,
      trashedAt: null,
      order: (sourcePage.order || 0) + 1,
      blocks: clonedBlocks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    delete newPage._id;

    await db.collection('pages').insertOne(newPage);

    return NextResponse.json({ page: newPage });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
