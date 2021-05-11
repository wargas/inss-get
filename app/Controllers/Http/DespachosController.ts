import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Database from "@ioc:Adonis/Lucid/Database"
import { DateTime } from "luxon"
import HtmlToJson from "App/Workers/HtmlToJson";
import Rabbit from "App/Services/Rabbit";

export default class DespachosController {

  async index({ view, request, session }: HttpContextContract) {

    const {matricula} = session.get('user')

    const {start: qsStart, end: qsEnd} = request.qs();

    let start = DateTime.local().startOf('month')
    let end = DateTime.local().endOf('month')

    if(qsStart) {
      start = DateTime.fromFormat(qsStart, 'dd/MM/yyyy')
    }

    if(qsEnd) {
      end = DateTime.fromFormat(qsEnd, 'dd/MM/yyyy')
    }

    const pontos = await Database.from('pontos')

    const interval: [string, string] = [
      start.set({hour: 0, minute: 0, second: 1}).toSQL(),
      end.set({hour: 23, minute: 59, second: 59}).toSQL()
    ]

    const concluidas = (await Database.from('tarefas')
      .groupBy('especie')
      .select('especie')
      .count('id', 'total')
      .where('siapeConclusao', matricula)
      .whereBetween('dataConclusao', interval))
      .map(item => {

        const ponto = pontos.find(p => p.especie === item.especie)

        const total = ponto.conclusao * item.total;

        return {...item, total, exigencias: 0, conclusoes: item.total}
      })

    const exigencias = (await Database.from('tarefas')
      .groupBy('especie')
      .select('especie')
      .count('id', 'total')
      .where('siapeExigencia', matricula)
      .whereBetween('primeiraExigencia', interval))
      .map(item => {

        const ponto = pontos.find(p => p.especie === item.especie)
        const total = ponto.exigencia * item.total;

        return {...item, total, exigencias: item.total, conclusoes: 0}
      })

    const tarefas = [...exigencias, ...concluidas]

    const totais = tarefas.reduce((acc, item) => {

      acc.conclusoes = acc.conclusoes + item.conclusoes
      acc.exigencias = acc.exigencias + item.exigencias
      acc.total = acc.total + item.total

      return acc;
    }, {
      conclusoes: 0,
      exigencias: 0,
      total: 0
    })


    return view.render("despachos", { tarefas, totais,
        start: start.toFormat('dd/MM/yyyy'),
        end: end.toFormat('dd/MM/yyyy')  })
  }

  async pontos({view}) {

    const especies = await Database.from('despachos')
      .select('especie')
      .groupBy('especie')

    return view.render("pontos", {especies: especies.map(item => item.especie)})
  }

  async store({request}: HttpContextContract) {

    const json = await HtmlToJson(request.raw() || '')

    await Rabbit.publish('inss', 'salvar-tarefa', JSON.stringify(json))

    return { msg: 'ok'}
  }

}
