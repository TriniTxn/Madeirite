import { prisma } from "@/lib/db"
import { CalendarioClient } from "@/components/calendario-client"

export default async function CalendarioPage() {
  const projetos = await prisma.projeto.findMany({
    where: {
      status: { not: "Arquivado" }
    },
    select: {
      id: true,
      nome: true,
      dataEntrega: true,
      status: true,
    },
    orderBy: { dataEntrega: "asc" }
  })

  return <CalendarioClient projetos={projetos} />
}