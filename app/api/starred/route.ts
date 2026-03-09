import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const starred = db.prepare(`
      SELECT s.*, st.created_at as starred_at
      FROM starred_items st
      JOIN signals s ON st.signal_id = s.id
      ORDER BY st.created_at DESC
    `).all();
    
    return NextResponse.json({ starred });
  } catch (error) {
    console.error("Failed to fetch starred items:", error);
    return NextResponse.json({ error: "Failed to fetch starred items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { signal_id } = body;
    
    if (!signal_id) {
      return NextResponse.json({ error: "signal_id is required" }, { status: 400 });
    }
    
    const id = `star_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    db.prepare('INSERT OR IGNORE INTO starred_items (id, user_id, signal_id) VALUES (?, ?, ?)').run(id, 'user_1', signal_id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to star item:", error);
    return NextResponse.json({ error: "Failed to star item" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const signal_id = searchParams.get('signal_id');
    
    if (!signal_id) {
      return NextResponse.json({ error: "signal_id is required" }, { status: 400 });
    }
    
    db.prepare('DELETE FROM starred_items WHERE signal_id = ?').run(signal_id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to unstar item:", error);
    return NextResponse.json({ error: "Failed to unstar item" }, { status: 500 });
  }
}
