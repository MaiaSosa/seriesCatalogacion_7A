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

    const valoracion = await prisma.valoracion.findUnique({
      where: { id: parsedId },
      include: {
        plataforma: { select: { id: true, nombre: true } },
        serie: { select: { id: true, nombre: true, plataformaId: true } }
      }
    });

    if (!valoracion) {
      return NextResponse.json({ ok: false, message: "Valoración no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: valoracion });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Error al consultar la valoración." }, { status: 500 });
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
    const plataformaId = Number(body?.plataformaId);
    const serieId = Number(body?.serieId);
    const puntaje = Number(body?.puntaje);
    const observacion = typeof body?.observacion === "string" ? body.observacion.trim() : "";

    if (!Number.isInteger(plataformaId) || plataformaId <= 0) {
      return NextResponse.json({ ok: false, message: "Debes seleccionar una plataforma válida." }, { status: 400 });
    }

    if (!Number.isInteger(serieId) || serieId <= 0) {
      return NextResponse.json({ ok: false, message: "Debes seleccionar una serie válida." }, { status: 400 });
    }

    if (!Number.isInteger(puntaje) || puntaje < 1 || puntaje > 10) {
      return NextResponse.json({ ok: false, message: "El puntaje debe estar entre 1 y 10." }, { status: 400 });
    }

    const plataforma = await prisma.plataforma.findUnique({ where: { id: plataformaId } });
    if (!plataforma) {
      return NextResponse.json({ ok: false, message: "La plataforma seleccionada no existe." }, { status: 404 });
    }

    const serie = await prisma.serie.findUnique({
      where: { id: serieId },
      include: { plataforma: true }
    });

    if (!serie) {
      return NextResponse.json({ ok: false, message: "La serie seleccionada no existe." }, { status: 404 });
    }

    if (serie.plataformaId !== plataformaId) {
      return NextResponse.json(
        { ok: false, message: "La plataforma seleccionada no coincide con la plataforma asociada a la serie." },
        { status: 400 }
      );
    }

    const valoracion = await prisma.valoracion.update({
      where: { id: parsedId },
      data: {
        plataformaId,
        serieId,
        puntaje,
        observacion
      },
      include: {
        plataforma: { select: { id: true, nombre: true } },
        serie: { select: { id: true, nombre: true, plataformaId: true } }
      }
    });

    return NextResponse.json({ ok: true, data: valoracion });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ ok: false, message: "Valoración no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "No se pudo actualizar la valoración." }, { status: 500 });
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

    await prisma.valoracion.delete({ where: { id: parsedId } });
    return NextResponse.json({ ok: true, message: "Valoración eliminada." });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ ok: false, message: "Valoración no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "No se pudo eliminar la valoración." }, { status: 500 });
  }
}
