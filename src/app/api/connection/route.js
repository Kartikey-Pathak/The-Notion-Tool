import { NextResponse } from 'next/server';
import {
  getSavedConfig,
  saveConfig,
  removeConfig,
  testConnection,
  connectToDatabase,
  initializeWorkspace
} from '@/lib/mongodb';

export async function GET() {
  try {
    const config = getSavedConfig();
    if (!config) {
      return NextResponse.json({
        isConnected: false,
        message: 'No MongoDB connection configured.'
      });
    }

    // Attempt a light ping
    const { db } = await connectToDatabase();
    if (!db) {
      return NextResponse.json({
        isConnected: false,
        message: 'Could not connect with saved configuration.'
      });
    }

    await db.command({ ping: 1 });

    let host = 'Connected Deployment';
    try {
      const parsed = new URL(config.uri.replace(/^mongodb(\+srv)?:\/\//, 'http://'));
      host = parsed.host || 'MongoDB Server';
    } catch (e) {
      // ignore
    }

    return NextResponse.json({
      isConnected: true,
      dbName: config.dbName,
      host,
      source: config.source || 'file'
    });
  } catch (err) {
    return NextResponse.json({
      isConnected: false,
      error: err.message || 'Connection check failed'
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { uri, dbName } = body || {};

    if (!uri || typeof uri !== 'string' || !uri.trim()) {
      return NextResponse.json(
        { error: 'MongoDB connection URI is required.' },
        { status: 400 }
      );
    }

    // 1. Test the connection first
    const cleanDbName = (dbName && dbName.trim()) ? dbName.trim() : 'notion_workspace';
    const testResult = await testConnection(uri, cleanDbName);

    // 2. If valid, save config server-side
    saveConfig(uri, cleanDbName);

    // 3. Connect and initialize collections & default workspace
    const { db } = await connectToDatabase();
    await initializeWorkspace(db);

    return NextResponse.json({
      success: true,
      host: testResult.host,
      dbName: cleanDbName
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Failed to connect to MongoDB.' },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  try {
    removeConfig();
    return NextResponse.json({
      success: true,
      message: 'Disconnected from MongoDB database.'
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Failed to disconnect.' },
      { status: 500 }
    );
  }
}
