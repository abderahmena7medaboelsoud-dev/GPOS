// 1. قاعدة البيانات المحلية الافتراضية للمشروع (Database Seed)
window.GPOS_STATE = {
    currentUser: null,
    stats: { members: 40, progress: "75%", tasksCount: 12 },
    tasks: [
        { id: 1, title: "جمع عينات التربة وتحليل البيانات ميدانياً", status: "قيد التنفيذ", group: "مجموعة العمل الميداني كفر الشيخ" },
        { id: 2, title: "مراجعة الورقة البحثية الخاصة بتطبيقات الأسمدة النانوية", status: "مكتمل", group: "مجموعة الكتابة والتوثيق" },
        { id: 3, title: "اختبار كفاءة بولي أكريلات الصوديوم في امتصاص الماء", status: "جديد", group: "مجموعة التجارب المعملية" }
    ],
    messages: [
        { sender: "د. أحمد الوكيل", text: "يا شباب، يرجى تحديث تقرير الأداء الميداني الليلة.", type: "rcv" },
        { sender: "عبدالرحمن (القائد)", text: "جاهز يا دكتور، تم التحديث في لوحة التحكم وجاري رفعه للمراجعة.", type: "sent" }
    ]
};

// 2. محرك تشغيل النظام عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // تبديل الوضع الليلي والنهاري
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
    });

    // إعداد نموذج تسجيل الدخول
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        if (username.toLowerCase() === 'leader') {
            window.GPOS_STATE.currentUser = "عبدالرحمن أحمد Aboelsoud";
            document.getElementById('auth-container').classList.add('hidden');
            document.getElementById('app-container').classList.remove('hidden');
            renderView('dashboard');
        } else {
            alert('اسم المستخدم تجريبي للـ Leader فقط، اكتب كلمة: leader');
        }
    });

    // زر خروج
    document.getElementById('logout-btn').addEventListener('click', () => {
        window.GPOS_STATE.currentUser = null;
        document.getElementById('app-container').classList.add('hidden');
        document.getElementById('auth-container').classList.remove('hidden');
    });

    // التنقل بين القوائم الجانبية
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            renderView(item.getAttribute('data-view'));
        });
    });
}

// 3. موجه العرض الديناميكي (Router Views)
function renderView(viewName) {
    const wrapper = document.getElementById('view-wrapper');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    if (viewName === 'dashboard') {
        wrapper.innerHTML = `
            <h2>مرحباً بك في لوحة قيادة نظام تتبع مشروع التخرج</h2>
            <div class="metrics-grid">
                <div class="card"><h4>الطلاب المسجلين بالنظام</h4><h3>${window.GPOS_STATE.stats.members} طالب</h3></div>
                <div class="card"><h4>إجمالي نسبة الإنجاز المخطط</h4><h3>${window.GPOS_STATE.stats.progress}</h3></div>
                <div class="card"><h4>المهام البحثية النشطة</h4><h3>${window.GPOS_STATE.stats.tasksCount} مهمة</h3></div>
            </div>
            <div class="card">
                <h4>معدل الأداء الفعلي للمجموعات العابرة (Task Forces)</h4>
                <div class="progress-wrapper"><div class="progress-fill"></div></div>
            </div>
        `;
    } 
    else if (viewName === 'tasks') {
        let rows = window.GPOS_STATE.tasks.map(t => `
            <tr><td><b>${t.title}</b></td><td><span class="badge">${t.group}</span></td><td>${t.status}</td></tr>
        `).join('');
        wrapper.innerHTML = `
            <div class="card">
                <h2>لوحة توزيع المهام التكتيكية والديناميكية</h2>
                <table>
                    <thead><tr><th>المهمة البحثية</th><th>المجموعة المكلفة</th><th>الحالة الحالية</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } 
    else if (viewName === 'chat') {
        let msgs = window.GPOS_STATE.messages.map(m => `
            <div class="msg ${m.type}"><b>${m.sender}:</b> ${m.text}</div>
        `).join('');
        wrapper.innerHTML = `
            <div class="card">
                <h2>نظام المحادثة والاتصال الفوري المتخطي للصلاحيات</h2>
                <div class="chat-box">${msgs}</div>
                <div class="input-group">
                    <input type="text" id="chat-input" placeholder="اكتب رسالة سريعة هنا...">
                    <button class="btn btn-primary" onclick="alert('تم تحديث الـ State وإرسال الرسالة لقناة المشروع الموحدة!')">إرسال</button>
                </div>
            </div>
        `;
    } 
    else if (viewName === 'research') {
        wrapper.innerHTML = `
            <h2>مركز المخرجات والتحليلات البحثية</h2>
            <div class="card" style="margin-top:1rem;">
                <p>📝 <b>مستند المقترح البحثي (Proposal_Final_v2.pdf)</b> <span class="badge" style="background:#10b981; color:white;">معتمد بنجاح</span></p>
                <hr style="margin:1rem 0; border-color:var(--border-color);">
                <p>📝 <b>مسودة مراجعة المراجع (Literature_Review_Draft.docx)</b> <span class="badge" style="background:#f59e0b; color:white;">قيد المراجعة الفنية</span></p>
            </div>
        `;
    } 
    else if (viewName === 'evaluations') {
        wrapper.innerHTML = `
            <h2>لوحة التقييم الأسبوعي والشهري المؤتمت لقائد الفريق والمشرف</h2>
            <div class="card" style="margin-top:1rem;">
                <table>
                    <thead><tr><th>اسم الطالب</th><th>الدور / التكتيك الحركي</th><th>نسبة المشاركة</th><th>التقييم التلقائي</th></tr></thead>
                    <tbody>
                        <tr><td>عبدالرحمن أحمد Aboelsoud</td><td>قائد عام المشروع (Project Leader)</td><td>100%</td><td>100/100</td></tr>
                        <tr><td>طالب مستخدم افتراضي</td><td>مجموعة التحليل الإحصائي والدعم</td><td>90%</td><td>92/100</td></tr>
                    </tbody>
                </table>
            </div>
        `;
    }
}
