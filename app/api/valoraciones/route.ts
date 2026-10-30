import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const valoraciones = await prisma.valoracion.findMany({
      orderBy: { id: "asc" },
      include: {
        plataforma: {
          select: { id: true, nombre: true }
        },
        serie: {
          select: { id: true, nombre: true, plataformaId: true }
        }
      }
    });

    return NextResponse.json({ ok: true, data: valoraciones });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "No se pudieron consultar las valoraciones." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    const valoracion = await prisma.valoracion.create({
      data: {
        plataformaId,
        serieId,
        puntaje,
        observacion
      },
      include: {
        plataforma: {
          select: { id: true, nombre: true }
        },
        serie: {
          select: { id: true, nombre: true, plataformaId: true }
        }
      }
    });

    return NextResponse.json({ ok: true, data: valoracion }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "No se pudo crear la valoración." }, { status: 500 });
  }
}
