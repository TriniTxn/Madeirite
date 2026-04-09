"use client"

import { useState, useTransition } from "react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CheckCircle2, GripVertical, X } from "lucide-react"
import { toggleItemStatus, reordenarItens, removerItem } from "@/app/projetos/[id]/actions"
import { AdicionarItem } from "@/components/adicionar-item"

type Item = {
    id: number
    titulo: string
    feito: boolean
    ordem: number
}

type Props = {
    itens: Item[]
    projetoId: number
}

function ItemSortavel({
    item,
    projetoId,
    onToggle,
    onRemover,
    temporario,
}: {
    item: Item
    projetoId: number
    onToggle: (id: number) => void
    onRemover: (id: number) => void
    temporario: boolean
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id, disabled: temporario })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    }

    const [isPending, startTransition] = useTransition()

    function handleToggle() {
        onToggle(item.id)
        startTransition(async () => {
            const formData = new FormData()
            formData.append("itemId", String(item.id))
            formData.append("projetoId", String(projetoId))
            await toggleItemStatus(formData)
        })
    }

    function handleRemover() {
        onRemover(item.id)
        startTransition(async () => {
            const formData = new FormData()
            formData.append("itemId", String(item.id))
            formData.append("projetoId", String(projetoId))
            await removerItem(formData)
        })
    }

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 group/row">
            <button
                {...attributes}
                {...listeners}
                className="text-zinc-700 hover:text-zinc-400 transition-colors cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover/row:opacity-100"
            >
                <GripVertical size={14} />
            </button>

            <button
                onClick={handleToggle}
                disabled={isPending}
                className={`flex-1 flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group text-left ${item.feito
                        ? "bg-zinc-950/40 border-zinc-900 opacity-50"
                        : "bg-zinc-900/20 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/40"
                    }`}
            >
                <div className={`p-1 rounded-full border flex-shrink-0 ${item.feito
                        ? "bg-emerald-500/20 border-emerald-500/50"
                        : "border-zinc-700 group-hover:border-zinc-500"
                    }`}>
                    {item.feito
                        ? <CheckCircle2 className="text-emerald-500" size={18} />
                        : <div className="w-[18px] h-[18px]" />
                    }
                </div>
                <span className={`text-sm tracking-tight ${item.feito
                        ? "text-zinc-600 line-through"
                        : "text-zinc-200 font-medium"
                    }`}>
                    {item.titulo}
                </span>
            </button>

            <button
                onClick={handleRemover}
                disabled={isPending}
                className="text-zinc-700 hover:text-red-400 transition-colors p-1 opacity-0 group-hover/row:opacity-100"
            >
                <X size={14} />
            </button>
        </div>
    )
}

export function ChecklistDraggable({ itens, projetoId }: Props) {
    const [items, setItems] = useState(itens)
    const [, startTransition] = useTransition()

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    function handleToggle(id: number) {
        setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, feito: !i.feito } : i))
        )
    }

    function handleRemover(id: number) {
        setItems((prev) => prev.filter((i) => i.id !== id))
    }

    function handleAdicionado(item: Item) {
        setItems((prev) => [...prev, item])
    }

    function handleIdRealizado(idTemp: number, idReal: number) {
    setItems((prev) =>
        prev.map((i) => (i.id === idTemp ? { ...i, id: idReal } : i))
        )
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        const novaOrdem = arrayMove(items, oldIndex, newIndex)

        setItems(novaOrdem)

        startTransition(async () => {
            const formData = new FormData()
            formData.append("projetoId", String(projetoId))
            formData.append("ordem", JSON.stringify(novaOrdem.map((i) => i.id)))
            await reordenarItens(formData)
        })
    }

    return (
        <div className="space-y-4">
            <AdicionarItem 
                projetoId={projetoId} 
                onAdicionado={handleAdicionado}
                onIdRealizado={handleIdRealizado}
             />

            {items.length === 0 ? (
                <p className="text-zinc-700 text-xs uppercase tracking-widest text-center py-8 border border-dashed border-zinc-800 rounded-2xl">
                    Nenhuma task adicionada
                </p>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={items.map((i) => i.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="grid gap-3">
                            {items.map((item) => (
                                <ItemSortavel
                                    key={item.id}
                                    item={item}
                                    projetoId={projetoId}
                                    onToggle={handleToggle}
                                    onRemover={handleRemover}
                                    temporario={item.id >= 1000000000000}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    )
}