import { NextResponse } from 'next/server';
import { connectToDatabase, initializeWorkspace } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db, isConnected } = await connectToDatabase();
    if (!isConnected || !db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    let workspace = await db.collection('workspaces').findOne({});
    if (!workspace) {
      workspace = await initializeWorkspace(db);
    }

    const pagesCount = await db.collection('pages').countDocuments({ isTrash: false });
    const databasesCount = await db.collection('databases').countDocuments({});
    const trashCount = await db.collection('pages').countDocuments({ isTrash: true });

    return NextResponse.json({
      workspace,
      stats: {
        pagesCount,
        databasesCount,
        trashCount
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { db, isConnected } = await connectToDatabase();
    if (!isConnected || !db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const body = await request.json();
    const { name, icon } = body || {};

    const updates = { updatedAt: new Date().toISOString() };
    if (name !== undefined) updates.name = String(name).trim() || 'Personal Workspace';
    if (icon !== undefined) updates.icon = String(icon);

    await db.collection('workspaces').updateOne({}, { $set: updates });
    const updated = await db.collection('workspaces').findOne({});

    return NextResponse.json({ workspace: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { db, isConnected } = await connectToDatabase();
    if (!isConnected || !db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const body = await request.json();
    if (!body || body.confirm !== 'CLEAR') {
      return NextResponse.json(
        { error: 'Explicit confirmation required. Send { confirm: "CLEAR" }.' },
        { status: 400 }
      );
    }

    // Drop collections to clear workspace data
    await db.collection('workspaces').deleteMany({});
    await db.collection('pages').deleteMany({});
    await db.collection('databases').deleteMany({});
    await db.collection('database_records').deleteMany({});

    // Re-initialize clean starter workspace
    const newWs = await initializeWorkspace(db);

    return NextResponse.json({
      success: true,
      message: 'Workspace data cleared and reinitialized.',
      workspace: newWs
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
