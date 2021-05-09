import { Channel, Message } from "amqplib"

const InsertDespachos = async (msg: Message, channel: Channel) => {
  try {
    const Database = (await import("@ioc:Adonis/Lucid/Database")).default;
    const processo = JSON.parse(msg?.content.toString() || "");

    const cadastrados = await Database.from('despachos').where("protocolo", processo.protocolo);

    const ids = new Set(cadastrados.map(c => c.despacho_id));

    const despachos = processo.despachos.map(item => {
      return {
        despacho_id: item.despacho_id,
        data: item.data,
        title: item.title,
        siape: item.responsavel.siape || '',
        protocolo: processo.protocolo,
        especie: processo.especie
      }
    }).filter(d => !ids.has(d.despacho_id))

    if (despachos.length > 0) {
      await Database.table('despachos').multiInsert(despachos)
    }

    channel.ack(msg)
  } catch (error) {
    console.log('error')
    channel.reject(msg)
  }
}

export default InsertDespachos
