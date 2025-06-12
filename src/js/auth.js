// بيانات التطبيق
let managers = JSON.parse(localStorage.getItem('luxid_managers')) || [];
let currencies = JSON.parse(localStorage.getItem('luxid_currencies')) || [];
let currentUser = localStorage.getItem('luxid_current_user') || null;

// العناصر المشتركة
const logoutButtons = document.querySelectorAll('.logout-btn, #wallet-logout');
logoutButtons.forEach(button => {
    if (button) {
        button.addEventListener('click', logout);
    }
});

// وظيفة تسجيل الخروج
function logout() {
    localStorage.removeItem('luxid_current_user');
    window.location.href = 'index.html';
}

// الصفحة الحالية
const currentPage = window.location.pathname.split('/').pop();

// تسجيل الدخول
async function login(username, password) {
  try {
    const response = await fetch('/.netlify/functions/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.success) {
      if (data.isAdmin) {
        localStorage.setItem('luxid_current_user', 'admin');
        window.location.href = 'admin.html';
      } else {
        localStorage.setItem('luxid_current_user', username);
        window.location.href = 'wallet.html';
      }
    } else {
      document.getElementById('login-error').textContent = data.message || 'Invalid credentials';
    }
  } catch (error) {
    console.error('Login error:', error);
    document.getElementById('login-error').textContent = 'Login failed. Please try again.';
  }
}

// في صفحة تسجيل الدخول
if (currentPage === 'index.html') {
  const loginForm = document.getElementById('login-form');
  
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    login(username, password);
  });
}
        // التحقق من بيانات المدير
        if (username === 'Admin' && password === '666999008772+#;#+{|{{€{') {
            localStorage.setItem('luxid_current_user', 'admin');
            window.location.href = 'admin.html';
            return;
        }
        
        // التحقق من بيانات المدراء
        const manager = managers.find(m => m.username === username && m.password === password);
        if (manager) {
            localStorage.setItem('luxid_current_user', username);
            window.location.href = 'wallet.html';
            return;
        }
        
        errorMessage.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
    });
}

