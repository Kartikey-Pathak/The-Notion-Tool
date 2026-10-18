import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db, isConnected } = await connectToDatabase();
    if (!isConnected || !db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    // Return all active pages (not in trash)
    const pages = await db
      .collection('pages')
      .find({ isTrash: false })
      .project({
        id: 1,
        title: 1,
        icon: 1,
        cover: 1,
        parentId: 1,
        isFavorite: 1,
        isDatabase: 1,
        databaseId: 1,
        order: 1,
        createdAt: 1,
        updatedAt: 1
      })
      .sort({ order: 1, createdAt: 1 })
      .toArray();

    return NextResponse.json({ pages });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { db, isConnected } = await connectToDatabase();
    if (!isConnected || !db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const body = await request.json();
    const {
      title = 'Untitled',
      parentId = null,
      icon = '📄',
      cover = null,
      description = '',
      isDatabase = false,
      blocks = []
    } = body || {};

    const pageId = `page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const workspace = await db.collection('workspaces').findOne({});
    const workspaceId = workspace ? workspace.id : 'ws_default';

    // Find highest order among siblings
    const siblingWithMaxOrder = await db
      .collection('pages')
      .find({ parentId, isTrash: false })
      .sort({ order: -1 })
      .limit(1)
      .toArray();

    const order = siblingWithMaxOrder.length > 0 ? (siblingWithMaxOrder[0].order || 0) + 1 : 0;

    let databaseId = null;
    if (isDatabase) {
      databaseId = `db_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newDatabase = {
        id: databaseId,
        workspaceId,
        pageId,
        title: title || 'Untitled Database',
        schema: [
          { id: 'prop_title', name: 'Name', type: 'title' },
          { id: 'prop_status', name: 'Status', type: 'status', options: [
            { id: 'opt_not_started', name: 'Not Started', color: 'gray' },
            { id: 'opt_in_progress', name: 'In Progress', color: 'blue' },
            { id: 'opt_done', name: 'Done', color: 'green' }
          ]},
          { id: 'prop_tags', name: 'Tags', type: 'multi-select', options: [] }
        ],
        views: [
          { id: 'view_table', name: 'Table', type: 'table' },
          { id: 'view_board', name: 'Board', type: 'board', groupBy: 'prop_status' },
          { id: 'view_list', name: 'List', type: 'list' },
          { id: 'view_gallery', name: 'Gallery', type: 'gallery' }
        ],
        defaultViewId: 'view_table',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.collection('databases').insertOne(newDatabase);

      // Create an initial empty record
      await db.collection('database_records').insertOne({
        id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        databaseId,
        properties: {
          prop_title: 'First Item',
          prop_status: 'Not Started',
          prop_tags: []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    const defaultBlocks = isDatabase
      ? []
      : (blocks && blocks.length > 0
          ? blocks
          : [
              {
                id: `b_${Date.now()}_1`,
                type: 'paragraph',
                content: '',
                properties: {}
              }
            ]);

    const newPage = {
      id: pageId,
      workspaceId,
      parentId: parentId || null,
      title: title || 'Untitled',
      icon: icon || (isDatabase ? '📊' : '📄'),
      cover: cover || null,
      description: description || '',
      isFavorite: false,
      isTrash: false,
      isDatabase: Boolean(isDatabase),
      databaseId,
      order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blocks: defaultBlocks
    };

    await db.collection('pages').insertOne(newPage);

    return NextResponse.json({ page: newPage });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
