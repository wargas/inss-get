import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddColumnsAdds extends BaseSchema {
  protected tableName = 'tarefas'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.json('despachos')
      table.json('adicionais')
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumns('despachos', 'adicionais');
    })
  }
}
