// Declaramos las variables que vamos a usar
let carrito = [];
let carritoEnStorage = JSON.parse(localStorage.getItem("carrito")) || [];
const contenedorProductos = document.getElementById("contenedorProductos");
const filterInput = document.getElementById("filter__input");
const filterLista = document.getElementById("filter__lista");
const filterNombre = document.getElementById("filter__nombre");
const filterPrecio = document.getElementById("filter__precio");
const btnCarrito = document.getElementById("btnCarrito");
const carritoTable = document.getElementById("carritoTable");
const footCarrito = document.getElementById("totales");
const btnFinalizarCompra = document.getElementById("btnFinalizarCompra");

// Funcion donde traigo los datos JSON sumilando un servidor
const traerDatosJson = async () => {
    try {
      const response = await fetch('/json/productos.json');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener los datos del servidor:', error);
      return []; // Devuelve un arreglo vacío en caso de error.
    }
};

// Función para mostrar productos en el DOM
const mostrarProductos = (productos) => {
    // Limpio el contenedor antes de mostrar los productos
    contenedorProductos.innerHTML = "";
    
    // Recorro el arreglo de productos y creo una tarjeta con bootstrap para cada uno
    productos.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("col-xl-3", "col-md-6", "col-sm-12");

        card.innerHTML = `
            <div class="card">
                <img src="${item.img}" class="card-img-top imgProductos" alt="${item.nombre}">
                <div class="text-center">
                    <h2>${item.nombre}</h2>
                    <p>${item.categoria}</p>
                    <b>$${item.precio}</b><br>
                    <button class="btn colorBoton" id="boton${item.id}">Agregar</button>
                </div>
            </div>
        `;

        // Agrego los productos guardado en card al contenedor
        contenedorProductos.appendChild(card);

        // Obtengo el boton agregar de cada producto y creo un evento cuando se hace click en el boton 
        const boton = document.getElementById(`boton${item.id}`);
        boton.addEventListener("click", () => {
            
            // LLamo a la funcion agregarAlCarrrito, y le paso el id del producto
            agregarAlCarrito(item.id); 
        });
    });
}

// Cargo los productos y los muestro cuando se carga la pagina
window.addEventListener("load", async () => {
    const productos = await traerDatosJson(); 
    mostrarProductos(productos); 
});

// Filtra los productos por nombre mientras se escribe en el input de búsqueda
filterInput.addEventListener("keyup", async (e) => {
    const productos = await traerDatosJson();
    const productosFilter = productos.filter((item) => item.nombre.toLowerCase().includes(e.target.value.toLowerCase()));
    mostrarProductos(e.target.value !== "" ? productosFilter : productos);
});

// Filtra los productos por categoría al hacer clic en la lista de filtro
filterLista.addEventListener("click", async (e) => {
    const productos = await traerDatosJson();
    const categoriaFiltrada = e.target.innerHTML.toLowerCase();
    const productosFilter = productos.filter((item) => categoriaFiltrada === "todos" || item.categoria.toLowerCase().includes(categoriaFiltrada));
    mostrarProductos(productosFilter);
});

// Ordena los productos por nombre al hacer clic en el filtro de nombre
filterNombre.addEventListener("click", (e) => {
    filtrarPorNombre(e.target.innerHTML);
});

// Función para filtrar y ordenar productos por nombre
const filtrarPorNombre = async (orden) => {
    const productos = await traerDatosJson();
    const productosOrdenados = productos.sort((a, b) =>
        orden === "A - Z" ? a.nombre.localeCompare(b.nombre) : b.nombre.localeCompare(a.nombre)
    );
    mostrarProductos(productosOrdenados);
};

// Ordena los productos por precio al hacer clic en el filtro de precio
filterPrecio.addEventListener("click", async (e) => {
    const productos = await traerDatosJson();
    const orden = e.target.innerHTML;
    const preciosOrdenados = productos.sort((a, b) =>
        orden === 'Ascendente' ? a.precio - b.precio : b.precio - a.precio
    );
    mostrarProductos(preciosOrdenados);
});

// Función para agregar un producto al carrito
// Importante! En esta funcion tambien voy a guardar el carrito en el Storage, para que los datos perduren aunque se cierre la pagina
const agregarAlCarrito = async (id) => {
    const productos = await traerDatosJson();
    const productoEnCarrito = carritoEnStorage.find(item => item.id === id);

    if (productoEnCarrito) {
        // Si el producto ya está en el carrito, aumenta la cantidad en 1.
        productoEnCarrito.cantidad++;
    } else {
        // Si el producto no está en el carrito, lo agrego con cantidad igual 1.
        const producto = productos.find(item => item.id === id);
        carritoEnStorage.push(producto);
    }

    // Recalcula el precio total para todos los productos en el carrito.
    carritoEnStorage.forEach(producto => {
        producto.precioTotal = producto.precio * producto.cantidad;
    });

    // Guarda los datos actualizados en localStorage
    localStorage.setItem("carrito", JSON.stringify(carritoEnStorage));

    // Actualiza la vista del carrito
    dibujarCarrito();

    // Libreria SweetAlert()
    swal("Producto agregado al carrito.", {
        icon: "success",
    });
};

