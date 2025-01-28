const cards = document.getElementById('cards');
const templatCard = document.querySelector('#template-card').content;
const templateFooter = document.getElementById('template-footer').content;
const templateCarrito = document.getElementById('template-carrito').content;
const fragment = document.createDocumentFragment();
const items = document.getElementById('items');
const footer = document.getElementById('footer');
let carrito = {}


// Events
document.addEventListener('DOMContentLoaded', () => {
    if(localStorage.getItem('carrito')){
        carrito = JSON.parse(localStorage.getItem('carrito'))
        pintarCarrito(carrito)
    }

    fetchData('./api.json');
    cards.addEventListener('click', addCarrito);
    items.addEventListener('click', btnAccion)

});



// Functions
const fetchData = async (url) => {
    try{
        const resp = await fetch(url);
        const data = await resp.json();
        pintarCards(data);
    }catch(err){
        console.log('Error al consultar los datos: ' + err);
    }
}

const pintarCards = data => {
    data.forEach(producto => {
        templatCard.querySelector('h5').textContent = producto.title;
        templatCard.querySelector('p').textContent = producto.precio;
        templatCard.querySelector('img').setAttribute('src',producto.thumbnailUrl);
        templatCard.querySelector('button.btn-dark').dataset.id = producto.id;

        const clone = templatCard.cloneNode(true);
        fragment.appendChild(clone);
    });

    cards.append(fragment);
}

const addCarrito = e => {
    e.stopPropagation();
    if(e.target.classList.contains('btn-dark')){
        setCarrito(e.target.parentElement);
    }
}

const setCarrito = obj => {
    const producto = {
        id: obj.querySelector('.btn-dark').dataset.id,
        titulo: obj.querySelector('h5').textContent,
        precio: obj.querySelector('p').textContent,
        cantidad: 1
    }

    if(carrito.hasOwnProperty(producto.id)){
        producto.cantidad = carrito[producto.id].cantidad + 1
    }

    carrito[producto.id] = {...producto}
    pintarCarrito(carrito);
}

const pintarCarrito = carrito => {
    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id;
        templateCarrito.querySelectorAll('td')[0].textContent = producto.titulo;
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad;
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id;
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id;
        templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio;

        const clone = templateCarrito.cloneNode(true);
        fragment.append(clone);
    });
    
    while(items.firstElementChild){
        items.removeChild(items.firstElementChild)
    }

    items.append(fragment);
    pintarFooter();
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

const pintarFooter = () => {
    footer.innerHTML = '';
    if(Object.keys(carrito).length === 0){
        footer.innerHTML = '<th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>';
        return
    }

    const nCantidad = Object.values(carrito).reduce((acc, {cantidad}) => acc + cantidad ,0 );
    const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + (cantidad * precio),0)
    
    templateFooter.querySelectorAll('td')[0].textContent = nCantidad;
    templateFooter.querySelector('span').textContent = nPrecio;
    
    const clone = templateFooter.cloneNode(true);
    fragment.appendChild(clone);

    footer.appendChild(fragment);

    const btnVaciar = document.getElementById('vaciar-carrito');
    btnVaciar.addEventListener('click', () => {
        carrito = {}
        pintarCarrito(carrito);
    });
}

const btnAccion = e => {
    e.stopPropagation();

    // Accion de aumentar
    if(e.target.classList.contains('btn-info')){
        const producto = carrito[e.target.dataset.id];
        producto.cantidad++;
        carrito[e.target.dataset.id] = {...producto};
        pintarCarrito(carrito);
    }
    if(e.target.classList.contains('btn-danger')){
        const producto = carrito[e.target.dataset.id];
        producto.cantidad--;

        if(producto.cantidad === 0){
            delete carrito[e.target.dataset.id]
        }
        pintarCarrito(carrito);
    }
}