document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin dashboard
    initializeAdmin();
    
    // Load all sections
    loadDashboard();
    loadAllBookings();
    loadBlockedDates();
    loadReports();
    
    // Set up forms
    const blockDatesForm = document.getElementById('blockDatesForm');
    if (blockDatesForm) {
        blockDatesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addBlockedDates();
        });
    }
    
    const adminSettingsForm = document.getElementById('adminSettingsForm');
    if (adminSettingsForm) {
        adminSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveSettings();
        });
    }
    
    // Set min date for block dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('blockStartDate').min = today;
    document.getElementById('blockStartDate').addEventListener('change', function() {
        document.getElementById('blockEndDate').min = this.value;
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchBookings');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchBookings(this.value);
        });
    }
    
    // Add admin-specific styles
    addAdminStyles();
});

function initializeAdmin() {
    // Check if admin data exists
    if (!localStorage.getItem('adminSettings')) {
        const defaultSettings = {
            familyRoomRate: 450,
            selfCateringRate: 650,
            standardRoomRate: 350,
            phone: '+27 53 123 4567',
            email: 'bookings@laddalodge.co.za'
        };
        localStorage.setItem('adminSettings', JSON.stringify(defaultSettings));
    }
}

function loadDashboard() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // Update stats
    document.getElementById('totalBookings').textContent = bookings.length;
    
    // Calculate active guests (bookings in the future)
    const today = new Date();
    const activeGuests = bookings.filter(booking => {
        const checkinDate = new Date(booking.checkin);
        const checkoutDate = new Date(booking.checkout);
        return checkoutDate >= today && booking.status === 'confirmed';
    }).reduce((sum, booking) => sum + booking.guests, 0);
    
    document.getElementById('activeGuests').textContent = activeGuests;
    
    // Load recent bookings
    const recentBookings = bookings.slice(-5).reverse(); // Last 5 bookings
    const recentBookingsList = document.getElementById('recentBookingsList');
    
    if (recentBookings.length === 0) {
        recentBookingsList.innerHTML = '<p>No recent bookings found.</p>';
        return;
    }
    
    let html = '<table class="admin-table">';
    html += `
        <thead>
            <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Dates</th>
                <th>Room Type</th>
                <th>Amount</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    recentBookings.forEach(booking => {
        html += `
            <tr>
                <td>${booking.bookingId}</td>
                <td>${booking.firstName} ${booking.lastName}</td>
                <td>${formatDate(booking.checkin)} - ${formatDate(booking.checkout)}</td>
                <td>${booking.roomTypeName}</td>
                <td>R${booking.totalAmount.toFixed(2)}</td>
                <td><span class="status-badge ${booking.status}">${booking.status}</span></td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    recentBookingsList.innerHTML = html;
}

function loadAllBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const allBookingsList = document.getElementById('allBookingsList');
    
    if (bookings.length === 0) {
        allBookingsList.innerHTML = '<p>No bookings found.</p>';
        return;
    }
    
    let html = '<table class="admin-table">';
    html += `
        <thead>
            <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Contact</th>
                <th>Dates</th>
                <th>Room Type</th>
                <th>Guests</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    bookings.reverse().forEach(booking => { // Show newest first
        html += `
            <tr>
                <td>${booking.bookingId}</td>
                <td>${booking.firstName} ${booking.lastName}</td>
                <td>${booking.email}<br>${booking.phone}</td>
                <td>${formatDate(booking.checkin)}<br>to ${formatDate(booking.checkout)}</td>
                <td>${booking.roomTypeName}</td>
                <td>${booking.guests}</td>
                <td>R${booking.totalAmount.toFixed(2)}</td>
                <td><span class="status-badge ${booking.status}">${booking.status}</span></td>
                <td>
                    <button onclick="viewBookingDetails('${booking.bookingId}')" class="action-btn view">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editBooking('${booking.bookingId}')" class="action-btn edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteBooking('${booking.bookingId}')" class="action-btn delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    allBookingsList.innerHTML = html;
}