// لوحة التحكم
if (currentPage === 'admin.html') {
    // التحقق من تسجيل الدخول كمدير
    if (currentUser !== 'admin') {
        window.location.href = 'index.html';
    }
    
    // تحديث ترحيب المستخدم
    const welcomeUser = document.getElementById('welcome-user');
    if (welcomeUser) {
        welcomeUser.textContent = `مرحباً، ${currentUser}`;
    }
    
    // إنشاء حساب جديد
    const createForm = document.getElementById('create-account-form');
    const managersList = document.getElementById('managers-list');
    
    createForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('new-username').value;
        const password = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (password !== confirmPassword) {
            alert('كلمتا المرور غير متطابقتين');
            return;
        }
        
        if (managers.some(m => m.username === username)) {
            alert('اسم المستخدم موجود مسبقاً');
            return;
        }
        
        managers.push({ username, password });
        localStorage.setItem('luxid_managers', JSON.stringify(managers));
        renderManagersList();
        
        // إعادة تعيين النموذج
        createForm.reset();
        alert(`تم إنشاء حساب المدير ${username} بنجاح`);
    });
    
    // عرض قائمة المدراء
    function renderManagersList() {
        managersList.innerHTML = '';
        
        managers.forEach(manager => {
            if (manager.username === 'admin') return;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${manager.username}</td>
                <td>${new Date().toLocaleDateString('ar-EG')}</td>
                <td>
                    <button class="delete-btn" data-user="${manager.username}">حذف</button>
                </td>
            `;
            managersList.appendChild(row);
        });
        
        // إضافة معالجات الأحداث لأزرار الحذف
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const username = this.getAttribute('data-user');
                if (confirm(`هل أنت متأكد من حذف حساب ${username}؟`)) {
                    managers = managers.filter(m => m.username !== username);
                    localStorage.setItem('luxid_managers', JSON.stringify(managers));
                    renderManagersList();
                }
            });
        });
    }
    
    renderManagersList();
}

// صفحة المحفظة
if (currentPage === 'wallet.html') {
    // التحقق من تسجيل الدخول
    if (!currentUser || currentUser === 'admin') {
        window.location.href = 'index.html';
    }
    
    // تحديث ترحيب المستخدم
    const welcomeUser = document.getElementById('welcome-user');
    if (welcomeUser) {
        welcomeUser.textContent = `مرحباً، ${currentUser}`;
    }
    
    // العناصر
    const addCurrencyBtn = document.getElementById('add-currency-btn');
    const cancelAddBtn = document.getElementById('cancel-add');
    const currencyForm = document.getElementById('currency-form');
    const addCurrencyForm = document.getElementById('add-currency-form');
    const currenciesList = document.getElementById('currencies-list');
    const totalBalanceElement = document.getElementById('total-balance');
    
    // عرض/إخفاء نموذج إضافة عملة
    addCurrencyBtn.addEventListener('click', function() {
        addCurrencyForm.classList.remove('hidden');
    });
    
    cancelAddBtn.addEventListener('click', function() {
        addCurrencyForm.classList.add('hidden');
    });
    
    // إضافة عملة جديدة
    currencyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('currency-name').value;
        const amount = parseFloat(document.getElementById('currency-amount').value);
        
        currencies.push({
            name,
            amount,
            date: new Date().toISOString()
        });
        
        localStorage.setItem('luxid_currencies', JSON.stringify(currencies));
        renderCurrenciesList();
        updateTotalBalance();
        
        // إعادة تعيين النموذج وإخفاؤه
        currencyForm.reset();
        addCurrencyForm.classList.add('hidden');
    });
    
    // عرض قائمة العملات
    function renderCurrenciesList() {
        currenciesList.innerHTML = '';
        
        currencies.forEach((currency, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${currency.name}</td>
                <td>${currency.amount.toLocaleString('ar-EG')}</td>
                <td>$${(currency.amount).toLocaleString('ar-EG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>
                    <button class="edit-btn" data-index="${index}">تعديل</button>
                    <button class="delete-currency-btn" data-index="${index}">حذف</button>
                </td>
            `;
            currenciesList.appendChild(row);
        });
        
        // إضافة معالجات الأحداث للأزرار
        document.querySelectorAll('.delete-currency-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                if (confirm(`هل أنت متأكد من حذف ${currencies[index].name}؟`)) {
                    currencies.splice(index, 1);
                    localStorage.setItem('luxid_currencies', JSON.stringify(currencies));
                    renderCurrenciesList();
                    updateTotalBalance();
                }
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                const currency = currencies[index];
                
                document.getElementById('currency-name').value = currency.name;
                document.getElementById('currency-amount').value = currency.amount;
                
                currencies.splice(index, 1);
                localStorage.setItem('luxid_currencies', JSON.stringify(currencies));
                renderCurrenciesList();
                updateTotalBalance();
                
                addCurrencyForm.classList.remove('hidden');
            });
        });
    }
    
    // تحديث إجمالي الرصيد
    function updateTotalBalance() {
        const total = currencies.reduce((sum, currency) => sum + currency.amount, 0);
        totalBalanceElement.textContent = `$${total.toLocaleString('ar-EG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
    
    // تحديث زر التحديث
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            renderCurrenciesList();
            updateTotalBalance();
            alert('تم تحديث البيانات بنجاح');
        });
    }
    
    // التهيئة الأولية
    renderCurrenciesList();
    updateTotalBalance();
}

// منع التكبير والتصغير المفرط
document.addEventListener('touchmove', function(event) {
    if (event.scale !== 1) {
        event.preventDefault();
    }
}, { passive: false });

// تهيئة بيانات المثال إذا لم تكن موجودة
if (!localStorage.getItem('luxid_currencies') && currentPage === 'wallet.html') {
    currencies = [
        { name: 'الدولار الأمريكي', amount: 50000 },
        { name: 'اليورو الأوروبي', amount: 30000 },
        { name: 'الجنيه الإسترليني', amount: 20000 }
    ];
    localStorage.setItem('luxid_currencies', JSON.stringify(currencies));
}

if (!localStorage.getItem('luxid_managers') && currentPage === 'admin.html') {
    managers = [
        { username: 'manager1', password: 'pass123' },
        { username: 'manager2', password: 'pass456' }
    ];
    localStorage.setItem('luxid_managers', JSON.stringify(managers));
}
