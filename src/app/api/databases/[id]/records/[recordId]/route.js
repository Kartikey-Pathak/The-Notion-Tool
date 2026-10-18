import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id, recordId } = resolvedParams;

    const { db, isConnected } = await connectToDatabase();
    if (!isConnected || !db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const body = await request.json();
    const { properties } = body || {};

    if (!properties || typeof properties !== 'object') {
      return NextResponse.json({ error: 'Properties object required' }, { status: 400 });
    }

    await db.collection('database_records').updateOne(
      { id: recordId, databaseId: id },
      {
        $set: {
          properties,
          updatedAt: new Date().toISOString()
        }
      }
    );

    const updated = await db.collection('database_records').findOne({ id: recordId });

    return NextResponse.json({ record: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id, recordId } = resolvedParams;

    const { db, isConnected } = await connectToDatabase();
    if (!isConnected || !db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    await db.collection('database_records').deleteOne({ id: recordId, databaseId: id });

    return NextResponse.json({ success: true, message: 'Record deleted' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
