import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import Rabbit from 'App/Services/Rabbit'
import InsertDespachos from 'App/Workers/InsertDespachos'
import SalvarTarefa from 'App/Workers/SalvarTarefa'

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
    rabbit.addListener('salvar-tarefa', SalvarTarefa)
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
