import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { Channel, connect, Message } from 'amqplib'
import { DateTime } from 'luxon';

export default class AppProvider {

  public channel: Channel

  constructor(protected app: ApplicationContract) {
    this.getConnection()
  }

  async getConnection() {
    const connection = await connect("amqp://wargas:wrgs2703@deltex.work:5672");

    this.channel = await connection.createChannel();

    this.channel.consume('processo', async (msg) => {
      try {
        const processo = JSON.parse(msg?.content.toString() || "");

        await this.insertDespachos(processo)

        this.channel.ack(msg as Message);
      } catch (error) {
        console.log(error)
      }
    })
  }

  async insertDespachos(processo: any) {

    const Database = (await import("@ioc:Adonis/Lucid/Database")).default;

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
  }

  public register() {
    // Register your own bindings
  }

  public async boot() {
    // IoC container is ready
  }

  public async ready() {

  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
