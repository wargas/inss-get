import { Channel, connect, Connection, Message } from "amqplib";

class Rabbit {
  public connection: Connection
  public channel: Channel

  constructor() {
  }

  async init() {

    if (!this.connection) {
      this.connection = await connect({
        hostname: process.env.RABBIT_HOST,
        username: process.env.RABBIT_USER,
        password: process.env.RABBIT_PASS,
        vhost: process.env.RABBIT_VHOST || '/'
      })
    }
    if(!this.channel) {
      this.channel = await this.connection.createChannel();
    }
    return this
  }

  async addListener(queue: string, action: (msg: Message, channel: Channel) => void) {
    this.channel.consume(queue, (msg) => action(msg as Message, this.channel))
  }

  async sendToQueue(queue: string, body: string) {
    this.channel.sendToQueue(queue, Buffer.from(body))
  }

  async publish(exchange: string, routinKey: string, body: string) {
    this.channel.publish(exchange, routinKey, Buffer.from(body))
  }

}

export default new Rabbit();
