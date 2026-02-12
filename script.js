// SIMULACIÓN DE BASE DE DATOS LOCAL
// SIMULACIÓN DE BASE DE DATOS LOCAL
const db = {
  productos: [
    // 250g (principal)
    {
      id: 1,
      nombre: "El Silencio Koffee - Café Tostado en Grano (250g)",
      precio: 25000,
      categoria: "250g / Grano",
      stock: 120,
      imagen: "https://images.unsplash.com/photo-1509042239860-f550ce710b93",

      descripcion: "Café tostado fresco en grano. Ideal para moler al momento y resaltar aroma y notas."
    },
    {
      id: 2,
      nombre: "El Silencio Koffee - Café Tostado Molido (250g)",
      precio: 25000,
      categoria: "250g / Molido",
      stock: 120,
      imagen: "https://images.unsplash.com/photo-1511920170033-f8396924c348",
      descripcion: "Molido listo para preparar. Sabor balanceado y aroma intenso en cada taza."
    },

    // 1 libra (cafeterías y hogar)
    {
      id: 3,
      nombre: "El Silencio Koffee - Café en Grano (1 lb)",
      precio: 50000,
      categoria: "1 lb / Grano",
      stock: 60,
      imagen: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085"
,
      descripcion: "Presentación ideal para consumo frecuente y preparaciones consistentes."
    },
    {
      id: 4,
      nombre: "El Silencio Koffee - Café Molido (1 lb)",
      precio: 50000,
      categoria: "1 lb / Molido",
      stock: 60,
      imagen: "https://images.unsplash.com/photo-1447933601403-0c6688de566e",
      descripcion: "Perfecto para cafeteras y preparación diaria, sin perder frescura."
    },

    // 5 libras (B2B: cafeterías/restaurantes)
    {
      id: 5,
      nombre: "El Silencio Koffee - Café en Grano (5 lb) - Línea Profesionales",
      precio: 230000,
      categoria: "5 lb / Grano",
      stock: 25,
      imagen: "images/cafe.jpg",
      descripcion: "Formato para cafeterías y restaurantes. Tostado consistente y alto rendimiento."
    },
    {
      id: 6,
      nombre: "El Silencio Koffee - Café Molido (5 lb) - Línea Profesionales",
      precio: 230000,
      categoria: "5 lb / Molido",
      stock: 25,
      imagen: "https://images.unsplash.com/photo-1447933601403-0c6688de566e",
      descripcion: "Formato profesional, molido listo para operación. Gran volumen y calidad estable."
    }
  ],

  // Los datos del usuario se guardan en localStorage para simular persistencia en el "DB"
  usuarios: JSON.parse(localStorage.getItem('usuarios')) || [
    { username: 'admin', password: 'admin', role: 'admin', nombre: 'Administrador', email: 'admin@elsilenciokoffee.com' }
  ],

  // Los pedidos se guardan en localStorage
  pedidos: JSON.parse(localStorage.getItem('pedidos')) || []
};


// ----------------------------------------------------------------------
// GESTIÓN DE AUTENTICACIÓN (LOGIN/REGISTRO)
// ----------------------------------------------------------------------

let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;
let currentUserID = sessionStorage.getItem('currentUserID') || null;

function saveDB() {
    localStorage.setItem('usuarios', JSON.stringify(db.usuarios));
    localStorage.setItem('pedidos', JSON.stringify(db.pedidos));
}

function saveCurrentUser(user) {
    currentUser = user;
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    sessionStorage.setItem('currentUserID', user.username);
    checkLoginStatus();
}

function registerUser(username, password, nombre, email) {
    if (db.usuarios.find(u => u.username === username)) {
        return { success: false, message: "El nombre de usuario ya existe." };
    }
    const newUser = { username, password, role: 'user', nombre, email };
    db.usuarios.push(newUser);
    saveDB();
    saveCurrentUser(newUser);
    return { success: true, message: "Registro exitoso. Serás redirigido al inicio." };
}

