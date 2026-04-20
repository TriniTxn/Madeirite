"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { salvarImagemProjeto } from "@/app/projetos/[id]/actions"
import { Upload, X, ImageIcon, ZoomIn } from "lucide-react"
import Image from "next/image"

type Props = {
  projetoId: number
  imagemAtual: string | null
}

export function ImagemProjeto({ projetoId, imagemAtual }: Props) {
  const [imagem, setImagem] = useState<string | null>(imagemAtual)
  const [uploading, setUploading] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split(".").pop()
      const path = `projeto-${projetoId}-${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from("projetos-imagens")
        .upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage
        .from("projetos-imagens")
        .getPublicUrl(path)
      const url = data.publicUrl
      setImagem(url)
      const formData = new FormData()
      formData.append("projetoId", String(projetoId))
      formData.append("imagemUrl", url)
      await salvarImagemProjeto(formData)
    } catch (err) {
      console.error("Erro no upload:", err)
      alert("Erro ao fazer upload da imagem.")
    } finally {
      setUploading(false)
    }
  }

  async function handleRemover() {
    setImagem(null)
    const formData = new FormData()
    formData.append("projetoId", String(projetoId))
    formData.append("imagemUrl", "")
    await salvarImagemProjeto(formData)
  }

  return (
    <>
      {/* Modal de visualização */}
      {modalAberto && imagem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setModalAberto(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white transition-colors"
            onClick={() => setModalAberto(false)}
          >
            <X size={18} />
          </button>
          <img
            src={imagem}
            alt="Foto do projeto"
            className="max-w-full max-h-full object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="bg-zinc-900/20 border border-zinc-800 rounded-3xl p-6">
        <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <ImageIcon size={14} /> Foto do Projeto
        </h3>

        {imagem ? (
          <div className="relative group">
            <div className="relative w-full h-48 rounded-2xl overflow-hidden">
              <Image
                src={imagem}
                alt="Foto do projeto"
                fill
                className="object-cover"
              />
            </div>

            {/* Botões no hover */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button
                onClick={() => setModalAberto(true)}
                className="p-2 bg-black/70 hover:bg-white/20 text-white rounded-xl transition-all"
                title="Visualizar"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={handleRemover}
                className="p-2 bg-black/70 hover:bg-red-500/80 text-white rounded-xl transition-all"
                title="Remover"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-48 border border-dashed border-zinc-700 rounded-2xl cursor-pointer hover:border-zinc-500 hover:bg-zinc-900/30 transition-all">
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
                <span className="text-xs text-zinc-500">Enviando...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={20} className="text-zinc-600" />
                <span className="text-xs text-zinc-500">Clique para adicionar foto</span>
                <span className="text-[10px] text-zinc-700">JPG, PNG até 5MB</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>
    </>
  )
}