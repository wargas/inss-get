// import axios from "axios"
// import cheerio from 'cheerio'

// export default async function FazerLogin(uid, password) {
//   try {
//     const { headers } = await axios.get('https://correio.dataprev.gov.br/saipe/?action=login')

//     const [cookie] = headers['set-cookie']

//     const { data } = await await axios.post('https://correio.dataprev.gov.br/saipe/?action=login&next_action=&object=&filter=',
//       `uid=${uid}&password=${password}`,
//       {
//         headers: {
//           'Cookie': cookie
//         }
//       }
//     )

//     return extractUser(data)

//   } catch (err) {
//     return false;
//   }
// }

// function extractUser(html) {

//   const $ = cheerio.load(html)

//   const panelBody = $('.panel-body').get(1);

//   const mapKeys = new Map();

//   const auth = {
//     identificador: '',
//     email: '',
//     emailParticular: '',
//     nome: '',
//     cidade: '',
//     telefone: '',
//     cpf: '',
//     nit: '',
//     matricula: ''
//   }

//   $(panelBody).html()
//     ?.replace(/[\n|\t]/g, "")
//     ?.replace(/<br>/g, "")
//     ?.replace(/<\/strong>/g, "")
//     ?.split("<strong>")
//     ?.forEach(item => {
//       const [key, value] = item.split(": ")
//       mapKeys.set(key, value)
//     })

//   auth.identificador = mapKeys.get('Identificador de Login')
//   auth.email = mapKeys.get('Email Corporativo') || ''
//   auth.emailParticular = mapKeys.get('Email Particular') || ''
//   auth.nome = mapKeys.get('Nome Completo') || ''
//   auth.cidade = mapKeys.get('Cidade/UF') || ''
//   auth.telefone = mapKeys.get('Telefone') || ''
//   auth.cpf = mapKeys.get('CPF') || ''
//   auth.nit = mapKeys.get('NIT') || ''
//   auth.matricula = mapKeys.get('Matrícula') || ''

//   if(auth.matricula === '') {
//     return false
//   }

//   return auth
// }
