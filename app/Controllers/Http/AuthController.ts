import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'


export default class AuthController {

  async login({ view, session }: HttpContextContract) {

    session.clear()

    return view.render('auth')
  }


  async doLogin({response, session}: HttpContextContract) {
    // const {uid, password} = request.body()
    const user = {
      identificador: "",
      email: "wargas.teixeira@inss.gov.br",
      emailParticular: "wargas.teixeira@gmail.com",
      nome: "Wargas Teixeira",
      cidade: "Cabrobo/PE",
      telefone: "",
      cpf: "089.488.424-71",
      nit: "",
      matricula: "2997532",
    }


    if(!user) {
      response.redirect().toPath('/login?msg=error')
    }

    session.put('user', user)

    response.redirect().toPath('/')

  }

}
