import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId)) {
      return NextResponse.json({ ok: false, message: "ID inválido." }, { status: 400 });
    }

    const plataforma = await prisma.plataforma.findUnique({ where: { id: parsedId } });

    if (!plataforma) {
      return NextResponse.json({ ok: false, message: "Plataforma no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: plataforma });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Error al consultar la plataforma." }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId)) {
      return NextResponse.json({ ok: false, message: "ID inválido." }, { status: 400 });
    }

    const body = await request.json();
    const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : "";

    if (!nombre) {
      return NextResponse.json({ ok: false, message: "El nombre es obligatorio." }, { status: 400 });
    }

    const plataforma = await prisma.plataforma.update({
      where: { id: parsedId },
      data: { nombre }
    });

    return NextResponse.json({ ok: true, data: plataforma });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ ok: false, message: "Plataforma no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ ok: false, message: "No se pudo actualizar la plataforma." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId)) {
      return NextResponse.json({ ok: false, message: "ID inválido." }, { status: 400 });
    }

    await prisma.plataforma.delete({ where: { id: parsedId } });
    return NextResponse.json({ ok: true, message: "Plataforma eliminada." });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ ok: false, message: "Plataforma no encontrada." }, { status: 404 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json(
        { ok: false, message: "No se puede eliminar la plataforma porque está asociada a series o valoraciones." },
        { status: 409 }
      );
    }

    return NextResponse.json({ ok: false, message: "No se pudo eliminar la plataforma." }, { status: 500 });
  }
}
