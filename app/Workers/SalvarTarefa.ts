import { Channel, Message } from "amqplib";

export default async function name(msg: Message, channel: Channel) {
  const Database = (await import("@ioc:Adonis/Lucid/Database")).default;
  const tarefa = JSON.parse(msg?.content.toString() || "");

  const existe = await (await Database.from('tarefas').where('protocolo', tarefa.protocolo)).length
  try {

    if (existe > 0) {
      const { despachos, adicionais, protocolo, ...data } = tarefa

      await Database.from('tarefas')
        .where('protocolo', protocolo)
        .update({
          ...data,
          despachos: JSON.stringify(despachos),
          adicionais: JSON.stringify(adicionais)
        })

    } else {
      const { despachos, adicionais, ...data } = tarefa
      await Database.table('tarefas').insert({
        ...data,
        despachos: JSON.stringify(despachos),
        adicionais: JSON.stringify(adicionais)
      })
    }

    console.log(`receive msg ${tarefa.protocolo}`)

    channel.ack(msg)
  } catch (error) {
    channel.ack(msg)
  }

}
