"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { adicionarImagemProjeto, removerImagemProjeto } from "@/app/projetos/[id]/actions"
import { Upload, X, Maximize2, Plus, Loader2, Trash2 } from "lucide-react"
import Image from "next/image"

type Imagem = {
  id: number
  url: string
  ordem: number
}

type Props = {
  projetoId: number
  imagens: Imagem[]
}

export function ImagemProjeto({ projetoId, imagens: imagensIniciais }: Props) {
  const [imagens, setImagens] = useState<Imagem[]>(imagensIniciais)
  const [uploading, setUploading] = useState(false)
  const [modalUrl, setModalUrl] = useState<string | null>(null)

  const podeAdicionar = imagens.length < 3
  const [destaque, ...miniaturas] = imagens

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !podeAdicionar) return
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
      const formData = new FormData()
      formData.append("projetoId", String(projetoId))
      formData.append("url", url)
      await adicionarImagemProjeto(formData)

      setImagens(prev => [...prev, { id: Date.now(), url, ordem: prev.length }])
    } catch (err) {
      console.error("Erro no upload:", err)
      alert("Erro ao fazer upload da imagem.")
    } finally {
      setUploading(false)
    }
  }

  async function handleRemover(imagemId: number) {
    if (!confirm("Remover esta imagem?")) return
    setImagens(prev => prev.filter(i => i.id !== imagemId))
    const formData = new FormData()
    formData.append("imagemId", String(imagemId))
    formData.append("projetoId", String(projetoId))
    await removerImagemProjeto(formData)
  }

  return (
    <>
      {/* Modal fullscreen */}
      {modalUrl && (
        <div
          className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-4 md:p-10 backdrop-blur-sm"
          onClick={() => setModalUrl(null)}
        >
          <button
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-10"
            onClick={() => setModalUrl(null)}
          >
            <X size={24} />
          </button>
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 opacity-20 blur-3xl scale-110 pointer-events-none">
              <img src={modalUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <img
              src={modalUrl}
              alt="Visualização completa"
              className="relative z-10 max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <div className="bg-[#09090b] border border-zinc-800/50 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] font-black flex items-center gap-2">
            <Maximize2 size={12} className="text-zinc-600" /> Fotos do Projeto
          </h3>
          <span className="text-[10px] font-mono text-zinc-700 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
            {imagens.length}/3
          </span>
        </div>

        <div className="space-y-2">

          {/* IMAGEM DESTAQUE — grande */}
          {destaque ? (
            <div className="relative group">
              <div
                className="relative w-full h-48 rounded-xl overflow-hidden border border-zinc-800/50 bg-zinc-950 cursor-pointer hover:border-zinc-600 transition-all"
                onClick={() => setModalUrl(destaque.url)}
              >
                <div className="absolute inset-0 opacity-20 blur-xl scale-125 pointer-events-none">
                  <Image src={destaque.url} alt="" fill className="object-cover" />
                </div>
                <Image
                  src={destaque.url}
                  alt="Destaque"
                  fill
                  className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white">
                    <Maximize2 size={16} />
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemover(destaque.id)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10 border border-white/10"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ) : (
            /* Nenhuma imagem — upload grande */
            podeAdicionar && (
              <UploadSlot
                grande
                uploading={uploading}
                onUpload={handleUpload}
              />
            )
          )}

          {/* MINIATURAS — linha com 2 slots */}
          {destaque && (
            <div className="grid grid-cols-2 gap-2">
              {miniaturas.map((img) => (
                <div key={img.id} className="relative group">
                  <div
                    className="relative w-full h-24 rounded-xl overflow-hidden border border-zinc-800/50 bg-zinc-950 cursor-pointer hover:border-zinc-600 transition-all"
                    onClick={() => setModalUrl(img.url)}
                  >
                    <div className="absolute inset-0 opacity-20 blur-xl scale-125 pointer-events-none">
                      <Image src={img.url} alt="" fill className="object-cover" />
                    </div>
                    <Image
                      src={img.url}
                      alt="Miniatura"
                      fill
                      className="object-contain p-1.5 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-lg text-white">
                        <Maximize2 size={13} />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemover(img.id)}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-500/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all z-10 border border-white/10"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}

              {/* Slot de upload miniatura — aparece se tiver menos de 3 */}
              {podeAdicionar && (
                <UploadSlot
                  grande={false}
                  uploading={uploading}
                  onUpload={handleUpload}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function UploadSlot({
  grande,
  uploading,
  onUpload,
}: {
  grande: boolean
  uploading: boolean
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <label className={`
      flex flex-col items-center justify-center border-2 border-dashed border-zinc-800
      rounded-xl cursor-pointer hover:border-zinc-600 hover:bg-zinc-900/30 transition-all group
      ${grande ? "h-48 w-full" : "h-24 w-full"}
    `}>
      {uploading ? (
        <div className="flex flex-col items-center gap-1.5">
          <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Enviando...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1.5">
          {grande ? (
            <>
              <div className="p-2.5 bg-zinc-900 rounded-lg group-hover:scale-110 transition-transform">
                <Upload size={18} className="text-zinc-500" />
              </div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Adicionar foto</span>
            </>
          ) : (
            <Plus size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          )}
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={onUpload}
        className="hidden"
        disabled={uploading}
      />
    </label>
  )
}

// Exporta o DestaqueInterativo para uso no page.tsx
export function DestaqueInterativo({ url }: { url: string }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div
        className="relative w-full h-[500px] rounded-[40px] overflow-hidden border border-zinc-800/50 bg-zinc-950 shadow-2xl group cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <Image src={url} alt="Destaque" fill className="object-cover transition-transform duration-700 group-hover:scale-105" priority />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-all bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-[10px] text-white font-bold uppercase tracking-widest border border-white/20">
            Clique para ver completo
          </span>
        </div>
        <div className="absolute bottom-8 left-8">
          <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-[9px] px-4 py-1.5 rounded-full uppercase font-black tracking-[0.2em]">
            Visualização de Referência
          </span>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-4 md:p-10 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <button className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all">
            <X size={24} />
          </button>
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 opacity-20 blur-3xl scale-110 pointer-events-none">
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
            <img
              src={url}
              alt="Visualização completa"
              className="relative z-10 max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  )
}