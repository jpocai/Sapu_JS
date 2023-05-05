//VARIABLES PRINCIPALES-
let carrito = [];

const contenedorCarrito = document.getElementById("tablaCarrito");
const botonVaciarCarrito = document.getElementById("vaciar-carrito");
const contadorCarrito = document.getElementById("conteo-carrito");
const botonFinalizarCompra = document.getElementById("finalizar-compra");
const contenedorTotalModal = document.getElementById("footer-total");

//STORAGE-cuando se actualiza la página, se carga el carrito abandonado
//OPERADOR LOGICO OR--------------
carrito = JSON.parse(localStorage.getItem('carrito')) || []; 

//FETCH- se obtienen los datos del archivo (stock.json) y se insertan en las cartas
function crearTarjeta(){
fetch('./stock.json')
.then((res) => res.json())
.then((productos) => {
    let cartas = document.getElementById("cartas");
    for(const prod of productos){
        let carta = document.createElement("div");
        carta.className="items col-12 col-md-6 col-lg-4 p-5";
        carta.innerHTML+=`<div>
        <img class="img-fluid mt-4 p-3" src="${prod.imagen}" alt="${prod.nombre}">
        <h2>${prod.nombre}</h2>
        <h4>${prod.desc}</h4>
        <h4>Precio: $${prod.precio}</h4>
        <button id="btn${prod.id}" class="btn btn-light">Comprar <i class="fa fa-shopping-cart"></i></i></button>
    </div>
        `;
        cartas.append(carta);
        //se crean las cartas y por cada "click" al botón "comprar" se agregan los productos al carrito
        let botonComprar = document.getElementById(`btn${prod.id}`);    
        botonComprar.onclick = () => {
        Swal.fire({
            position: 'bottom-end',
            icon: 'success',
            title: 'Agregaste a tu carrito:'+"\n"+prod.nombre,
            showConfirmButton: false,
            timer: 2500,
            toast : true
          })
            agregarAlCarrito(prod);
            actualizarCarrito(prod);
            //se muestra por consola para corroborar el carrito    
            console.table(carrito);
        }
    }
    })
}

crearTarjeta();

//FUNCION AGREGAR AL CARRITO
const agregarAlCarrito = (productoSeleccionado) => {
    //si ya existe el producto en el carrito se mapea y se suma la cantidad
    const existe = carrito.some ((prod) => prod.id === productoSeleccionado.id);
    if (existe){
            carrito.map(prod => prod.id===productoSeleccionado.id && prod.cantidad++);
        }else{
        //se agrega al carrito y después se actualiza
        carrito.push(productoSeleccionado);   
    }
    actualizarCarrito();
}

//ACTUALIZAR CARRITO Y SUMAR EL TOTAL-
function actualizarCarrito(){   
    contenedorCarrito.innerHTML = "";
    carrito.forEach((prod) => {
        let div = document.createElement("tr");
        div.innerHTML+=`
                        <td>${prod.id}</td>
                        <td>${prod.nombre}</td>
                        <td>$${prod.precio}</td>
                        <td>${prod.cantidad}</td>
                        <td>$${prod.precio*prod.cantidad}</td>
                        <td><button id="eliminar${prod.id}" class="btn btn-outline-danger"><i class="fa-solid fa-trash-can"></i></button></td>
                        `;
                    contenedorCarrito.append(div);
                    //se asigna un botón para eliminar cada producto del carrito
                    const eliminarProducto = document.getElementById(`eliminar${prod.id}`);
                    eliminarProducto.addEventListener("click", function(){
                        Swal.fire({
                            position: 'top-end',
                            icon: 'success',
                            title: prod.nombre+" "+'eliminado!',
                            showConfirmButton: false,
                            timer: 2500,
                            toast : true
                          })
                    eliminarDelCarrito(prod.id);
        }); 
    });         
                //con el método reduce se suma total de todo el carrito
                const total = carrito.reduce((acc,prod) => acc+(prod.precio*prod.cantidad),0);
                //OPERADOR TERNARIO-muestra mensaje en el carrito que después cambia al agregar un producto
                carrito.length === 0 ? contenedorTotalModal.innerHTML = `<th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>`: contenedorTotalModal.innerHTML = `<th scope="row" colspan="5">Total de la compra: $${total}</th>`;
                //se contabiliza la cantidad total de productos para mostar en el botón del carrito
                contadorCarrito.innerText = carrito.reduce((acc,prod) => acc+prod.cantidad,0);
                //se guarda el carrito en el local storage

                localStorage.setItem("carrito",JSON.stringify(carrito));
}

actualizarCarrito();




//ELIMINAR PRODUCTOS-funcíon para eliminar los items del carrito
const eliminarDelCarrito = (prodId) => {
    let indice = carrito.findIndex(prod => prod.id == prodId);
    carrito.splice(indice, 1);
    localStorage.setItem("carrito",JSON.stringify(carrito));
    actualizarCarrito();
}

eliminarDelCarrito();

//VACIAR TOTAL DEL CARRITO-función que vacia el total de items del carrito al usar el botón del evento
botonVaciarCarrito.addEventListener("click", () => {
    if(carrito.length === 0){
        Swal.fire('Todavía no has agregado nada!');
    }else{
        Swal.fire({
            title: 'Se ha vaciado tu carrito!',
            showClass: {
              popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutUp'
            }
          })
    }
    //se elimina todo el carrito, se remueve del local storage y se actualiza
    carrito.length = 0;
    localStorage.removeItem("carrito",JSON.stringify(carrito));
    actualizarCarrito();
})

//FINALIZAR COMPRA-al finalizar la compra se vacía el carrito del local storage-
botonFinalizarCompra.addEventListener("click", () =>{
    if(carrito.length === 0){
        Swal.fire('Seleccioná un producto!');
    }else{
        Swal.fire({
            title: 'Compra realizada con éxito!!!',
            text: 'Muchas gracias!!',
            imageUrl: './favicon_io/Logo1.png',
            imageWidth: 200,
            imageHeight: 100,
            imageAlt: 'Logo',
          })
    }
    //llama a la función que envía los datos al servidor para recibir una respuesta
    enviarDatos();
    //se remueve la info del local storage y se actualiza el carrito desde cero
    localStorage.removeItem("carrito",JSON.stringify(carrito));
    carrito=[];
    actualizarCarrito();
})

//METODO POST-
function enviarDatos(){
    const URLPOST="https://jsonplaceholder.typicode.com/posts";
    const nuevoEnvio=carrito
    fetch(URLPOST,{
        method:'POST',
        body:JSON.stringify(nuevoEnvio),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        }
    })
        .then( respuesta => respuesta.json())
        .then( datos => {
            //se muestra por consola que se recibió la compra
            console.log("Datos retornados por jsonplaceholder: ");
            console.log(datos);
        })
}