import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Tarefas extends BaseSchema {
  protected tableName = 'tarefas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('protocolo')
      table.string('cpf')
      table.string('nomeSegurado')
      table.string('nascimento')
      table.string('nomeMae')
      table.string('especie')
      table.string('aps')
      table.string('status')
      table.string('atualizacao')
      table.string('der')
      table.string('mr')
      table.string('siapeExigencia')
      table.string('siapeConclusao')
      table.string('primeiraExigencia')
      table.string('dataConclusao')
      table.timestamps(true, true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
