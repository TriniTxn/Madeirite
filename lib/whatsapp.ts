export async function enviarMensagemWhatsApp(mensagem: string) {
  const url = `${process.env.EVOLUTION_API_URL}/message/sendText/madeirite`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": process.env.EVOLUTION_API_KEY!,
    },
    body: JSON.stringify({
      number: process.env.WHATSAPP_NUMERO_DESTINO,
      textMessage: { text: mensagem },
    }),
  })

  return response.ok
}