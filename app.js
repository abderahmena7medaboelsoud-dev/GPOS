// ==========================================
// 1. نظام إدارة قاعدة البيانات المحلية (Local Database Engine)
// ==========================================
const STORAGE_KEY = 'GPMS_REAL_DATABASE';

// دالة تحميل البيانات من ذاكرة المتصفح أو إنشائها لأول مرة
function loadProjectData() {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
        return JSON.parse(localData);
    }
    
    // البيانات التأسيسية للمشروع (تظهر لأول مرة فقط)
    const initialData = {
        stats: { members: 40, progress: 45 },
        currentPhase: "تجميع العينات والبيانات الميدانية",
        tasks: [
            { id: 1, title: "جمع عينات التربة والمياه من قرى كفر الشيخ", group: "مجموعة العمل الميداني", status: "قيد التنفيذ" },
            { id: 2, title: "صياغة وتوثيق المقترح البحثي الأولي (Proposal)", group: "مجموعة الكتابة والتوثيق", status: "مكتمل" },
            { id: 3, title: "تحليل تراكيز بولي أكريلات الصوديوم في المختبر", group: "مجموعة التجارب المعملية", status: "جديد" }
        ],
        messages: [
            { id: 1, sender: "د. أحمد الوكيل", text: "يا شباب، يرجى تحديث تقرير الأداء الميداني الليلة لتقييم المرحلة الحالية.", type: "rcv" },
            { id: 2, sender: "عبدالرحمن (القائد)", text: "جاهز يا دكتور، تم تحديث لوحة التحكم وجاري رفع التقارير فورا.", type: "sent" }
        ],
        evaluations: [
            { id: 1, name: "عبدالرحمن أحمد Aboelsoud", role: "قائد عام المشروع", attendance: "100%", score: 100 },
            { id: 2, name: "أحمد علي (طالب مستخدم)", role: "مسؤول الفريق الميداني", attendance: "95%", score: 95 },
            { id: 3, name: "محمد محمود (طالب مستخدم)", role: "مسؤول فريق المراجع", attendance: "90%", score: 88 }
        ]
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
}

// دالة حفظ أي تغييرات تطرأ على النظام فوراً
function saveProjectData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.GPOS_STATE));
    updateDashboardMetrics(); // تحديث الأرقام تلقائياً عند أي حفظ
}

// ==========================================
// 2. محرك تشغيل النظام والتحقق من الدخول
// ==========================================
window.GPOS_STATE = loadProjectData();

document.addEventListener('DOMContentLoaded', () => {
    // تشغيل زر الوضع الليلي
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
    });

    // التحكم في شاشة الدخول
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        
        if (username.toLowerCase() === 'leader') {
            document.getElementById('auth-container').classList.add('hidden');
            document.getElementById('app-container').classList.remove('hidden');
            renderView('dashboard'); // فتح لوحة التحكم فوراً
        } else {
            alert('عذراً! النظام مخصص حالياً للـ Leader فقط. اكتب في الخانة كلمة: leader');
        }
    });

    // زر تسجيل الخروج
    document.getElementById('logout-btn').addEventListener('click', () => {
        document.getElementById('app-container').classList.add('hidden');
        document.getElementById('auth-container').classList.remove('hidden');
    });

    // تفعيل أزرار القائمة الجانبية للتنقل بين الصفحات
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            renderView(item.getAttribute('data-view'));
        });
    });
});

// دالة لتحديث الأرقام الإحصائية تلقائياً بناءً على العمل الفعلي
function updateDashboardMetrics() {
    if (!window.GPOS_STATE.tasks) return;
    const total = window.GPOS_STATE.tasks.length;
    const completed = window.GPOS_STATE.tasks.filter(t => t.status === "مكتمل").length;
    window.GPOS_STATE.stats.tasksCount = total;
    if (total > 0) {
        window.GPOS_STATE.stats.progress = Math.round((completed / total) * 100) + "%";
    } else {
        window.GPOS_STATE.stats.progress = "0%";
    }
}

