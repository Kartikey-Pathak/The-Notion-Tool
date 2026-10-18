import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { TEMPLATES } from '@/lib/templates';

export async function GET() {
  return NextResponse.json({ templates: TEMPLATES });
}

export async function POST(request) {
  try {
    const { db, isConnected } = await connectToDatabase();
    if (!isConnected || !db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const body = await request.json();
    const { templateId, parentId = null } = body || {};

    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const pageId = `page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const workspace = await db.collection('workspaces').findOne({});
    const workspaceId = workspace ? workspace.id : 'ws_default';

    // Clone blocks with new unique IDs
    const clonedBlocks = template.blocks.map((b) => ({
      ...b,
      id: `b_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    }));

    const newPage = {
      id: pageId,
      workspaceId,
      parentId: parentId || null,
      title: template.title,
      icon: template.icon,
      cover: null,
      description: template.description,
      isFavorite: false,
      isTrash: false,
      isDatabase: false,
      databaseId: null,
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blocks: clonedBlocks
    };

    await db.collection('pages').insertOne(newPage);

    return NextResponse.json({ page: newPage });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
