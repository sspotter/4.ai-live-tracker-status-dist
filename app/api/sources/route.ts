import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const sources = db.prepare(`
      SELECT s.*, c.name as category_name, c.color as category_color 
      FROM sources s 
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY s.created_at DESC
    `).all();
    
    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    
    return NextResponse.json({ sources, categories });
  } catch (error) {
    console.error("Failed to fetch sources:", error);
    return NextResponse.json({ error: "Failed to fetch sources" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, name, url, category_id } = body;
    
    if (!type || !name) {
      return NextResponse.json({ error: "Type and name are required" }, { status: 400 });
    }
    
    const id = `src_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const insert = db.prepare('INSERT INTO sources (id, type, name, url, category_id) VALUES (?, ?, ?, ?, ?)');
    insert.run(id, type, name, url || null, category_id || null);
    
    const newSource = db.prepare(`
      SELECT s.*, c.name as category_name, c.color as category_color 
      FROM sources s 
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.id = ?
    `).get(id);
    
    return NextResponse.json({ source: newSource });
  } catch (error) {
    console.error("Failed to create source:", error);
    return NextResponse.json({ error: "Failed to create source" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, url, category_id, is_active } = body;
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    
    const update = db.prepare(`
      UPDATE sources 
      SET name = COALESCE(?, name), 
          url = COALESCE(?, url), 
          category_id = COALESCE(?, category_id),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `);
    
    update.run(name, url, category_id, is_active !== undefined ? (is_active ? 1 : 0) : null, id);
    
    const updatedSource = db.prepare(`
      SELECT s.*, c.name as category_name, c.color as category_color 
      FROM sources s 
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.id = ?
    `).get(id);
    
    return NextResponse.json({ source: updatedSource });
  } catch (error) {
    console.error("Failed to update source:", error);
    return NextResponse.json({ error: "Failed to update source" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    
    db.prepare('DELETE FROM sources WHERE id = ?').run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete source:", error);
    return NextResponse.json({ error: "Failed to delete source" }, { status: 500 });
  }
}
