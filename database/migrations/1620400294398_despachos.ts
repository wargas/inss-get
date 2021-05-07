import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Despachos extends BaseSchema {
  protected tableName = 'despachos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('despacho_id')
      table.string('especie')
      table.string('protocolo')
      table.string('title')
      table.string('siape')
      table.date('data')
      table.timestamps(true, true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