// ==========================================
// 3. موجه العرض التفاعلي الذكي (Interactive Router Views)
// ==========================================
function renderView(viewName) {
    const wrapper = document.getElementById('view-wrapper');
    if (!wrapper) return;
    wrapper.innerHTML = ''; // مسح الشاشة لبناء العرض الجديد

    // --------------------------------------
    // أ: عرض لوحة التحكم (Dashboard)
    // --------------------------------------
    if (viewName === 'dashboard') {
        updateDashboardMetrics();
        wrapper.innerHTML = `
            <h2>لوحة القيادة والمؤشرات الرقمية للمشروع</h2>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem;">تتبع حي لأداء الـ 40 طالباً والمجموعات التكتيكية العابرة.</p>
            
            <div class="metrics-grid">
                <div class="card"><h4>إجمالي الطلاب المشاركين</h4><h3>${window.GPOS_STATE.stats.members} طالب</h3></div>
                <div class="card"><h4>نسبة إنجاز المهام الحالية</h4><h3>${window.GPOS_STATE.stats.progress}</h3></div>
                <div class="card"><h4>عدد المهام المدرجة بالنظام</h4><h3>${window.GPOS_STATE.tasks.length} مهمة بحثية</h3></div>
            </div>

            <div class="card">
                <h4>النمط الحركي الحالي للمشروع (Task Force Phase)</h4>
                <div style="margin: 1rem 0; font-weight: bold; color: var(--primary);" id="phase-text">🎯 المرحلة النشطة: ${window.GPOS_STATE.currentPhase}</div>
                <div class="input-group">
                    <input type="text" id="new-phase-input" placeholder="تغيير المرحلة التكتيكية للمشروع...">
                    <button class="btn btn-primary" onclick="changeProjectPhase()">تحديث المرحلة</button>
                </div>
            </div>
        `;
    } 
    
    // --------------------------------------
    // ب: عرض إدارة المهام الحركية (Interactive Tasks)
    // --------------------------------------
    else if (viewName === 'tasks') {
        let rows = window.GPOS_STATE.tasks.map(t => `
            <tr>
                <td><b>${t.title}</b></td>
                <td><span class="badge">${t.group}</span></td>
                <td><span style="color: ${t.status === 'مكتمل' ? '#10b981' : '#f59e0b'}">${t.status}</span></td>
                <td>
                    ${t.status !== 'مكتمل' ? `<button class="btn btn-primary" style="padding: 2px 8px; font-size: 0.8rem;" onclick="markTaskAsCompleted(${t.id})">إكمال</button>` : '✔️'}
                    <button class="btn" style="padding: 2px 8px; font-size: 0.8rem; background: #ef4444; color: white;" onclick="deleteTask(${t.id})">حذف</button>
                </td>
            </tr>
        `).join('');

        wrapper.innerHTML = `
            <div class="card">
                <h2>نظام إدارة وتوزيع المهام الفعلي</h2>
                <p style="color: var(--text-muted); margin-bottom: 1rem;">أضف مهام جديدة ووزعها على لجان التكتيك العملي فورا.</p>
                
                <!-- نموذج إضافة مهمة حقيقية -->
                <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <h5 style="margin-bottom: 0.5rem;">إضافة مهمة بحثية أو تكتيكية جديدة:</h5>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        <input type="text" id="task-title" placeholder="اكتب عنوان المهمة الميدانية أو المعملية..." style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px;">
                        <input type="text" id="task-group" placeholder="اسم المجموعة المكلفة (مثال: مجموعة التحليل)..." style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px;">
                        <button class="btn btn-primary" onclick="addNewTaskToProject()">إدراج المهمة وتشغيلها في النظام</button>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr><th>المهمة العلمية</th><th>المجموعة العابرة المكلفة</th><th>الحالة</th><th>إجراءات القيادة</th></tr>
                    </thead>
                    <tbody>
                        ${rows ? rows : '<tr><td colspan="4" style="text-align:center;">لا توجد مهام مدرجة حالياً. أضف مهمة جديدة أعلاه!</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    } 
    
    // --------------------------------------
    // ج: عرض نظام المحادثة الفعلي (Working Chat)
    // --------------------------------------
    else if (viewName === 'chat') {
        let msgs = window.GPOS_STATE.messages.map(m => `
            <div class="msg ${m.type}">
                <small style="display:block; font-size:0.7rem; color:var(--text-muted); font-weight:bold;">${m.sender}</small>
                <span>${m.text}</span>
            </div>
        `).join('');

        wrapper.innerHTML = `
            <div class="card">
                <h2>غرفة القيادة والاتصال الفوري المتخطي للصلاحيات</h2>
                <p style="color: var(--text-muted);">تواصل مباشر وحي مع المشرف والمجموعات الـ 40.</p>
                <div class="chat-box" id="chat-box-area">${msgs}</div>
                <div class="input-group">
                    <input type="text" id="chat-message-input" placeholder="اكتب توجيه قيادي عاجل للمشروع...">
                    <button class="btn btn-primary" onclick="sendMessageFromLeader()">إرسال التوجيه</button>
                </div>
            </div>
        `;
        // النزول لأسفل الشات تلقائياً عند الفتح
        const box = document.getElementById('chat-box-area');
        if (box) box.scrollTop = box.scrollHeight;
    } 
    
    // --------------------------------------
    // د: عرض مركز الأبحاث (Research Documents)
    // --------------------------------------
    else if (viewName === 'research') {
        wrapper.innerHTML = `
            <h2>مركز التوثيق والمخرجات البحثية المستمرة</h2>
            <div class="card" style="margin-top:1rem;">
                <p style="margin-bottom: 0.5rem;">📝 <b>مستند صياغة مقترح البحث النانوي (Proposal_v2.pdf)</b> <span class="badge" style="background:#10b981; color:white; padding: 2px 6px;">معتمد ومقفل</span></p>
                <p style="font-size: 0.85rem; color: var(--text-muted);">تم التدقيق اللغوي ومطابقته لمعايير قسم الإرشاد الزراعي بجامعة كفر الشيخ.</p>
                <hr style="margin:1rem 0; border-color:var(--border-color);">
                <p style="margin-bottom: 0.5rem;">📝 <b>مسودة الإطار النظري ومراجعة المراجع (Literature_Review_Draft.docx)</b> <span class="badge" style="background:#f59e0b; color:white; padding: 2px 6px;">قيد المراجعة الفنية</span></p>
                <p style="font-size: 0.85rem; color: var(--text-muted);">يتم العمل عليها حالياً بواسطة مجموعة الكتابة لدمج أبحاث اليوريا النانوية.</p>
            </div>
        `;
    } 
    
    // --------------------------------------
    // هـ: عرض لوحة التقييم الحية للطلاب (Evaluations)
    // --------------------------------------
    else if (viewName === 'evaluations') {
        let rows = window.GPOS_STATE.evaluations.map(e => `
            <tr>
                <td><b>${e.name}</b></td>
                <td>${e.role}</td>
                <td>${e.attendance}</td>
                <td><b style="color:var(--primary);">${e.score} / 100</b></td>
                <td><button class="btn" style="padding: 2px 8px; font-size: 0.8rem; background: var(--border-color);" onclick="boostStudentScore(${e.id})">+ مكافأة</button></td>
            </tr>
        `).join('');

        wrapper.innerHTML = `
            <div class="card">
                <h2>نظام رصد درجات وتقييم الطلاب الـ 40 المؤتمت</h2>
                <p style="color: var(--text-muted); margin-bottom: 1rem;">لوحة تحكم خاصة بقائد المشروع لرصد وتقييم التزام الطلاب بالتكتيكات الميدانية.</p>
                <table>
                    <thead>
                        <tr><th>اسم الطالب</th><th>التكليف الحركي داخل الفريق</th><th>نسبة الالتزام والنشاط</th><th>التقييم الفعلي الحالي</th><th>إجراءات التحكم</th></tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }
}

