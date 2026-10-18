import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Helper to recursively collect descendant page IDs
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

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { db, isConnected } = await connectToDatabase();
    if (!isConnected || !db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const page = await db.collection('pages').findOne({ id });
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // If it's a database, load the database document and records
    let database = null;
    let records = [];
    if (page.isDatabase && page.databaseId) {
      database = await db.collection('databases').findOne({ id: page.databaseId });
      records = await db
        .collection('database_records')
        .find({ databaseId: page.databaseId })
        .sort({ createdAt: -1 })
        .toArray();
    }

    return NextResponse.json({ page, database, records });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { db, isConnected } = await connectToDatabase();
    if (!isConnected || !db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const body = await request.json();
    const updates = { updatedAt: new Date().toISOString() };

    const allowedFields = [
      'title',
      'icon',
      'cover',
      'description',
      'isFavorite',
      'blocks',
      'parentId',
      'order'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    await db.collection('pages').updateOne({ id }, { $set: updates });

    // Also update database title if page title changed and it's a database
    if (updates.title) {
      const page = await db.collection('pages').findOne({ id });
      if (page && page.databaseId) {
        await db.collection('databases').updateOne(
          { id: page.databaseId },
          { $set: { title: updates.title, updatedAt: new Date().toISOString() } }
        );
      }
    }

    const updatedPage = await db.collection('pages').findOne({ id });

    return NextResponse.json({ page: updatedPage });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { db, isConnected } = await connectToDatabase();
    if (!isConnected || !db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    // Soft delete page and all its descendants to prevent orphaning
    const descendantIds = await getDescendantPageIds(db, id);
    const targetIds = [id, ...descendantIds];

    const trashedAt = new Date().toISOString();
    await db.collection('pages').updateMany(
      { id: { $in: targetIds } },
      { $set: { isTrash: true, trashedAt } }
    );

    return NextResponse.json({
      success: true,
      message: 'Page and descendants moved to trash',
      trashedIds: targetIds
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
