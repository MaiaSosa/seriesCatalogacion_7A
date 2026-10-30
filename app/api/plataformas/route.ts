import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrisma();
    const plataformas = await prisma.plataforma.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json({ ok: true, data: plataformas });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "No se pudieron consultar las plataformas." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrisma();
    const body = await request.json();
    const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : "";

    if (!nombre) {
      return NextResponse.json(
        { ok: false, message: "El nombre de la plataforma es obligatorio." },
        { status: 400 }
      );
    }

    const plataforma = await prisma.plataforma.create({
      data: { nombre }
    });

    return NextResponse.json({ ok: true, data: plataforma }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "No se pudo crear la plataforma." },
      { status: 500 }
    );
  }
}
