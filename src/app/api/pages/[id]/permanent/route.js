import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

async function getDescendantPageIds(db, parentId) {
  const children = await db.collection('pages').find({ parentId }).toArray();
  let ids = [];
  for (const child of children) {
    ids.push(child.id);
    const subIds = await getDescendantPageIds(db, child.id);
    ids = ids.concat(subIds);
  }
  return ids;
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { db, isConnected } = await connectToDatabase();
    if (!isConnected || !db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const descendantIds = await getDescendantPageIds(db, id);
    const allIds = [id, ...descendantIds];

    // Find if any of these pages have attached databases
    const pagesWithDb = await db
      .collection('pages')
      .find({ id: { $in: allIds }, isDatabase: true })
      .toArray();

    const dbIds = pagesWithDb.map((p) => p.databaseId).filter(Boolean);

    // Delete database records and databases
    if (dbIds.length > 0) {
      await db.collection('database_records').deleteMany({ databaseId: { $in: dbIds } });
      await db.collection('databases').deleteMany({ id: { $in: dbIds } });
    }

    // Delete pages permanently
    await db.collection('pages').deleteMany({ id: { $in: allIds } });

    return NextResponse.json({
      success: true,
      message: 'Page permanently deleted',
      deletedIds: allIds
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
