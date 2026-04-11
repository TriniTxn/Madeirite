export function formatarData(data: Date | string): string {
    const date = new Date(data)
    const dia = String(date.getUTCDate()).padStart(2, "0") 
    const mes = String(date.getUTCMonth() + 1).padStart(2, "0")
    const ano = date.getUTCFullYear()
    return `${dia}/${mes}/${ano}`
}