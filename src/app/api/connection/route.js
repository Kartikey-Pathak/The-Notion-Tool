import { NextResponse } from 'next/server';
import {
  getSavedConfig,
  saveSessionConfig,
  clearSessionConfig,
  testConnection,
  connectToDatabase,
  initializeWorkspace,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS
} from '@/lib/mongodb';

export async function GET() {
  try {
    const config = await getSavedConfig();
    if (!config) {
      return NextResponse.json({
        isConnected: false,
        message: 'No MongoDB connection configured.'
      });
    }

    // Light ping using session config
    const { db } = await connectToDatabase(config);
    if (!db) {
      return NextResponse.json({
        isConnected: false,
        message: 'Could not connect with saved session.'
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
      source: 'session'
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

    // 2. Connect and initialize collections & default workspace
    const { db } = await connectToDatabase({ uri: uri.trim(), dbName: cleanDbName });
    await initializeWorkspace(db);

    // 3. Encrypt and store configuration in session cookie
    const token = await saveSessionConfig(uri, cleanDbName);

    const response = NextResponse.json({
      success: true,
      host: testResult.host,
      dbName: cleanDbName
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Failed to connect to MongoDB.' },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  try {
    await clearSessionConfig();

    const response = NextResponse.json({
      success: true,
      message: 'Disconnected from MongoDB database.'
    });

    response.cookies.set(SESSION_COOKIE_NAME, '', {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: 0
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Failed to disconnect.' },
      { status: 500 }
    );
  }
}
