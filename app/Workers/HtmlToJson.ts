import cheerio from 'cheerio';
import { DateTime } from 'luxon';

export default async function (html: string) {

  const $ = cheerio.load(html)

  const protocolo = $('#tarefaHeader').text().trim().replace(/\D/g, "")
  const basicos = dadosBasicos($('.panel-dados-basicos').html())
  const adicionais = camposAdicionais($('#collapse-campos-adicionais').html())
  const segurado = dadosSegurado($('#collapse-segurado').html())
  const listDespachos = despachos($('#collapse-comentario').html())


  return {
    protocolo,
    ...segurado,
    ...basicos,
    ...listDespachos,
    adicionais
  }
}

export function dadosBasicos(html) {

  const $ = cheerio.load(html);

  const [left, right] = $('.panel-heading>.row>.col-sm-12')

  const especie = removeAcentos($($(left).find('.col-sm-12 p')[0]).text().trim().toUpperCase())
  const aps = $($(left).find('.col-sm-12 p')[2]).text().trim().replace(/^(\d{1,}) - (.*)$/, "$1")

  const rightMap = new Map()
  rightMap.set('Status', 'status')
  rightMap.set('Última Atualização', 'atualizacao')
  rightMap.set('Data de Entrada do Requerimento', 'der')
  rightMap.set('Microrregião', 'mr')

  const detalhes = {
    status: '',
    atualizacao: '',
    der: '',
    mr: '',
  }

  Array.from($(right).find('.col-sm-5')).forEach(item => {
    const small = $($(item).find('small')).text().trim()
    const value = $($(item).find('p')).text().trim()

    if (rightMap.has(small)) {
      detalhes[rightMap.get(small)] = value
    }

  })

  detalhes.status = removeAcentos(detalhes.status.toUpperCase())
  detalhes.der = toSQL(detalhes.der)
  detalhes.atualizacao = toSQL(detalhes.atualizacao)

  return { especie, aps, ...detalhes }
}

export function camposAdicionais(html) {
  const $ = cheerio.load(html);

  const items: any[] = []

  Array.from($('.col-md-4')).forEach(item => {
    const label = removeAcentos($($(item).find('label')).text().trim().toUpperCase())
    const value = removeAcentos($($(item).find('.form-group>div')).text().trim().toUpperCase())
    items.push({ label, value })
  })

  return items
}

export function dadosSegurado(html) {
  const $ = cheerio.load(html);

  const tds = $('tbody tr td')

  return {
    cpf: $(tds[0]).text().replace(/\D/g, ""),
    nomeSegurado: $(tds[1]).text(),
    nascimento: toSQL(`${$(tds[2]).text()} 00:00`),
    nomeMae: $(tds[3]).text(),
  }

}

export function despachos(html) {

  const $ = cheerio.load(html);

  const items: any[] = [];

  let primeiraExigencia = ""
  let dataConclusao = ""
  let siapeConclusao = ""
  let siapeExigencia = ""


  Array.from($('.panel-body.well')).forEach(item => {
    const [first, ...rest] = $(item).find('.small')

    const texto = $(rest).text().replace(/\n/g, "").replace(/\t/g, "")

    const _data = texto.replace(/^(.*)Enviado em:(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2})(.*)$/, "$2")

    const _siape = texto.replace(/(.*)(SIAPE|CPF) - (.*)\)\|(.*)/, "$3")

    const _title = $(item).find('h8 div').last().text().trim()

    const dados = {
      id: $(first).text().replace(/\D/g, ""),
      data: toSQL(_data),
      siape: _siape.length > 7 ? '' : _siape,
      cpf: _siape.length === 14 ? _siape.replace(/\D/g, "") : '',
      title: _title,
      exigenca: _title.includes('mudar status para exigência.'),
      conclusao: _title.includes('inserido ao concluir a tarefa.')
    }

    if (dados.exigenca) {
      if (primeiraExigencia === "") {
        primeiraExigencia = dados.data
        siapeExigencia = dados.siape
      }
    }

    if (dados.conclusao) {
      if (dataConclusao === "") {
        siapeConclusao = dados.siape
        dataConclusao = dados.data
      }
    }

    items.push(dados)
  })

  return {
    siapeExigencia,
    siapeConclusao,
    primeiraExigencia,
    dataConclusao,
    despachos: items
  }
}

function removeAcentos(str) {
  return str.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function toSQL(str) {
  return DateTime.fromFormat(str, "dd/MM/yyyy hh:mm").toFormat("yyyy-MM-dd hh:mm:ss")
}