// ==========================================
// 4. دالات التحكم والعمليات الحقيقية (Real Operations Logic)
// ==========================================

// دالة إضافة مهمة جديدة وحفظها
window.addNewTaskToProject = function() {
    const titleInput = document.getElementById('task-title');
    const groupInput = document.getElementById('task-group');
    
    if (!titleInput || !groupInput) return;
    
    const title = titleInput.value.trim();
    const group = groupInput.value.trim();
    
    if (title === '' || group === '') {
        alert('برجاء ملء خانة عنوان المهمة واسم المجموعة المكلفة أولاً!');
        return;
    }
    
    const newTask = {
        id: Date.now(), // رقم فرعي مميز بناء على الوقت
        title: title,
        group: group,
        status: "جديد"
    };
    
    window.GPOS_STATE.tasks.push(newTask);
    saveProjectData();
    renderView('tasks'); // إعادة رندرة الصفحة فوراً لرؤية النتيجة السحرية!
};

// دالة تحويل المهمة إلى مكتملة وحفظها
window.markTaskAsCompleted = function(taskId) {
    const task = window.GPOS_STATE.tasks.find(t => t.id === taskId);
    if (task) {
        task.status = "مكتمل";
        saveProjectData();
        renderView('tasks');
    }
};

// دالة حذف مهمة نهائياً من قاعدة البيانات
window.deleteTask = function(taskId) {
    window.GPOS_STATE.tasks = window.GPOS_STATE.tasks.filter(t => t.id !== taskId);
    saveProjectData();
    renderView('tasks');
};

// دالة إرسال رسالة حقيقية في نظام الشات وحفظها
window.sendMessageFromLeader = function() {
    const input = document.getElementById('chat-message-input');
    if (!input) return;
    const text = input.value.trim();
    
    if (text === '') return;
    
    const newMsg = {
        id: Date.now(),
        sender: "عبدالرحمن أحمد Aboelsoud (القائد)",
        text: text,
        type: "sent"
    };
    
    window.GPOS_STATE.messages.push(newMsg);
    saveProjectData();
    renderView('chat');
};

// دالة لتغيير وحفظ المرحلة التكتيكية الحالية للمشروع
window.changeProjectPhase = function() {
    const input = document.getElementById('new-phase-input');
    if (!input) return;
    const newPhase = input.value.trim();
    
    if (newPhase === '') return;
    
    window.GPOS_STATE.currentPhase = newPhase;
    saveProjectData();
    renderView('dashboard');
};

// دالة زيادة تقييم طالب كمكافأة وحفظها
window.boostStudentScore = function(studentId) {
    const student = window.GPOS_STATE.evaluations.find(e => e.id === studentId);
    if (student) {
        if (student.score < 100) {
            student.score += 2;
            if (student.score > 100) student.score = 100;
            saveProjectData();
            renderView('evaluations');
        } else {
            alert('الطالب حاصل على التقييم النهائي بالفعل!');
        }
    }
};
        
