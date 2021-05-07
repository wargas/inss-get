/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'

Route.get('/', async ({ view }) => {
  return view.render('welcome')
})

Route.get('/despachos', async ({ view }) => {

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
})


