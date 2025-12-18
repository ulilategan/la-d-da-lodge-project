document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const checkin = urlParams.get('checkin');
    const checkout = urlParams.get('checkout');
    const roomType = urlParams.get('type');
    const guests = urlParams.get('guests') || 1;
    
    // Initialize booking summary
    updateBookingSummary(checkin, checkout, roomType, guests);
    
    // Set min date for checkin
    const today = new Date().toISOString().split('T')[0];
    if (checkin) {
        document.getElementById('checkin')?.setAttribute('min', today);
    }
    
    // Handle booking form submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processBooking(checkin, checkout, roomType, guests);
        });
    }
    
    // Add back button functionality
    document.getElementById('modifyDates')?.addEventListener('click', function() {
        window.history.back();
    });
});

function updateBookingSummary(checkin, checkout, roomType, guests) {
    const summaryElement = document.getElementById('bookingSummary');
    if (!summaryElement) return;
    
    const rooms = JSON.parse(localStorage.getItem('rooms') || '{}');
    const room = rooms[roomType];
    
    if (!room) {
        summaryElement.innerHTML = '<p>Invalid room selection. Please go back and try again.</p>';
        return;
    }
    
    const nights = calculateDays(checkin, checkout);
    const totalPrice = room.price * nights * parseInt(guests);
    
    const summaryHTML = `
        <div class="summary-header">
            <h2>Your Booking Details</h2>
            <button id="modifyDates" class="modify-btn">
                <i class="fas fa-edit"></i> Modify
            </button>
        </div>
        
        <div class="summary-details">
            <div class="summary-item">
                <span class="summary-label">Room Type:</span>
                <span class="summary-value">${room.type}</span>
            </div>
            
            <div class="summary-item">
                <span class="summary-label">Check-in:</span>
                <span class="summary-value">${formatDate(checkin)}</span>
            </div>
            
            <div class="summary-item">
                <span class="summary-label">Check-out:</span>
                <span class="summary-value">${formatDate(checkout)}</span>
            </div>
            
            <div class="summary-item">
                <span class="summary-label">Nights:</span>
                <span class="summary-value">${nights}</span>
            </div>
            
            <div class="summary-item">
                <span class="summary-label">Guests:</span>
                <span class="summary-value">${guests}</span>
            </div>
            
            <div class="summary-item">
                <span class="summary-label">Price per person per night:</span>
                <span class="summary-value">R${room.price.toFixed(2)}</span>
            </div>
            
            <div class="summary-divider"></div>
            
            <div class="summary-item total">
                <span class="summary-label">Total Amount:</span>
                <span class="summary-value">R${totalPrice.toFixed(2)}</span>
            </div>
            
            <div class="room-description">
                <h4>Room Includes:</h4>
                <p>${room.description}</p>
                <ul>
                    <li><i class="fas fa-shower"></i> En-suite shower</li>
                    <li><i class="fas fa-tv"></i> OpenView TV</li>
                    <li><i class="fas fa-coffee"></i> Tea/Coffee facilities</li>
                </ul>
            </div>
        </div>
    `;
    
    summaryElement.innerHTML = summaryHTML;
    
    // Add CSS for booking page
    const style = document.createElement('style');
    style.textContent = `
        .booking-page {
            padding: 120px 0 60px;
            min-height: 100vh;
        }
        
        .page-title {
            text-align: center;
            color: var(--primary-blue);
            margin-bottom: 3rem;
            font-family: 'Montserrat', sans-serif;
        }
        
        .booking-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        @media (max-width: 992px) {
            .booking-container {
                grid-template-columns: 1fr;
            }
        }
        
        .booking-summary {
            background: white;
            padding: 2rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            height: fit-content;
        }
        
        .summary-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--light-blue);
        }
        
        .modify-btn {
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
        
        .summary-item {
            display: flex;
            justify-content: space-between;
            margin: 1rem 0;
            padding: 0.5rem 0;
            border-bottom: 1px solid #eee;
        }
        
        .summary-item.total {
            border-bottom: none;
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--veld-green);
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 2px solid var(--light-blue);
        }
        
        .summary-divider {
            height: 1px;
            background: #ddd;
            margin: 1.5rem 0;
        }
        
        .room-description {
            margin-top: 2rem;
            padding: 1.5rem;
            background: var(--light-blue);
            border-radius: var(--border-radius);
        }
        
        .room-description ul {
            list-style: none;
            margin-top: 1rem;
        }
        
        .room-description li {
            margin: 0.5rem 0;
            display: flex;
            align-items: center;
        }
        
        .room-description i {
            color: var(--accent-blue);
            margin-right: 0.5rem;
        }
        
        .detailed-booking-form {
            background: white;
            padding: 2rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
        }
        
        .detailed-booking-form h2 {
            color: var(--primary-blue);
            margin: 2rem 0 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid var(--light-blue);
        }
        
        .detailed-booking-form h2:first-child {
            margin-top: 0;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        
        @media (max-width: 576px) {
            .form-row {
                grid-template-columns: 1fr;
            }
        }
        
        .terms-checkbox {
            margin: 2rem 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .terms-checkbox input {
            width: auto;
        }
        
        .form-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
        }
        
        .secondary-btn {
            background: #6c757d;
            color: white;
            padding: 0.8rem 2rem;
            border: none;
            border-radius: var(--border-radius);
            cursor: pointer;
            font-weight: 600;
        }
        
        .secondary-btn:hover {
            background: #5a6268;
        }
        
        textarea {
            padding: 0.8rem;
            border: 2px solid #ddd;
            border-radius: var(--border-radius);
            font-family: 'Poppins', sans-serif;
            resize: vertical;
        }
        
        textarea:focus {
            outline: none;
            border-color: var(--accent-blue);
        }
    `;
    document.head.appendChild(style);
}

