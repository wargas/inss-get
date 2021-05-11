import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import FazerLogin from 'App/Workers/FazerLogin'

export default class AuthController {

  async login({ view, session }: HttpContextContract) {

    session.clear()

    return view.render('auth')
  }


  async doLogin({request, response, session}: HttpContextContract) {
    const {uid, password} = request.body()
    const user = await FazerLogin(uid, password)


    if(!user) {
      response.redirect().toPath('/login?msg=error')
    }

    session.put('user', user)

    response.redirect().toPath('/')

  }

}
