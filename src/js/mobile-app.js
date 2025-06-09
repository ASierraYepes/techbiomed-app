// Mobile App JavaScript para TECHBIOMED
document.addEventListener('DOMContentLoaded', function() {
    
    // Configuración de la app
    const app = {
        currentPage: 'home',
        cartItems: 2,
        isOnline: navigator.onLine,
        
        // Inicialización
        init() {
            this.setupEventListeners();
            this.setupPWA();
            this.setupTouchFeedback();
            this.setupFormValidation();
            this.detectCurrentPage();
        },
        
        // Detectar página actual
        detectCurrentPage() {
            const path = window.location.pathname;
            if (path.includes('carrito')) this.currentPage = 'cart';
            else if (path.includes('contacto')) this.currentPage = 'contact';
            else if (path.includes('login')) this.currentPage = 'login';
            else if (path.includes('registro')) this.currentPage = 'register';
            else this.currentPage = 'home';
        },
        
        // Configurar event listeners
        setupEventListeners() {
            // Navegación inferior
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', this.handleNavigation.bind(this));
            });
            
            // Búsqueda
            const searchInput = document.querySelector('input[placeholder*="Buscar"]');
            if (searchInput) {
                searchInput.addEventListener('input', this.handleSearch.bind(this));
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.performSearch(e.target.value);
                    }
                });
            }
            
            // Carrito
            this.setupCartFunctionality();
            
            // Formularios
            this.setupForms();
            
            // Gestos de swipe
            this.setupSwipeGestures();
            
            // Botones de categorías
            this.setupCategoryButtons();
        },
        
        // Configurar PWA
        setupPWA() {
            // Service Worker
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => console.log('SW registrado'))
                    .catch(error => console.log('SW error:', error));
            }
            
            // Prompt de instalación
            let deferredPrompt;
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                this.showInstallPrompt();
            });
        },
        
        // Mostrar prompt de instalación
        showInstallPrompt() {
            const installBanner = document.createElement('div');
            installBanner.className = 'fixed top-20 left-4 right-4 bg-primary text-white p-4 rounded-2xl z-50 flex items-center justify-between';
            installBanner.innerHTML = `
                <div>
                    <p class="font-semibold">Instalar TECHBIOMED</p>
                    <p class="text-sm opacity-90">Acceso rápido desde tu pantalla de inicio</p>
                </div>
                <button class="bg-white text-primary px-4 py-2 rounded-xl font-semibold text-sm" id="install-btn">
                    Instalar
                </button>
            `;
            document.body.appendChild(installBanner);
            
            // Auto-ocultar después de 5 segundos
            setTimeout(() => {
                if (installBanner.parentNode) {
                    installBanner.remove();
                }
            }, 5000);
        },
        
        // Configurar feedback táctil
        setupTouchFeedback() {
            document.querySelectorAll('.touch-feedback').forEach(element => {
                element.addEventListener('touchstart', function() {
                    this.style.transform = 'scale(0.95)';
                    this.style.opacity = '0.7';
                });
                
                element.addEventListener('touchend', function() {
                    setTimeout(() => {
                        this.style.transform = '';
                        this.style.opacity = '';
                    }, 100);
                });
            });
        },
        
        // Configurar funcionalidad del carrito
        setupCartFunctionality() {
            // Botones de cantidad
            document.querySelectorAll('.qty-btn').forEach(btn => {
                btn.addEventListener('click', this.handleQuantityChange.bind(this));
            });
            
            // Botones de agregar al carrito
            document.querySelectorAll('button').forEach(btn => {
                if (btn.innerHTML.includes('fa-plus')) {
                    btn.addEventListener('click', this.addToCart.bind(this));
                }
            });
            
            // Eliminar items del carrito
            document.querySelectorAll('.fa-trash').forEach(btn => {
                btn.closest('button').addEventListener('click', this.removeFromCart.bind(this));
            });
        },
        
        // Manejar cambios de cantidad
        handleQuantityChange(e) {
            const button = e.target.closest('button');
            const isPlus = button.querySelector('.fa-plus');
            const quantitySpan = button.parentNode.querySelector('span');
            let quantity = parseInt(quantitySpan.textContent);
            
            if (isPlus) {
                quantity++;
            } else if (quantity > 1) {
                quantity--;
            }
            
            quantitySpan.textContent = quantity;
            this.updateCartTotal();
            this.showToast(isPlus ? 'Cantidad aumentada' : 'Cantidad reducida');
        },
        
        // Agregar al carrito
        addToCart(e) {
            const productCard = e.target.closest('.bg-white');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.font-bold').textContent;
            
            this.cartItems++;
            this.updateCartBadge();
            this.showToast(`${productName} agregado al carrito`);
            
            // Animación de feedback
            const button = e.target.closest('button');
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.classList.add('bg-green-500');
            
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-plus"></i>';
                button.classList.remove('bg-green-500');
            }, 1000);
        },
        
        // Remover del carrito
        removeFromCart(e) {
            const item = e.target.closest('.bg-white');
            const productName = item.querySelector('h3').textContent;
            
            // Animación de salida
            item.style.transform = 'translateX(-100%)';
            item.style.opacity = '0';
            
            setTimeout(() => {
                item.remove();
                this.cartItems--;
                this.updateCartBadge();
                this.updateCartTotal();
                this.showToast(`${productName} eliminado del carrito`);
            }, 300);
        },
        
        // Actualizar badge del carrito
        updateCartBadge() {
            document.querySelectorAll('.cart-count, .w-4.h-4').forEach(badge => {
                if (badge.textContent !== undefined) {
                    badge.textContent = this.cartItems;
                    badge.style.display = this.cartItems > 0 ? 'flex' : 'none';
                }
            });
        },
        
        // Actualizar total del carrito
        updateCartTotal() {
            const cartItems = document.querySelectorAll('.bg-white .font-bold');
            let total = 0;
            
            cartItems.forEach(item => {
                const priceText = item.textContent.replace('$', '').replace(',', '');
                const price = parseFloat(priceText);
                const quantity = parseInt(item.closest('.bg-white').querySelector('span').textContent || 1);
                total += price * quantity;
            });
            
            // Actualizar elementos de total
            document.querySelectorAll('.text-primary').forEach(element => {
                if (element.textContent.includes('$')) {
                    element.textContent = `$${total.toLocaleString()}`;
                }
            });
        },
        
        // Configurar navegación
        handleNavigation(e) {
            const page = e.currentTarget.dataset.page;
            if (!page) return;
            
            // Actualizar estado activo
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                item.querySelectorAll('i, span').forEach(el => {
                    el.classList.remove('text-primary');
                    el.classList.add('text-gray-400');
                });
            });
            
            e.currentTarget.classList.add('active');
            e.currentTarget.querySelectorAll('i, span').forEach(el => {
                el.classList.remove('text-gray-400');
                el.classList.add('text-primary');
            });
            
            // Navegar a la página
            this.navigateToPage(page);
        },
        
        // Navegar a página
        navigateToPage(page) {
            const pages = {
                'home': 'index.html',
                'cart': 'carrito.html',
                'contact': 'contacto.html',
                'profile': 'login.html'
            };
            
            if (pages[page] && pages[page] !== window.location.pathname.split('/').pop()) {
                // Animación de transición
                document.body.style.opacity = '0.8';
                setTimeout(() => {
                    window.location.href = pages[page];
                }, 150);
            }
        },
        
        // Configurar búsqueda
        handleSearch(e) {
            const query = e.target.value.toLowerCase();
            if (query.length < 2) return;
            
            // Simular búsqueda en tiempo real
            this.debounce(() => {
                this.performSearch(query);
            }, 300);
        },
        
        // Realizar búsqueda
        performSearch(query) {
            this.showToast(`Buscando: ${query}`);
            // Aquí implementarías la lógica de búsqueda real
        },
        
        // Configurar formularios
        setupForms() {
            // Formulario de contacto
            const contactForm = document.querySelector('form');
            if (contactForm) {
                contactForm.addEventListener('submit', this.handleFormSubmit.bind(this));
            }
            
            // Validación en tiempo real
            document.querySelectorAll('input[required]').forEach(input => {
                input.addEventListener('blur', this.validateField.bind(this));
                input.addEventListener('input', this.clearFieldError.bind(this));
            });
        },
        
        // Manejar envío de formularios
        handleFormSubmit(e) {
            e.preventDefault();
            const form = e.target;
            
            if (this.validateForm(form)) {
                this.showLoading();
                
                // Simular envío
                setTimeout(() => {
                    this.hideLoading();
                    this.showToast('Mensaje enviado correctamente', 'success');
                    form.reset();
                }, 2000);
            }
        },
        
        // Validar formulario
        validateForm(form) {
            let isValid = true;
            const requiredFields = form.querySelectorAll('input[required], select[required]');
            
            requiredFields.forEach(field => {
                if (!this.validateField({ target: field })) {
                    isValid = false;
                }
            });
            
            return isValid;
        },
        
        // Validar campo individual
        validateField(e) {
            const field = e.target;
            const value = field.value.trim();
            let isValid = true;
            let errorMessage = '';
            
            // Validación requerido
            if (field.hasAttribute('required') && !value) {
                isValid = false;
                errorMessage = 'Este campo es requerido';
            }
            
            // Validación email
            if (field.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Ingresa un email válido';
                }
            }
            
            // Validación teléfono
            if (field.type === 'tel' && value) {
                const phoneRegex = /^[\+]?[0-9\s\-$$$$]{10,}$/;
                if (!phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Ingresa un teléfono válido';
                }
            }
            
            // Mostrar/ocultar error
            this.showFieldError(field, isValid ? '' : errorMessage);
            return isValid;
        },
        
        // Mostrar error en campo
        showFieldError(field, message) {
            // Remover error anterior
            const existingError = field.parentNode.querySelector('.field-error');
            if (existingError) {
                existingError.remove();
            }
            
            if (message) {
                field.classList.add('border-red-500');
                const errorDiv = document.createElement('div');
                errorDiv.className = 'field-error text-red-500 text-xs mt-1';
                errorDiv.textContent = message;
                field.parentNode.appendChild(errorDiv);
            } else {
                field.classList.remove('border-red-500');
            }
        },
        
        // Limpiar error de campo
        clearFieldError(e) {
            const field = e.target;
            field.classList.remove('border-red-500');
            const error = field.parentNode.querySelector('.field-error');
            if (error) {
                error.remove();
            }
        },
        
        // Configurar validación de formularios
        setupFormValidation() {
            // Validación de contraseña en registro
            const passwordInputs = document.querySelectorAll('input[type="password"]');
            if (passwordInputs.length >= 2) {
                passwordInputs[0].addEventListener('input', this.updatePasswordStrength.bind(this));
                passwordInputs[1].addEventListener('input', this.validatePasswordMatch.bind(this));
            }
        },
        
        // Actualizar fortaleza de contraseña
        updatePasswordStrength(e) {
            const password = e.target.value;
            const strengthBars = document.querySelectorAll('.h-1');
            const strengthText = document.querySelector('.text-xs.text-gray-500');
            
            if (!strengthBars.length) return;
            
            let strength = 0;
            let strengthLabel = 'Muy débil';
            
            if (password.length >= 8) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;
            
            const colors = ['bg-red-300', 'bg-yellow-300', 'bg-blue-300', 'bg-green-300'];
            const labels = ['Muy débil', 'Débil', 'Buena', 'Fuerte'];
            
            strengthBars.forEach((bar, index) => {
                bar.className = `h-1 rounded flex-1 ${index < strength ? colors[strength - 1] : 'bg-gray-200'}`;
            });
            
            if (strengthText) {
                strengthText.textContent = labels[strength - 1] || 'Muy débil';
            }
        },
        
        // Validar coincidencia de contraseñas
        validatePasswordMatch(e) {
            const confirmPassword = e.target.value;
            const password = document.querySelector('input[type="password"]').value;
            
            if (confirmPassword && password !== confirmPassword) {
                this.showFieldError(e.target, 'Las contraseñas no coinciden');
            } else {
                this.showFieldError(e.target, '');
            }
        },
        
        // Configurar gestos de swipe
        setupSwipeGestures() {
            let startX, startY, endX, endY;
            
            document.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            });
            
            document.addEventListener('touchend', (e) => {
                endX = e.changedTouches[0].clientX;
                endY = e.changedTouches[0].clientY;
                this.handleSwipe(startX, startY, endX, endY);
            });
        },
        
        // Manejar gestos de swipe
        handleSwipe(startX, startY, endX, endY) {
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const minSwipeDistance = 50;
            
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    // Swipe derecha - ir atrás
                    if (window.history.length > 1) {
                        window.history.back();
                    }
                }
            }
        },
        
        // Configurar botones de categorías
        setupCategoryButtons() {
            document.querySelectorAll('.text-center.touch-feedback').forEach(category => {
                category.addEventListener('click', (e) => {
                    const categoryName = e.currentTarget.querySelector('span').textContent;
                    this.showToast(`Explorando: ${categoryName}`);
                    // Aquí implementarías la navegación a la categoría
                });
            });
        },
        
        // Mostrar toast/notificación
        showToast(message, type = 'info') {
            const toast = document.createElement('div');
            const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-gray-800';
            
            toast.className = `fixed top-20 left-4 right-4 ${bgColor} text-white p-4 rounded-2xl z-50 transform translate-y-[-100px] opacity-0 transition-all duration-300`;
            toast.textContent = message;
            
            document.body.appendChild(toast);
            
            // Animar entrada
            setTimeout(() => {
                toast.style.transform = 'translate-y-0';
                toast.style.opacity = '1';
            }, 100);
            
            // Auto-remover
            setTimeout(() => {
                toast.style.transform = 'translate-y-[-100px]';
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        },
        
        // Mostrar loading
        showLoading() {
            const loading = document.createElement('div');
            loading.id = 'loading-overlay';
            loading.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            loading.innerHTML = `
                <div class="bg-white rounded-2xl p-6 flex flex-col items-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                    <p class="text-gray-600">Enviando...</p>
                </div>
            `;
            document.body.appendChild(loading);
        },
        
        // Ocultar loading
        hideLoading() {
            const loading = document.getElementById('loading-overlay');
            if (loading) {
                loading.remove();
            }
        },
        
        // Debounce utility
        debounce(func, wait) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(func, wait);
        }
    };
    
    // Inicializar la app
    app.init();
    
    // Exponer funciones globales si es necesario
    window.TechBiomedApp = app;
});

// Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registrado con éxito:', registration);
            })
            .catch(registrationError => {
                console.log('SW falló al registrarse:', registrationError);
            });
    });
}

// Manejar estado offline/online
window.addEventListener('online', () => {
    document.body.classList.remove('offline');
    console.log('Conexión restaurada');
});

window.addEventListener('offline', () => {
    document.body.classList.add('offline');
    console.log('Sin conexión a internet');
});

// Prevenir zoom en inputs (iOS)
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
});

// Manejar orientación de pantalla
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
});