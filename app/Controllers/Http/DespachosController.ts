import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Database from "@ioc:Adonis/Lucid/Database"
import { DateTime, Interval } from "luxon"
import HtmlToJson from "App/Workers/HtmlToJson";
import Rabbit from "App/Services/Rabbit";
import Meta from 'App/Services/Meta';
import feriados from '../../../resources/data/feriados.json';

export default class DespachosController {


  async index({ view, request, session }: HttpContextContract) {

    const { matricula } = session.get('user')

    const { start: qsStart, end: qsEnd } = request.qs();

    let start = DateTime.local().startOf('month')
    let end = DateTime.local().endOf('month')

    if (qsStart) {
      start = DateTime.fromFormat(qsStart, 'dd/MM/yyyy')
    }

    if (qsEnd) {
      end = DateTime.fromFormat(qsEnd, 'dd/MM/yyyy')
    }

    const pontos = await Database.from('pontos').select('especie', 'conclusao', 'exigencia')

    const query = await Database.rawQuery(`
      SELECT *
        FROM tarefas
        WHERE
          (siapeConclusao = :matricula OR  siapeExigencia = :matricula)
          AND (primeiraExigencia BETWEEN :start AND :end OR dataConclusao BETWEEN :start AND :end )
          AND unidade != :exclude`,
      {
        matricula,
        start: start.minus({day: 1}).toSQLDate(),
        end: end.plus({day: 1}).toSQLDate(),
        exclude: '015001'
      })

    const tarefas = query[0].map(item => {
      item.pontos = pontos.find(ponto => ponto.especie == item.especie)
      return item;
    }).map(item => {

      item.exigencia = false;
      item.conclusao = false;

      const dtConclusao = DateTime.fromFormat(item.dataConclusao, 'yy-M-d h:m:s')
      const dtExigencia = DateTime.fromFormat(item.primeiraExigencia, 'yy-M-d h:m:s')

      const interval = Interval.fromDateTimes(start.set({hour: 0, minute: 0, second: 1}), end.set({hour: 23, minute: 59, second: 59}));

      if (item.siapeConclusao === matricula && interval.contains(dtConclusao)) {
        item.conclusao = true
      }

      if (item.siapeExigencia === matricula && interval.contains(dtExigencia)) {
        item.exigencia = true
      }

      return item;
    }).map(item => {

      item.pontosExigencia = item.exigencia ? item.pontos.exigencia : 0
      item.pontosConclusao = item.conclusao ? item.pontos.conclusao : 0
      item.pontosTotal = item.pontosExigencia + item.pontosConclusao

      return item;
    })

    const mapTarefas = new Map<string, any>()

    tarefas.forEach(item => {
      let current = {
        concluidas: 0,
        exigencias: 0,
        pontos: 0,
        especie: item.especie
      }
      if(mapTarefas.has(item.especie)) {
        current = mapTarefas.get(item.especie)
      }


      mapTarefas.set(item.especie, {
        concluidas: current.concluidas + (item.conclusao ? 1 : 0),
        exigencias: current.exigencias + (item.exigencia ? 1 : 0),
        pontos: current.pontos + item.pontosTotal,
        especie: item.especie
      })
    });

    const especies = Array.from(mapTarefas.values())

    const total = especies.reduce((acc, item) => {

      acc.geral = acc.geral + item.pontos

      return acc
    }, {
      geral: 0,
      exigencia: 0,
      conclusao: 0
    })


    const holydays = feriados.map(item => DateTime.fromSQL(item.date))

    const meta = Meta
      .setStart(start)
      .setEnd(end)
      .setPerDay(4.48)
      .setHolydays(holydays)
      .build()

    return view.render("despachos", {
        hoje: DateTime.local(),
        meta,
        especies,
        total,
        start: start.toFormat('dd/MM/yyyy'),
        end: end.toFormat('dd/MM/yyyy')  })
  }

  async pontos({ view }) {

    const especies = await Database.from('despachos')
      .select('especie')
      .groupBy('especie')

    return view.render("pontos", { especies: especies.map(item => item.especie) })
  }

  async store({ request }: HttpContextContract) {

    const json = await HtmlToJson(request.raw() || '')

    await Rabbit.publish('inss', 'salvar-tarefa', JSON.stringify(json))

    return { msg: 'ok' }
  }

}
