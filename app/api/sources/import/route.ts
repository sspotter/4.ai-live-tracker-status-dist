import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sources } = body;
    
    if (!Array.isArray(sources)) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }
    
    const insert = db.prepare('INSERT OR IGNORE INTO sources (id, type, name, url, category_id, is_active) VALUES (?, ?, ?, ?, ?, ?)');
    
    db.transaction(() => {
      for (const s of sources) {
        const id = s.id || `src_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        insert.run(id, s.type, s.name, s.url || null, s.category_id || null, s.is_active !== undefined ? s.is_active : 1);
      }
    })();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to import sources:", error);
    return NextResponse.json({ error: "Failed to import sources" }, { status: 500 });
  }
}
