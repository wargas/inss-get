// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Database from "@ioc:Adonis/Lucid/Database"
import { DateTime } from "luxon"
import HtmlToJson from "App/Workers/HtmlToJson";
import Rabbit from "App/Services/Rabbit";

export default class DespachosController {

  async index({ view }) {
    const start = DateTime.local().startOf('month').toSQLDate()
    const end = DateTime.local().toSQLDate()


    const despachos = await Database.from('despachos')
      .where('siape', '2997532')
      .where('title', 'regexp', 'concluir|exigencia')
      .whereBetween('data', [start, end])

    const exigencias_all = await Database.from('despachos')
      .select('protocolo')
      .min('data', 'primeira')
      .where('title', 'like', '%exigencia%')
      .groupBy('protocolo')

    const exigencias_all_map = new Map()

    exigencias_all.forEach(item => {
      exigencias_all_map.set(item.protocolo, DateTime.fromJSDate(item.primeira));
    })

    const pontos = despachos.map(despacho => {
      let tipo = ""
      if (despacho.title.includes('concluir')) {
        tipo = 'conclusao'
      } else if (despacho.title.includes('exigencia')) {
        const primeira: DateTime = exigencias_all_map.get(despacho.protocolo);
        const current = DateTime.fromJSDate(despacho.data);

        const diff = primeira.diff(current, 'day').days

        if (diff >= 0) {
          tipo = 'exigencia'
        }

      }

      return { ...despacho, tipo }
    }).map(despacho => {
      let pontos = 0
      if (despacho.tipo === 'conclusao') {
        if (despacho.especie === 'AUXILIO-DOENCA COM DOCUMENTO MEDICO') {
          pontos = 0.6
        }
        if (despacho.especie === 'SALARIO-MATERNIDADE RURAL') {
          pontos = 0.75
        }
      }

      if (despacho.tipo === 'exigencia') {
        pontos = 0.2
      }

      return { ...despacho, pontos }
    })

    const total = pontos.reduce((acc, d) => {
      acc.total = acc.total + d.pontos

      if (d.tipo === 'conclusao' || d.tipo === 'exigencia') {
        acc[d.tipo] = acc[d.tipo] + d.pontos

        acc.processos = acc.processos + 1
      }

      return acc
    }, {
      total: 0,
      conclusao: 0,
      exigencia: 0,
      processos: 0
    })


    return view.render("despachos", { total })
  }

  async pontos({view}) {

    const especies = await Database.from('despachos')
      .select('especie')
      .groupBy('especie')

    return view.render("pontos", {especies: especies.map(item => item.especie)})
  }

  async store({request}) {
    const json = await HtmlToJson(request.raw())

    await Rabbit.publish('inss', 'salvar-tarefa', JSON.stringify(json))

    return { msg: 'ok'}
  }

}
