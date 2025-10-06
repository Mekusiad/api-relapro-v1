import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const saveMeasurement = async (
  loggedInUserMatricula,
  ordemId,
  componentId,
  measurementData
) => {
  try {
    const componenteExiste = await prisma.componente.findUnique({
      where: { id: componentId },
    });

    if (!componenteExiste) {
      return res
        .status(404)
        .json({ status: false, message: "Componente não encontrado." });
    }

    const ordemExiste = await prisma.ordem.findUnique({
      where: { id: ordemId },
      include: {
        componentes: {
          select: { id: true },
        },
      },
    });

    if (!ordemExiste) {
      return res
        .status(404)
        .json({ status: false, message: "Ordem não encontrada." });
    }

    if (!ordemExiste.componentes.some((c) => c.id === componentId)) {
      return res
        .status(404)
        .json({ status: false, message: "Componente não pertence à ordem." });
    }

    const measurement = await prisma.ensaio.create({
      data: {
        ...measurementData,
        componente: { connect: { id: componentId } },
        ordem: { connect: { id: ordemId } },
      },
    });

    return res.status(201).json({
      status: true,
      message: "Ensaio salvo com sucesso.",
      data: measurement,
    });
  } catch (error) {
    console.error("Error saving measurement:", error);
    throw error;
  }
};
