import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { db, isConnected } = await connectToDatabase();
    if (!isConnected || !db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const records = await db
      .collection('database_records')
      .find({ databaseId: id })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({ records });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { db, isConnected } = await connectToDatabase();
    if (!isConnected || !db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const body = await request.json();
    const { properties = {} } = body || {};

    const recordId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newRecord = {
      id: recordId,
      databaseId: id,
      properties,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('database_records').insertOne(newRecord);

    return NextResponse.json({ record: newRecord });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
