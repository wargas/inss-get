// const modalEditEspecie = new bootstrap.Modal(document.getElementById('modal-edit-especie'))
// const inputEspecieNome = document.getElementById('inputEspecieNome')
// const inputEspeciePontos = document.getElementById('inputEspeciePontos')

// VMasker(inputEspeciePontos).maskMoney()

// window.openEditEspecie = (especie) => {
//   inputEspecieNome.value = especie
//   inputEspeciePontos.value = "0,00"
//   modalEditEspecie.show()
// }

Array.from(document.querySelectorAll('.date')).forEach(elem => {
  new Datepicker(elem, {
    format: "dd/mm/yyyy",
    autohide: true
  })

  console.log(elem)
})
