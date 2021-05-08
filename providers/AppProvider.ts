import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import Rabbit from 'App/Services/Rabbit'
import InsertDespachos from 'App/Workers/InsertDespachos'

export default class AppProvider {


  constructor(protected app: ApplicationContract) {  }

  public register() {
    // Register your own bindings
  }

  public async boot() {
    // IoC container is ready
  }

  public async ready() {
    const rabbit = await Rabbit.init()

    rabbit.addListener('processo', InsertDespachos)
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
