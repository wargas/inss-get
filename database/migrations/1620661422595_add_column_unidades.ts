import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddColumnUnidades extends BaseSchema {
  protected tableName = 'tarefas'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.string('unidade').nullable()
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('unidade')
    })
  }
}