function processBooking(checkin, checkout, roomType, guests) {
    // Collect form data
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        idNumber: document.getElementById('idNumber').value,
        address: document.getElementById('address').value,
        specialRequests: document.getElementById('specialRequests').value,
        paymentMethod: document.getElementById('paymentMethod').value,
        checkin: checkin,
        checkout: checkout,
        roomType: roomType,
        guests: parseInt(guests),
        bookingDate: new Date().toISOString(),
        bookingId: 'LDD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase(),
        status: 'confirmed'
    };
    
    // Get room info for pricing
    const rooms = JSON.parse(localStorage.getItem('rooms') || '{}');
    const room = rooms[roomType];
    
    if (!room) {
        alert('Error: Room type not found');
        return;
    }
    
    // Calculate total
    const nights = calculateDays(checkin, checkout);
    formData.totalAmount = room.price * nights * parseInt(guests);
    formData.roomPrice = room.price;
    formData.nights = nights;
    formData.roomTypeName = room.type;
    
    // Save booking to localStorage
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(formData);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // Show confirmation
    showBookingConfirmation(formData);
}

function showBookingConfirmation(bookingData) {
    const confirmationHTML = `
        <div class="confirmation-modal">
            <div class="confirmation-content">
                <div class="confirmation-header">
                    <i class="fas fa-check-circle"></i>
                    <h2>Booking Confirmed!</h2>
                </div>
                
                <div class="confirmation-body">
                    <p>Thank you for booking with La D Da Lodge!</p>
                    
                    <div class="confirmation-details">
                        <div class="detail-item">
                            <strong>Booking ID:</strong> ${bookingData.bookingId}
                        </div>
                        <div class="detail-item">
                            <strong>Name:</strong> ${bookingData.firstName} ${bookingData.lastName}
                        </div>
                        <div class="detail-item">
                            <strong>Dates:</strong> ${formatDate(bookingData.checkin)} to ${formatDate(bookingData.checkout)}
                        </div>
                        <div class="detail-item">
                            <strong>Total Amount:</strong> R${bookingData.totalAmount.toFixed(2)}
                        </div>
                    </div>
                    
                    <div class="confirmation-instructions">
                        <h4>What's Next?</h4>
                        <p>You will receive a confirmation email shortly. Please keep your booking ID for reference.</p>
                    </div>
                </div>
                
                <div class="confirmation-actions">
                    <button onclick="printConfirmation()" class="secondary-btn">
                        <i class="fas fa-print"></i> Print
                    </button>
                    <button onclick="viewDashboard()" class="cta-button">
                        View My Bookings
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.innerHTML = confirmationHTML;
    document.body.appendChild(modal);
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .confirmation-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        }
        
        .confirmation-content {
            background: white;
            padding: 3rem;
            border-radius: var(--border-radius);
            max-width: 500px;
            width: 90%;
            text-align: center;
        }
        
        .confirmation-header i {
            font-size: 4rem;
            color: var(--veld-green);
            margin-bottom: 1rem;
        }
        
        .confirmation-header h2 {
            color: var(--primary-blue);
            margin-bottom: 2rem;
        }
        
        .confirmation-details {
            text-align: left;
            background: var(--light-blue);
            padding: 1.5rem;
            border-radius: var(--border-radius);
            margin: 1.5rem 0;
        }
        
        .detail-item {
            margin: 0.5rem 0;
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .detail-item:last-child {
            border-bottom: none;
        }
        
        .confirmation-instructions {
            margin: 1.5rem 0;
            padding: 1.5rem;
            background: #fff8e1;
            border-radius: var(--border-radius);
            border-left: 4px solid var(--veld-gold);
        }
        
        .confirmation-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
        }
    `;
    document.head.appendChild(style);
}

function printConfirmation() {
    window.print();
}

function viewDashboard() {
    window.location.href = 'dashboard.html';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}