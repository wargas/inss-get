import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Auth {
  public async handle ({response, session}: HttpContextContract, next: () => Promise<void>) {

    if(!session.get('user')) {
      response.redirect().toPath('/auth')
    } else {
      await next()
    }

    // code for middleware goes here. ABOVE THE NEXT CALL
  }
}
