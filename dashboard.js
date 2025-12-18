document.addEventListener('DOMContentLoaded', function() {
    // Load user bookings
    loadBookings();
    
    // Setup profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfile();
        });
    }
    
    // Load user profile
    loadProfile();
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Add dashboard-specific styles
    addDashboardStyles();
});

function loadBookings() {
    const bookingsList = document.getElementById('bookingsList');
    if (!bookingsList) return;
    
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    if (bookings.length === 0) {
        bookingsList.innerHTML = `
            <div class="no-bookings">
                <i class="fas fa-calendar-times"></i>
                <h3>No Bookings Found</h3>
                <p>You haven't made any bookings yet.</p>
                <a href="index.html#booking" class="cta-button">Book Now</a>
            </div>
        `;
        return;
    }
    
    // Group bookings by email (simulating user accounts)
    const userEmail = getLastBookingEmail() || 'guest@example.com';
    const userBookings = bookings.filter(b => b.email === userEmail);
    
    // Update user info
    if (userBookings.length > 0) {
        document.getElementById('userName').textContent = 
            `${userBookings[0].firstName} ${userBookings[0].lastName}`;
        document.getElementById('userEmail').textContent = userBookings[0].email;
    }
    
    let bookingsHTML = '';
    
    userBookings.forEach(booking => {
        const nights = calculateDays(booking.checkin, booking.checkout);
        const checkinDate = new Date(booking.checkin);
        const today = new Date();
        const isUpcoming = checkinDate >= today;
        
        bookingsHTML += `
            <div class="booking-card ${isUpcoming ? 'upcoming' : 'past'}">
                <div class="booking-card-header">
                    <h3>${booking.roomTypeName}</h3>
                    <span class="booking-status ${booking.status}">${booking.status}</span>
                </div>
                
                <div class="booking-card-body">
                    <div class="booking-info">
                        <div class="info-item">
                            <i class="fas fa-calendar-alt"></i>
                            <div>
                                <small>Dates</small>
                                <strong>${formatDate(booking.checkin)} - ${formatDate(booking.checkout)}</strong>
                            </div>
                        </div>
                        
                        <div class="info-item">
                            <i class="fas fa-moon"></i>
                            <div>
                                <small>Nights</small>
                                <strong>${nights}</strong>
                            </div>
                        </div>
                        
                        <div class="info-item">
                            <i class="fas fa-users"></i>
                            <div>
                                <small>Guests</small>
                                <strong>${booking.guests}</strong>
                            </div>
                        </div>
                        
                        <div class="info-item">
                            <i class="fas fa-credit-card"></i>
                            <div>
                                <small>Total</small>
                                <strong>R${booking.totalAmount.toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
                    
                    <div class="booking-details">
                        <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                        <p><strong>Booked on:</strong> ${formatDate(booking.bookingDate)}</p>
                        <p><strong>Payment:</strong> ${booking.paymentMethod}</p>
                        ${booking.specialRequests ? 
                            `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
                    </div>
                </div>
                
                <div class="booking-card-actions">
                    ${isUpcoming ? `
                        <button onclick="cancelBooking('${booking.bookingId}')" class="cancel-btn">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button onclick="printBooking('${booking.bookingId}')" class="print-btn">
                            <i class="fas fa-print"></i> Print
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    bookingsList.innerHTML = bookingsHTML;
}

function loadProfile() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    if (bookings.length === 0) return;
    
    const userEmail = getLastBookingEmail();
    const userBooking = bookings.find(b => b.email === userEmail);
    
    if (userBooking) {
        document.getElementById('profileFirstName').value = userBooking.firstName;
        document.getElementById('profileLastName').value = userBooking.lastName;
        document.getElementById('profileEmail').value = userBooking.email;
        document.getElementById('profilePhone').value = userBooking.phone;
    }
}

function saveProfile() {
    // In a real application, this would save to a server
    alert('Profile saved! (Note: This is a prototype. In a real app, this would save to a database.)');
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId + 'Section').classList.add('active');
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    event.currentTarget.classList.add('active');
}

function refreshBookings() {
    loadBookings();
    alert('Bookings refreshed!');
}

function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const bookingIndex = bookings.findIndex(b => b.bookingId === bookingId);
        
        if (bookingIndex !== -1) {
            bookings[bookingIndex].status = 'cancelled';
            localStorage.setItem('bookings', JSON.stringify(bookings));
            loadBookings();
            alert('Booking cancelled successfully!');
        }
    }
}

function printBooking(bookingId) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const booking = bookings.find(b => b.bookingId === bookingId);
    
    if (booking) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Booking Confirmation - ${booking.bookingId}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .booking-details { margin: 20px 0; }
                        .detail-item { margin: 10px 0; }
                        .footer { margin-top: 50px; text-align: center; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>La D Da Lodge</h1>
                        <h2>Booking Confirmation</h2>
                    </div>
                    
                    <div class="booking-details">
                        <h3>Booking Information</h3>
                        <div class="detail-item"><strong>Booking ID:</strong> ${booking.bookingId}</div>
                        <div class="detail-item"><strong>Guest Name:</strong> ${booking.firstName} ${booking.lastName}</div>
                        <div class="detail-item"><strong>Dates:</strong> ${formatDate(booking.checkin)} to ${formatDate(booking.checkout)}</div>
                        <div class="detail-item"><strong>Room Type:</strong> ${booking.roomTypeName}</div>
                        <div class="detail-item"><strong>Guests:</strong> ${booking.guests}</div>
                        <div class="detail-item"><strong>Total Amount:</strong> R${booking.totalAmount.toFixed(2)}</div>
                    </div>
                    
                    <div class="footer">
                        <p>Thank you for choosing La D Da Lodge!</p>
                        <p>Contact: bookings@laddalodge.co.za | +27 53 123 4567</p>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}

function getLastBookingEmail() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    return bookings.length > 0 ? bookings[bookings.length - 1].email : null;
}

function addDashboardStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .dashboard-page {
            padding: 120px 0 60px;
            min-height: 100vh;
            background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 100%);
        }
        
        .dashboard-container {
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        @media (max-width: 992px) {
            .dashboard-container {
                grid-template-columns: 1fr;
            }
        }
        
        .dashboard-sidebar {
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            padding: 2rem;
            height: fit-content;
        }
        
        .user-info {
            text-align: center;
            padding-bottom: 2rem;
            border-bottom: 2px solid var(--light-blue);
            margin-bottom: 2rem;
        }
        
        .user-avatar {
            width: 80px;
            height: 80px;
            background: var(--light-blue);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            font-size: 2rem;
            color: var(--primary-blue);
        }
        
        .dashboard-nav {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .nav-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            text-decoration: none;
            color: var(--text-dark);
            border-radius: var(--border-radius);
            transition: all 0.3s;
        }
        
        .nav-item:hover {
            background: var(--light-blue);
        }
        
        .nav-item.active {
            background: var(--primary-blue);
            color: white;
        }
        
        .nav-item i {
            width: 20px;
            text-align: center;
        }
        
        .dashboard-content {
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            padding: 2rem;
        }
        
        .dashboard-section {
            display: none;
        }
        
        .dashboard-section.active {
            display: block;
        }
        
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--light-blue);
        }
        
        .refresh-btn {
            background: var(--accent-blue);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .bookings-list {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        
        .no-bookings {
            text-align: center;
            padding: 3rem;
        }
        
        .no-bookings i {
            font-size: 4rem;
            color: #ccc;
            margin-bottom: 1rem;
        }
        
        .booking-card {
            border: 2px solid #eee;
            border-radius: var(--border-radius);
            overflow: hidden;
        }
        
        .booking-card.upcoming {
            border-left: 4px solid var(--veld-green);
        }
        
        .booking-card.past {
            border-left: 4px solid #6c757d;
        }
        
        .booking-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            background: var(--light-blue);
        }
        
        .booking-status {
            padding: 0.3rem 1rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .booking-status.confirmed {
            background: #d4edda;
            color: #155724;
        }
        
        .booking-status.cancelled {
            background: #f8d7da;
            color: #721c24;
        }
        
        .booking-card-body {
            padding: 1.5rem;
        }
        
        .booking-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .info-item {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .info-item i {
            font-size: 1.5rem;
            color: var(--accent-blue);
        }
        
        .booking-details {
            padding: 1rem;
            background: #f8f9fa;
            border-radius: var(--border-radius);
        }
        
        .booking-details p {
            margin: 0.5rem 0;
        }
        
        .booking-card-actions {
            padding: 1rem 1.5rem;
            border-top: 1px solid #eee;
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
        }
        
        .cancel-btn, .print-btn {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: var(--border-radius);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .cancel-btn {
            background: #dc3545;
            color: white;
        }
        
        .print-btn {
            background: #6c757d;
            color: white;
        }
        
        .profile-form {
            max-width: 600px;
        }
    `;
    document.head.appendChild(style);
}