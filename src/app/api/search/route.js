import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim();

    const { db, isConnected } = await connectToDatabase();
    if (!isConnected || !db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    if (!query) {
      // Return recent 10 active pages
      const recentPages = await db
        .collection('pages')
        .find({ isTrash: false })
        .project({
          id: 1,
          title: 1,
          icon: 1,
          isDatabase: 1,
          databaseId: 1,
          updatedAt: 1
        })
        .sort({ updatedAt: -1 })
        .limit(10)
        .toArray();

      return NextResponse.json({ results: recentPages, isRecent: true });
    }

    // Search page titles and block contents using regex
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const matchingPages = await db
      .collection('pages')
      .find({
        isTrash: false,
        $or: [
          { title: regex },
          { description: regex },
          { 'blocks.content': regex }
        ]
      })
      .project({
        id: 1,
        title: 1,
        icon: 1,
        description: 1,
        isDatabase: 1,
        databaseId: 1,
        updatedAt: 1,
        blocks: 1
      })
      .limit(20)
      .toArray();

    // Format results with snippet
    const formatted = matchingPages.map((page) => {
      let snippet = page.description || '';
      if (!snippet && page.blocks && page.blocks.length > 0) {
        const matchingBlock = page.blocks.find(
          (b) => b.content && typeof b.content === 'string' && regex.test(b.content)
        );
        if (matchingBlock) {
          snippet = matchingBlock.content.substring(0, 100);
        } else {
          snippet = (page.blocks[0]?.content || '').substring(0, 80);
        }
      }
      return {
        id: page.id,
        title: page.title,
        icon: page.icon,
        snippet,
        isDatabase: page.isDatabase,
        databaseId: page.databaseId,
        updatedAt: page.updatedAt
      };
    });

    return NextResponse.json({ results: formatted, isRecent: false });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
