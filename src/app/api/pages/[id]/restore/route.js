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

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { db, isConnected } = await connectToDatabase();
    if (!isConnected || !db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const descendantIds = await getDescendantPageIds(db, id);
    const targetIds = [id, ...descendantIds];

    await db.collection('pages').updateMany(
      { id: { $in: targetIds } },
      { $set: { isTrash: false, trashedAt: null } }
    );

    return NextResponse.json({
      success: true,
      message: 'Page and descendants restored from trash',
      restoredIds: targetIds
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