function loadBlockedDates() {
    const blockedDates = JSON.parse(localStorage.getItem('blockedDates') || '[]');
    const blockedDatesList = document.getElementById('blockedDatesList');
    
    if (blockedDates.length === 0) {
        blockedDatesList.innerHTML = '<p>No dates are currently blocked.</p>';
        return;
    }
    
    let html = '<div class="blocked-dates-grid">';
    
    blockedDates.forEach((block, index) => {
        const startDate = new Date(block.startDate);
        const endDate = new Date(block.endDate);
        const today = new Date();
        const isActive = endDate >= today;
        
        html += `
            <div class="blocked-date-card ${isActive ? 'active' : 'expired'}">
                <div class="blocked-date-header">
                    <h4>${formatDate(block.startDate)} - ${formatDate(block.endDate)}</h4>
                    <span class="block-status">${isActive ? 'Active' : 'Expired'}</span>
                </div>
                
                <div class="blocked-date-body">
                    <p><strong>Reason:</strong> ${block.reason || 'No reason specified'}</p>
                    <p><strong>Days Blocked:</strong> ${calculateDays(block.startDate, block.endDate) + 1}</p>
                </div>
                
                <div class="blocked-date-actions">
                    <button onclick="removeBlockedDate(${index})" class="remove-block-btn">
                        <i class="fas fa-times"></i> Remove
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    blockedDatesList.innerHTML = html;
}

function loadReports() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // Calculate total revenue
    const totalRevenue = bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, booking) => sum + booking.totalAmount, 0);
    
    document.getElementById('totalRevenue').textContent = 'R' + totalRevenue.toFixed(2);
    
    // Calculate room type popularity
    const roomStats = {};
    bookings.forEach(booking => {
        if (booking.status === 'confirmed') {
            roomStats[booking.roomType] = (roomStats[booking.roomType] || 0) + 1;
        }
    });
    
    const roomStatsElement = document.getElementById('roomStats');
    let statsHTML = '<ul class="room-stats-list">';
    
    for (const [roomType, count] of Object.entries(roomStats)) {
        const roomNames = {
            'family': 'Family Room',
            'selfcatering': 'Self Catering',
            'standard': 'Standard Room'
        };
        statsHTML += `<li>${roomNames[roomType]}: ${count} bookings</li>`;
    }
    
    statsHTML += '</ul>';
    roomStatsElement.innerHTML = statsHTML;
}

function showAdminSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId + 'Section').classList.add('active');
    
    // Update nav items
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    event.currentTarget.classList.add('active');
}

function addBlockedDates() {
    const startDate = document.getElementById('blockStartDate').value;
    const endDate = document.getElementById('blockEndDate').value;
    const reason = document.getElementById('blockReason').value;
    
    if (!startDate || !endDate) {
        alert('Please select both start and end dates.');
        return;
    }
    
    if (new Date(endDate) < new Date(startDate)) {
        alert('End date must be after start date.');
        return;
    }
    
    const blockedDates = JSON.parse(localStorage.getItem('blockedDates') || '[]');
    blockedDates.push({
        startDate,
        endDate,
        reason,
        addedDate: new Date().toISOString()
    });
    
    localStorage.setItem('blockedDates', JSON.stringify(blockedDates));
    
    // Clear form
    document.getElementById('blockDatesForm').reset();
    
    // Reload blocked dates
    loadBlockedDates();
    
    alert('Dates have been blocked successfully!');
}

function removeBlockedDate(index) {
    if (confirm('Are you sure you want to remove this block?')) {
        const blockedDates = JSON.parse(localStorage.getItem('blockedDates') || '[]');
        blockedDates.splice(index, 1);
        localStorage.setItem('blockedDates', JSON.stringify(blockedDates));
        loadBlockedDates();
    }
}

function viewBookingDetails(bookingId) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const booking = bookings.find(b => b.bookingId === bookingId);
    
    if (booking) {
        const details = `
Booking ID: ${booking.bookingId}
Guest: ${booking.firstName} ${booking.lastName}
Email: ${booking.email}
Phone: ${booking.phone}
Dates: ${formatDate(booking.checkin)} to ${formatDate(booking.checkout)}
Room Type: ${booking.roomTypeName}
Guests: ${booking.guests}
Nights: ${booking.nights}
Total: R${booking.totalAmount.toFixed(2)}
Payment: ${booking.paymentMethod}
Status: ${booking.status}
Special Requests: ${booking.specialRequests || 'None'}
        `;
        
        alert(details);
    }
}

function editBooking(bookingId) {
    // In a real application, this would open an edit form
    alert('Edit functionality would open here. In this prototype, you can delete and re-create the booking.');
}

function deleteBooking(bookingId) {
    if (confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const updatedBookings = bookings.filter(b => b.bookingId !== bookingId);
        localStorage.setItem('bookings', JSON.stringify(updatedBookings));
        loadDashboard();
        loadAllBookings();
        loadReports();
        alert('Booking deleted successfully!');
    }
}

function searchBookings(query) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const filteredBookings = bookings.filter(booking => 
        booking.bookingId.toLowerCase().includes(query.toLowerCase()) ||
        booking.firstName.toLowerCase().includes(query.toLowerCase()) ||
        booking.lastName.toLowerCase().includes(query.toLowerCase()) ||
        booking.email.toLowerCase().includes(query.toLowerCase()) ||
        booking.roomTypeName.toLowerCase().includes(query.toLowerCase())
    );
    
    const allBookingsList = document.getElementById('allBookingsList');
    
    if (filteredBookings.length === 0) {
        allBookingsList.innerHTML = '<p>No bookings found matching your search.</p>';
        return;
    }
    
    let html = '<table class="admin-table">';
    html += `
        <thead>
            <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Contact</th>
                <th>Dates</th>
                <th>Room Type</th>
                <th>Guests</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    filteredBookings.reverse().forEach(booking => {
        html += `
            <tr>
                <td>${booking.bookingId}</td>
                <td>${booking.firstName} ${booking.lastName}</td>
                <td>${booking.email}<br>${booking.phone}</td>
                <td>${formatDate(booking.checkin)}<br>to ${formatDate(booking.checkout)}</td>
                <td>${booking.roomTypeName}</td>
                <td>${booking.guests}</td>
                <td>R${booking.totalAmount.toFixed(2)}</td>
                <td><span class="status-badge ${booking.status}">${booking.status}</span></td>
                <td>
                    <button onclick="viewBookingDetails('${booking.bookingId}')" class="action-btn view">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editBooking('${booking.bookingId}')" class="action-btn edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteBooking('${booking.bookingId}')" class="action-btn delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    allBookingsList.innerHTML = html;
}

function saveSettings() {
    const settings = {
        familyRoomRate: parseFloat(document.getElementById('familyRoomRate').value),
        selfCateringRate: parseFloat(document.getElementById('selfCateringRate').value),
        standardRoomRate: parseFloat(document.getElementById('standardRoomRate').value),
        phone: document.getElementById('adminPhone').value,
        email: document.getElementById('adminEmail').value
    };
    
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    // Update room rates in rooms data
    const rooms = JSON.parse(localStorage.getItem('rooms') || '{}');
    rooms.family.price = settings.familyRoomRate;
    rooms.selfcatering.price = settings.selfCateringRate;
    rooms.standard.price = settings.standardRoomRate;
    localStorage.setItem('rooms', JSON.stringify(rooms));
    
    alert('Settings saved successfully!');
}

function exportData() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const blockedDates = JSON.parse(localStorage.getItem('blockedDates') || '[]');
    
    const data = {
        bookings,
        blockedDates,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `ladda-lodge-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Data exported successfully!');
}

function clearAllData() {
    if (confirm('WARNING: This will delete ALL bookings and blocked dates. This action cannot be undone. Are you sure?')) {
        localStorage.removeItem('bookings');
        localStorage.removeItem('blockedDates');
        initializeStorage();
        loadDashboard();
        loadAllBookings();
        loadBlockedDates();
        loadReports();
        alert('All data has been cleared.');
    }
}

function addAdminStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .admin-page {
            padding: 120px 0 60px;
            min-height: 100vh;
            background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 100%);
        }
        
        .admin-header {
            margin-bottom: 2rem;
        }
        
        .admin-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }
        
        .stat-card {
            background: white;
            border-radius: var(--border-radius);
            padding: 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            box-shadow: var(--shadow);
        }
        
        .stat-card i {
            font-size: 2.5rem;
            color: var(--primary-blue);
        }
        
        .stat-card h3 {
            font-size: 2rem;
            color: var(--secondary-blue);
            margin: 0;
        }
        
        .stat-card p {
            color: #666;
            margin: 0;
        }
        
        .admin-container {
            display: grid;
            grid-template-columns: 250px 1fr;
            gap: 2rem;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        @media (max-width: 992px) {
            .admin-container {
                grid-template-columns: 1fr;
            }
        }
        
        .admin-sidebar {
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            padding: 1.5rem;
            height: fit-content;
        }
        
        .admin-nav {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-bottom: 2rem;
        }
        
        .admin-nav-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            text-decoration: none;
            color: var(--text-dark);
            border-radius: var(--border-radius);
            transition: all 0.3s;
            border: none;
            background: none;
            text-align: left;
            font-family: inherit;
            font-size: inherit;
            cursor: pointer;
        }
        
        .admin-nav-item:hover {
            background: var(--light-blue);
        }
        
        .admin-nav-item.active {
            background: var(--primary-blue);
            color: white;
        }
        
        .admin-nav-item i {
            width: 20px;
            text-align: center;
        }
        
        .admin-actions {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .admin-actions .admin-btn {
            padding: 0.8rem;
            border: none;
            border-radius: var(--border-radius);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            justify-content: center;
            font-weight: 600;
        }
        
        .admin-actions .admin-btn:first-child {
            background: var(--accent-blue);
            color: white;
        }
        
        .admin-actions .admin-btn.danger {
            background: #dc3545;
            color: white;
        }
        
        .admin-content {
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            padding: 2rem;
        }
        
        .admin-section {
            display: none;
        }
        
        .admin-section.active {
            display: block;
        }
        
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        
        .search-box {
            position: relative;
            width: 300px;
        }
        
        .search-box input {
            width: 100%;
            padding: 0.8rem 2.5rem 0.8rem 1rem;
            border: 2px solid #ddd;
            border-radius: var(--border-radius);
        }
        
        .search-box i {
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #666;
        }
        
        .admin-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .admin-table th,
        .admin-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .admin-table th {
            background: var(--light-blue);
            font-weight: 600;
            color: var(--primary-blue);
        }
        
        .admin-table tr:hover {
            background: #f8f9fa;
        }
        
        .status-badge {
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .status-badge.confirmed {
            background: #d4edda;
            color: #155724;
        }
        
        .status-badge.cancelled {
            background: #f8d7da;
            color: #721c24;
        }
        
        .action-btn {
            padding: 0.3rem 0.6rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin: 0 2px;
        }
        
        .action-btn.view {
            background: #17a2b8;
            color: white;
        }
        
        .action-btn.edit {
            background: #ffc107;
            color: black;
        }
        
        .action-btn.delete {
            background: #dc3545;
            color: white;
        }
        
        .block-dates-form {
            background: var(--light-blue);
            padding: 2rem;
            border-radius: var(--border-radius);
            margin-bottom: 3rem;
        }
        
        .section-description {
            color: #666;
            margin-bottom: 2rem;
        }
        
        .blocked-dates-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        
        .blocked-date-card {
            border: 2px solid #eee;
            border-radius: var(--border-radius);
            overflow: hidden;
        }
        
        .blocked-date-card.active {
            border-left: 4px solid #dc3545;
        }
        
        .blocked-date-card.expired {
            border-left: 4px solid #6c757d;
            opacity: 0.7;
        }
        
        .blocked-date-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: #f8f9fa;
        }
        
        .block-status {
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .blocked-date-card.active .block-status {
            background: #f8d7da;
            color: #721c24;
        }
        
        .blocked-date-card.expired .block-status {
            background: #e2e3e5;
            color: #383d41;
        }
        
        .blocked-date-body {
            padding: 1rem;
        }
        
        .blocked-date-actions {
            padding: 1rem;
            border-top: 1px solid #eee;
        }
        
        .remove-block-btn {
            width: 100%;
            padding: 0.5rem;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: var(--border-radius);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }
        
        .reports-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 2rem;
        }
        
        .report-card {
            background: var(--light-blue);
            padding: 2rem;
            border-radius: var(--border-radius);
        }
        
        .chart-placeholder {
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border-radius: var(--border-radius);
            margin-top: 1rem;
        }
        
        .room-stats-list {
            list-style: none;
            padding: 0;
        }
        
        .room-stats-list li {
            padding: 0.5rem 0;
            border-bottom: 1px solid #ddd;
        }
        
        .room-stats-list li:last-child {
            border-bottom: none;
        }
        
        .settings-form {
            max-width: 800px;
        }
        
        .settings-form h3 {
            margin: 2rem 0 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid var(--light-blue);
        }
        
        .settings-form h3:first-child {
            margin-top: 0;
        }
    `;
    document.head.appendChild(style);
}