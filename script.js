// Main website functionality - Updated for new design

document.addEventListener('DOMContentLoaded', function() {
    // Initialize localStorage data if not exists
    initializeStorage();
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
    
    // Close mobile menu when clicking links
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar') && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Booking form functionality
    const quickBookingForm = document.getElementById('quickBooking');
    if (quickBookingForm) {
        // Set min date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('checkin').min = today;
        
        // Update checkout min date when checkin changes
        document.getElementById('checkin').addEventListener('change', function() {
            const checkinDate = new Date(this.value);
            const tomorrow = new Date(checkinDate);
            tomorrow.setDate(tomorrow.getDate() + 1);
            document.getElementById('checkout').min = tomorrow.toISOString().split('T')[0];
            
            // If checkout is before new min, clear it
            const checkoutDate = new Date(document.getElementById('checkout').value);
            if (checkoutDate <= checkinDate) {
                document.getElementById('checkout').value = '';
            }
        });
        
        quickBookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const checkin = document.getElementById('checkin').value;
            const checkout = document.getElementById('checkout').value;
            const roomType = document.getElementById('roomType').value;
            const guests = document.getElementById('guests').value;
            
            if (!checkin || !checkout || !roomType) {
                showNotification('Please fill in all fields', 'warning');
                return;
            }
            
            // Check for blocked dates
            const blockedDates = JSON.parse(localStorage.getItem('blockedDates') || '[]');
            const checkinDate = new Date(checkin);
            const checkoutDate = new Date(checkout);
            
            for (let blocked of blockedDates) {
                const blockedStart = new Date(blocked.startDate);
                const blockedEnd = new Date(blocked.endDate);
                
                if ((checkinDate >= blockedStart && checkinDate <= blockedEnd) ||
                    (checkoutDate >= blockedStart && checkoutDate <= blockedEnd) ||
                    (checkinDate <= blockedStart && checkoutDate >= blockedEnd)) {
                    
                    showNotification('Selected dates are blocked. Please contact us via email or phone to book.', 'info');
                    return;
                }
            }
            
            // Redirect to booking page with parameters
            window.location.href = `booking.html?checkin=${checkin}&checkout=${checkout}&type=${roomType}&guests=${guests}`;
        });
    }
    
    // Update weather widget
    updateWeatherWidget();
    
    // Add scroll animations
    addScrollAnimations();
    
    // Add active nav link based on scroll position
    highlightActiveNavLink();
    
    // Initialize any animations
    initializeAnimations();
});

function initializeStorage() {
    if (!localStorage.getItem('bookings')) {
        localStorage.setItem('bookings', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('blockedDates')) {
        localStorage.setItem('blockedDates', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('rooms')) {
        const rooms = {
            family: {
                type: "Family Room",
                price: 450,
                maxGuests: 3,
                available: 24,
                description: "Double bed + single bed, en-suite shower, OpenView TV, tea/coffee facilities"
            },
            selfcatering: {
                type: "Self Catering Unit",
                price: 650,
                maxGuests: 4,
                available: 12,
                description: "Two double bedrooms, living room, kitchenette, shared bathroom, OpenView TV"
            },
            standard: {
                type: "Standard Room",
                price: 350,
                maxGuests: 2,
                available: 64,
                description: "Two single beds, en-suite shower, OpenView TV, tea/coffee facilities"
            }
        };
        localStorage.setItem('rooms', JSON.stringify(rooms));
    }
}

function updateWeatherWidget() {
    const weatherIcon = document.querySelector('.weather-icon i');
    const weatherInfo = document.querySelector('.weather-info p:nth-child(2)');
    
    if (weatherIcon && weatherInfo) {
        // Simulate Kimberley's climate
        const now = new Date();
        const hour = now.getHours();
        const month = now.getMonth();
        
        // Kimberley has hot summers and mild winters
        if (month >= 9 || month <= 3) { // Summer months (Oct-March)
            if (hour >= 6 && hour < 18) {
                weatherIcon.className = 'fas fa-sun';
                weatherIcon.style.color = '#d4a017';
                weatherInfo.textContent = 'Sunny & Hot';
            } else {
                weatherIcon.className = 'fas fa-moon';
                weatherIcon.style.color = '#0a3a7c';
                weatherInfo.textContent = 'Warm Evening';
            }
        } else { // Winter months (April-Sept)
            if (hour >= 6 && hour < 18) {
                weatherIcon.className = 'fas fa-cloud-sun';
                weatherIcon.style.color = '#1e4fa0';
                weatherInfo.textContent = 'Mild & Sunny';
            } else {
                weatherIcon.className = 'fas fa-moon';
                weatherIcon.style.color = '#0a3a7c';
                weatherInfo.textContent = 'Cool Night';
            }
        }
    }
}

function calculateDays(checkin, checkout) {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(checkin);
    const secondDate = new Date(checkout);
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}

function formatCurrency(amount) {
    return 'R' + amount.toFixed(2);
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius-sm);
            box-shadow: var(--shadow-lg);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
        }
        
        .notification-info {
            background: linear-gradient(135deg, var(--primary-blue), var(--accent-blue));
            color: white;
            border-left: 4px solid var(--accent-blue);
        }
        
        .notification-warning {
            background: linear-gradient(135deg, #ffc107, #ff9800);
            color: var(--text-dark);
            border-left: 4px solid #ff9800;
        }
        
        .notification-success {
            background: linear-gradient(135deg, var(--veld-green), #34a853);
            color: white;
            border-left: 4px solid #34a853;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: inherit;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: var(--transition);
        }
        
        .notification-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe all elements with data-animate attribute
    document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
    });
}

function highlightActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

function initializeAnimations() {
    // Add data-animate to elements that should animate on scroll
    const animateElements = document.querySelectorAll('.room-card, .amenity, .booking-widget');
    animateElements.forEach((el, index) => {
        el.setAttribute('data-animate', '');
        el.style.animationDelay = `${index * 0.1}s`;
    });
}