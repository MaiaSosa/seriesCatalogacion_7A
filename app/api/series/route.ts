import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrisma();
    const series = await prisma.serie.findMany({
      orderBy: { id: "asc" },
      include: {
        plataforma: {
          select: { id: true, nombre: true }
        }
      }
    });

    return NextResponse.json({ ok: true, data: series });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "No se pudieron consultar las series." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrisma();
    const body = await request.json();
    const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : "";
    const plataformaId = Number(body?.plataformaId);

    if (!nombre) {
      return NextResponse.json({ ok: false, message: "El nombre de la serie es obligatorio." }, { status: 400 });
    }

    if (!Number.isInteger(plataformaId) || plataformaId <= 0) {
      return NextResponse.json({ ok: false, message: "Debes seleccionar una plataforma válida." }, { status: 400 });
    }

    const plataforma = await prisma.plataforma.findUnique({ where: { id: plataformaId } });
    if (!plataforma) {
      return NextResponse.json({ ok: false, message: "La plataforma seleccionada no existe." }, { status: 404 });
    }

    const serie = await prisma.serie.create({
      data: {
        nombre,
        plataformaId
      },
      include: {
        plataforma: {
          select: { id: true, nombre: true }
        }
      }
    });

    return NextResponse.json({ ok: true, data: serie }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "No se pudo crear la serie." }, { status: 500 });
  }
}