// Muestra u oculta el carrito al hacer clic en el botón de carrito
btnCarrito.addEventListener("click", () => {
    if (carritoTable) {
        if (carritoTable.style.display === "block") {
            carritoTable.style.display = "none";
        } else {
            carritoTable.style.display = "block";
            dibujarCarrito();
        }
    }
});

// Función para dibujar la vista del carrito
const dibujarCarrito = async () => {
    const productos = await traerDatosJson();
    const listaCarrito = document.getElementById("items");

    // Limpia el contenido anterior del carrito
    listaCarrito.innerHTML = '';

    // Recorre los productos en el carrito y crea una fila para cada uno
    carritoEnStorage.forEach(producto => {
        const { img, nombre, cantidad, precio, id } = producto;
        const row = document.createElement("tr");
        row.className = "producto__carrito";
        row.innerHTML = `
            <td><img src="${img}" class="card-img-top" style="width: 40%; height: 30%" /></td>
            <td>${nombre}</td>
            <td>${cantidad}</td>
            <td>$${precio}</td>
            <td>$${producto.precioTotal}</td>
            <td>
                <button id="-${id}" class="btn btn-danger">-</button>
                <button id="+${id}" class="btn btn-success">+</button>    
            </td>
        `;

        // Agrega la fila al carrito
        listaCarrito.appendChild(row);

        // Agrega eventos a los botones de aumento y disminución
        const btnAgregar = document.getElementById(`+${id}`);
        const btnRestar = document.getElementById(`-${id}`);
        
        btnAgregar.addEventListener("click", () => aumentarCantidad(id));
        btnRestar.addEventListener("click", () => restarCantidad(id));
    });

    // Dibuja el footer del carrito
    dibujarFooter();
};

// Función para aumentar la cantidad de un producto en el carrito
const aumentarCantidad = (id) => {
    const indexProductoCarrito = carritoEnStorage.findIndex((producto) => producto.id === id);

    if (indexProductoCarrito !== -1) {
        carritoEnStorage[indexProductoCarrito].cantidad++;
        carritoEnStorage[indexProductoCarrito].precioTotal = carritoEnStorage[indexProductoCarrito].cantidad * carritoEnStorage[indexProductoCarrito].precio;
    }

    // Guarda los datos actualizados en localStorage
    localStorage.setItem("carrito", JSON.stringify(carritoEnStorage));
    dibujarCarrito();
};

// Función para restar la cantidad de un producto en el carrito
const restarCantidad = (id) => {
    const indexProductoCarrito = carritoEnStorage.findIndex((producto) => producto.id === id);

    if (indexProductoCarrito !== -1) {
        if (carritoEnStorage[indexProductoCarrito].cantidad > 1) {
            carritoEnStorage[indexProductoCarrito].cantidad--;
            carritoEnStorage[indexProductoCarrito].precioTotal = carritoEnStorage[indexProductoCarrito].cantidad * carritoEnStorage[indexProductoCarrito].precio;
        } else {
            // Si la cantidad es 1 o menor, elimina el producto del carrito
            carritoEnStorage.splice(indexProductoCarrito, 1);
        }
    }

    // Guarda los datos actualizados en sessionStorage
    localStorage.setItem("carrito", JSON.stringify(carritoEnStorage));
    dibujarCarrito();
};

// Función para generar los totales del carrito
const generarTotales = () => {
    costoTotal = carritoEnStorage.reduce((total, { precioTotal }) => total + precioTotal, 0)
    const cantidadTotal = carritoEnStorage.reduce((total, {cantidad}) => total + cantidad, 0)

    return {
        costoTotal: costoTotal,
        cantidadTotal: cantidadTotal
    }
};

// Función para dibujar el footer del carrito
const dibujarFooter = () => {
    if (carritoEnStorage.length > 0) {
        footCarrito.innerHTML = "";

        let footer = document.createElement("tr");

        footer.innerHTML = `
            <th><b>Totales:</b></th>
            <td></td>
            <td>${generarTotales().cantidadTotal}</td>
            <td></td>
            <td>$${generarTotales().costoTotal}</td>
            <td>
                <button id="btnFinalizarCompra" class="btn btn-success">Finalizar Compra</button>
            </td>
        `;

        footCarrito.append(footer);
    } else {
        footCarrito.innerHTML = "<h3>No hay productos en el carrito</h3>";
    }
    
    const btnFinalizarCompra = document.getElementById("btnFinalizarCompra");
    if (btnFinalizarCompra) {
        btnFinalizarCompra.addEventListener("click", () => Comprar());
    }
};

// Función para finalizar la compra
const Comprar = () => {
    if (carritoEnStorage.length > 0) {
        swal({
            title: "¿Desea continuar con la compra?",
            text: "Una vez realizada la compra, el carrito se vaciará.",
            icon: "warning",
            buttons: ["Cancelar", "Continuar"],
            dangerMode: true,
        }).then((item) => {
            if (item) {
                carritoEnStorage = [];
                localStorage.setItem("carrito", JSON.stringify(carritoEnStorage));
                dibujarCarrito();
                swal("Compra realizada con éxito.", {
                    icon: "success",
                });
            } else {
                swal("Compra cancelada.", {
                    icon: "info",
                });
            }
        });
    } else {
        swal("El carrito está vacío.", {
            icon: "info",
        });
    }
};