function loginUser(username, password) {
    const user = db.usuarios.find(u => u.username === username && u.password === password);
    if (user) {
        saveCurrentUser(user);
        return { success: true, user };
    }
    return { success: false, message: "Credenciales incorrectas." };
}

function logout() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUserID');
    checkLoginStatus();
    alert('Sesión cerrada correctamente.');
    window.location.href = 'index.html';
}

function checkLoginStatus() {
    const userMenu = document.querySelector('.user-menu');
    const adminMenu = document.querySelector('.admin-menu');
    const loginLink = document.querySelector('a[href="login.html"]');
    const registerLink = document.querySelector('a[href="registro.html"]');
    const userDisplay = document.getElementById('user-display');
    const logoutBtn = document.getElementById('logout-btn');

    const elements = { userMenu, adminMenu, loginLink, registerLink, userDisplay, logoutBtn };

    // Ocultar/Mostrar enlaces de autenticación
    if (loginLink) loginLink.style.display = currentUser ? 'none' : 'block';
    if (registerLink) registerLink.style.display = currentUser ? 'none' : 'block';

    // Manejar menú de usuario
    // CÓDIGO CORREGIDO EN script.js
// Manejar menú de usuario (Visible para CUALQUIER usuario logueado, sea user o admin)
    if (userMenu) userMenu.style.display = currentUser ? 'block' : 'none';
    if (userDisplay) userDisplay.textContent = currentUser ? currentUser.nombre.split(' ')[0] : '';
    
    // Manejar menú de administrador
    if (adminMenu) adminMenu.style.display = currentUser && currentUser.role === 'admin' ? 'block' : 'none';

    // Asignar evento de cerrar sesión si existe el botón
    if (logoutBtn && !logoutBtn.hasListener) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
        logoutBtn.hasListener = true; // Marca para evitar duplicados
    }
    
    // Si estamos en una página de admin y no somos admin, redirigir
    if (window.location.pathname.includes('admin.html') && (!currentUser || currentUser.role !== 'admin')) {
        alert('Acceso denegado: Se requiere sesión de administrador.');
        window.location.href = 'index.html';
    }
}

// ----------------------------------------------------------------------
// GESTIÓN DEL CARRITO DE COMPRAS
// ----------------------------------------------------------------------

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

function getProductById(id) {
    return db.productos.find(p => p.id === id);
}

function addToCart(productId) {
    const id = parseInt(productId);
    const productInfo = getProductById(id);
    if (!productInfo) return;

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id, name: productInfo.nombre, price: productInfo.precio, quantity: 1 });
    }
    saveCart();
    alert(`${productInfo.nombre} añadido al carrito.`);

}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

function updateCartItemQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        }
        saveCart();
    }
}

function placeOrder() {
    if (!currentUser) {
        alert("Debes iniciar sesión para completar el pedido.");
        return { success: false };
    }
    if (cart.length === 0) {
        alert("El carrito está vacío.");
        return { success: false };
    }

    const newOrder = {
        id: db.pedidos.length + 1,
        userId: currentUserID,
        username: currentUser.nombre,
        date: new Date().toLocaleDateString('es-ES'),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'Pendiente' // Estado inicial
    };

    db.pedidos.push(newOrder);
    localStorage.removeItem('cart'); // Vaciar carrito
    cart = [];
    saveDB(); // Guardar pedidos
    saveCart(); // Actualizar contador
    
    alert(`Pedido #${newOrder.id} realizado con éxito. Total: $${newOrder.total.toFixed(2)}`);
    return { success: true, orderId: newOrder.id };
}

// ----------------------------------------------------------------------
// INICIALIZACIÓN Y EVENT LISTENERS GLOBALES
// ----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    checkLoginStatus();
});

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('add-to-cart')) {
        const id = event.target.dataset.id;
        addToCart(id);
    }
});