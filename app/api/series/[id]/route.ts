import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const prisma = getPrisma();
    const { id } = await params;
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId)) {
      return NextResponse.json({ ok: false, message: "ID inválido." }, { status: 400 });
    }

    const serie = await prisma.serie.findUnique({
      where: { id: parsedId },
      include: {
        plataforma: {
          select: { id: true, nombre: true }
        }
      }
    });

    if (!serie) {
      return NextResponse.json({ ok: false, message: "Serie no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: serie });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Error al consultar la serie." }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const prisma = getPrisma();
    const { id } = await params;
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId)) {
      return NextResponse.json({ ok: false, message: "ID inválido." }, { status: 400 });
    }

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

    const serie = await prisma.serie.update({
      where: { id: parsedId },
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

    return NextResponse.json({ ok: true, data: serie });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ ok: false, message: "Serie no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "No se pudo actualizar la serie." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const prisma = getPrisma();
    const { id } = await params;
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId)) {
      return NextResponse.json({ ok: false, message: "ID inválido." }, { status: 400 });
    }

    await prisma.serie.delete({ where: { id: parsedId } });
    return NextResponse.json({ ok: true, message: "Serie eliminada." });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ ok: false, message: "Serie no encontrada." }, { status: 404 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json(
        { ok: false, message: "No se puede eliminar la serie porque está asociada a valoraciones." },
        { status: 409 }
      );
    }

    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "No se pudo eliminar la serie." }, { status: 500 });
  }
}
