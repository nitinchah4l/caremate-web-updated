const UI = {
    // DOM Elements
    els: {},

    init() {
        this.cacheElements();
        this.setupNavigation();
        this.setupEventListeners();
        this.updateAll();
        
        // Live HR simulation
        setInterval(() => {
            const hr = Math.floor(Math.random() * (85 - 65 + 1)) + 65;
            if (this.els.liveHR) this.els.liveHR.textContent = hr;
        }, 5000);
    },

    cacheElements() {
        this.els = {
            appLayout: document.getElementById('main-layout'),
            authScreen: document.getElementById('auth-screen'),
            displayName: document.getElementById('user-display-name'),
            dateStr: document.getElementById('current-date'),
            screens: document.querySelectorAll('.screen'),
            navItems: document.querySelectorAll('.nav-item'),
            
            // Dashboard
            healthScoreRing: document.getElementById('health-score-ring'),
            healthScoreNum: document.getElementById('health-score-num'),
            insightList: document.getElementById('ai-insights-list'),
            todayMedsList: document.getElementById('today-meds-list'),
            dailyMedProgress: document.getElementById('daily-med-progress'),
            takenCount: document.getElementById('taken-count'),
            liveHR: document.getElementById('live-hr'),
            streakDays: document.getElementById('streak-days'),
            
            // Meds
            fullMedsList: document.getElementById('full-meds-list'),
            fabAdd: document.getElementById('fab-add-med'),
            
            // Reports
            adherenceChart: document.getElementById('adherence-chart'),
            timeline: document.getElementById('activity-timeline'),
            
            // Appointments
            aptList: document.getElementById('apt-list'),
            dashNextApt: document.getElementById('dash-next-apt'),
            dashNextAptTime: document.getElementById('dash-next-apt-time'),
            
            // Chat
            chatMessages: document.getElementById('chat-messages'),
            chatInput: document.getElementById('chat-input'),
            sendMsgBtn: document.getElementById('send-msg-btn'),
            
            // Modals
            modalContainer: document.getElementById('modal-container'),
            addMedModal: document.getElementById('add-med-modal'),
            addAptModal: document.getElementById('add-apt-modal'),
            scannerModal: document.getElementById('scanner-modal'),
            emergencyModal: document.getElementById('emergency-modal'),
            
            // Scanner
            startScanBtn: document.getElementById('start-scan-btn'),
            scanResults: document.getElementById('scan-results'),
            importScanBtn: document.getElementById('import-scan-btn'),
            scanMedName: document.getElementById('scan-med-name'),
            scanMedDosage: document.getElementById('scan-med-dosage')
        };
    },

    setupNavigation() {
        this.els.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const screenId = item.getAttribute('data-screen');
                if (!screenId) return;
                this.showScreen(screenId);
            });
        });

        document.getElementById('view-all-meds').addEventListener('click', () => {
            this.showScreen('meds');
        });
    },

    showScreen(id) {
        this.els.screens.forEach(s => {
            s.classList.remove('view-active', 'page-enter');
            if (s.id === `${id}-screen`) {
                s.classList.add('view-active', 'page-enter');
            }
        });

        this.els.navItems.forEach(nav => {
            nav.classList.remove('active');
            if (nav.getAttribute('data-screen') === id) {
                nav.classList.add('active');
            }
        });

        // Toggle FAB visibility
        if (id === 'meds' || id === 'home') {
            this.els.fabAdd.classList.remove('hidden');
        } else {
            this.els.fabAdd.classList.add('hidden');
        }
    },

    setupEventListeners() {
        // FAB Add Med
        this.els.fabAdd.addEventListener('click', () => {
            this.openModal('add-med');
        });

        // Close Modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });

        // Add Med Form
        document.getElementById('add-med-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const medData = {
                name: document.getElementById('med-name').value,
                dosage: document.getElementById('med-dosage').value,
                time: document.getElementById('med-time').value,
                period: document.getElementById('med-period').value,
                instructions: document.getElementById('med-instructions').value
            };
            Store.addMedicine(medData);
            this.closeModal();
            this.updateAll();
            this.showToast('Medicine added successfully');
        });

        // Add Appointment Form
        document.getElementById('add-apt-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const aptData = {
                doctor: document.getElementById('apt-doc-name').value,
                specialty: document.getElementById('apt-specialty').value,
                date: document.getElementById('apt-date').value,
                time: document.getElementById('apt-time').value,
                notes: document.getElementById('apt-notes').value
            };
            Store.addAppointment(aptData);
            this.closeModal();
            this.updateAll();
            this.showToast('Appointment scheduled');
        });

        document.getElementById('add-apt-trigger').addEventListener('click', () => {
            this.openModal('add-apt');
        });

        // Chat
        this.els.sendMsgBtn.addEventListener('click', () => this.handleSendMessage());
        this.els.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSendMessage();
        });

        // Scanner
        // Scanner Logic
        const modeBtns = document.querySelectorAll('.mode-btn');
        let currentScanMode = 'med';

        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentScanMode = btn.getAttribute('data-mode');
                document.getElementById('scan-status-text').textContent = 
                    currentScanMode === 'med' ? 'Scanning pill container...' : 'Parsing health report...';
                this.els.scanResults.classList.add('hidden');
            });
        });

        document.getElementById('open-scanner').addEventListener('click', () => this.openModal('scanner'));
        this.els.startScanBtn.addEventListener('click', () => this.runScannerSim(currentScanMode));
        
        this.els.importScanBtn.addEventListener('click', () => {
            const name = this.els.scanMedName.textContent;
            const dosage = this.els.scanMedDosage.textContent;
            Store.addMedicine({
                name: name,
                dosage: dosage,
                time: '09:00',
                period: 'Morning',
                instructions: 'Auto-scanned'
            });
            this.closeModal();
            this.updateAll();
            this.showToast(`${name} scheduled automatically`);
            this.showScreen('meds');
        });

        document.getElementById('sync-vitals-btn').addEventListener('click', () => {
            const bp = document.getElementById('scan-bp').textContent;
            const sugar = parseInt(document.getElementById('scan-sugar').textContent);
            Store.addRecord('bp', bp);
            Store.addRecord('sugar', sugar);
            this.closeModal();
            this.updateAll();
            this.showToast('Vitals synchronized with Health Cloud');
            this.showScreen('home');
        });

        // Emergency
        document.getElementById('emergency-trigger').addEventListener('click', () => this.openModal('emergency'));
    },

    openModal(type) {
        this.els.modalContainer.classList.remove('hidden');
        this.els.addMedModal.classList.add('hidden');
        this.els.addAptModal.classList.add('hidden');
        this.els.scannerModal.classList.add('hidden');
        this.els.emergencyModal.classList.add('hidden');

        if (type === 'add-med') this.els.addMedModal.classList.remove('hidden');
        if (type === 'add-apt') this.els.addAptModal.classList.remove('hidden');
        if (type === 'scanner') {
            this.els.scannerModal.classList.remove('hidden');
            this.els.scanResults.classList.add('hidden');
        }
        if (type === 'emergency') this.els.emergencyModal.classList.remove('hidden');
    },

    closeModal() {
        this.els.modalContainer.classList.add('hidden');
    },

    updateAll() {
        this.updateDashboard();
        this.updateMedsList();
        this.updateAppointmentsList();
        this.updateReports();
        this.updateUserInfo();
    },

    updateUserInfo() {
        if (Store.state.user) {
            this.els.displayName.textContent = Store.state.user.name.split(' ')[0];
        }
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        this.els.dateStr.textContent = new Date().toLocaleDateString('en-US', options);
    },

    updateDashboard() {
        const score = AI.calculateHealthScore();
        this.els.healthScoreNum.textContent = score;
        
        // Progress ring logic (circumference is ~283)
        const offset = 283 - (score / 100) * 283;
        this.els.healthScoreRing.style.strokeDashoffset = offset;

        // Insights
        const insights = AI.getInsights();
        this.els.insightList.innerHTML = insights.map(ins => `
            <div class="insight-card ${ins.type} page-enter">
                <div class="insight-icon"><i class="fas ${ins.icon}"></i></div>
                <div class="insight-info">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h4>${ins.title}</h4>
                        ${ins.risk ? `<span class="risk-badge ${ins.risk.toLowerCase()}">${ins.risk} Risk</span>` : ''}
                    </div>
                    <p>${ins.message}</p>
                    ${ins.recommendation ? `<div class="rec-note"><i class="fas fa-lightbulb"></i> ${ins.recommendation}</div>` : ''}
                </div>
            </div>
        `).join('');

        // Medicines Progress
        const meds = Store.state.medicines;
        const taken = meds.filter(m => m.status === 'Taken').length;
        const total = meds.length;
        this.els.takenCount.textContent = taken;
        this.els.dailyMedProgress.style.width = total > 0 ? `${(taken / total) * 100}%` : '0%';

        // Horizontal Meds List
        this.els.todayMedsList.innerHTML = meds.map(med => `
            <div class="med-card-small glass">
                <div class="time">${med.time}</div>
                <div class="name">${med.name}</div>
                <button class="take-btn ${med.status === 'Taken' ? 'done' : ''}" onclick="UI.toggleMed(${med.id})">
                    ${med.status === 'Taken' ? '<i class="fas fa-check"></i> Taken' : 'Mark Taken'}
                </button>
            </div>
        `).join('');

        // Dashboard Appointment
        const apts = Store.state.appointments.filter(a => a.status === 'Upcoming');
        if (apts.length > 0) {
            const next = apts[0];
            this.els.dashNextApt.textContent = next.doctor;
            this.els.dashNextAptTime.textContent = `${next.date} · ${next.time}`;
        } else {
            this.els.dashNextApt.textContent = 'No upcoming';
            this.els.dashNextAptTime.textContent = 'Schedule now';
        }

        this.els.streakDays.textContent = Store.state.streaks;
    },

    toggleMed(id) {
        Store.toggleMedStatus(id);
        this.updateAll();
        // Check if all taken today for celebration
        const allTaken = Store.state.medicines.every(m => m.status === 'Taken');
        if (allTaken) this.showToast('🎉 Perfect day! Streak maintained.');
    },

    updateMedsList() {
        const meds = Store.state.medicines;
        this.els.fullMedsList.innerHTML = meds.map(med => `
            <div class="insight-card glass" style="border-left: 4px solid var(--primary); margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 15px; align-items: center;">
                    <div style="width: 44px; height: 44px; background: var(--bg-surface); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--primary);">
                        <i class="fas fa-pills"></i>
                    </div>
                    <div>
                        <h4 style="margin: 0;">${med.name} (${med.dosage})</h4>
                        <p style="font-size: 12px; color: var(--text-muted); margin: 0;">${med.period} • ${med.time} • ${med.instructions}</p>
                    </div>
                </div>
                <button onclick="UI.deleteMed(${med.id})" style="background: none; border: none; color: var(--text-dim); font-size: 18px;"><i class="fas fa-trash-alt"></i></button>
            </div>
        `).join('');
    },

    deleteMed(id) {
        if (confirm('Delete this medicine?')) {
            Store.deleteMed(id);
            this.updateAll();
        }
    },

    updateAppointmentsList() {
        const apts = Store.state.appointments;
        this.els.aptList.innerHTML = apts.map(apt => `
            <div class="insight-card glass" style="border-left: 4px solid var(--success); margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 15px; align-items: center;">
                    <div style="width: 44px; height: 44px; background: rgba(0, 245, 160, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--success);">
                        <i class="fas fa-user-md"></i>
                    </div>
                    <div>
                        <h4 style="margin: 0;">${apt.doctor}</h4>
                        <p style="font-size: 13px; color: var(--text-main); margin: 2px 0;">${apt.specialty}</p>
                        <p style="font-size: 12px; color: var(--text-muted); margin: 0;">${apt.date} at ${apt.time}</p>
                    </div>
                </div>
                <button onclick="UI.deleteApt(${apt.id})" style="background: none; border: none; color: var(--text-dim); font-size: 18px;"><i class="fas fa-trash-alt"></i></button>
            </div>
        `).join('');
    },

    deleteApt(id) {
        if (confirm('Cancel this appointment?')) {
            Store.deleteAppointment(id);
            this.updateAll();
        }
    },

    updateReports() {
        const meds = Store.state.medicines;
        const taken = meds.filter(m => m.status === 'Taken').length;
        const total = meds.length;
        const rate = total > 0 ? Math.round((taken / total) * 100) : 0;

        document.getElementById('total-taken-count').textContent = 142 + taken; 
        document.getElementById('total-missed-count').textContent = meds.filter(m => m.status === 'Missed').length;
        document.getElementById('monthly-adherence-pct').textContent = `${Math.max(rate, 92)}%`;

        this.els.adherenceChart.innerHTML = `
            <div style="display: flex; align-items: flex-end; gap: 15px; height: 120px; padding: 10px 0;">
                <div class="chart-bar" style="height: 40%; background: var(--success); flex: 1; border-radius: 4px;"></div>
                <div class="chart-bar" style="height: 60%; background: var(--success); flex: 1; border-radius: 4px;"></div>
                <div class="chart-bar" style="height: 55%; background: var(--success); flex: 1; border-radius: 4px;"></div>
                <div class="chart-bar" style="height: 85%; background: var(--success); flex: 1; border-radius: 4px;"></div>
                <div class="chart-bar" style="height: 70%; background: var(--success); flex: 1; border-radius: 4px;"></div>
                <div class="chart-bar" style="height: 90%; background: var(--success); flex: 1; border-radius: 4px;"></div>
                <div class="chart-bar" style="height: ${rate}%; background: var(--primary); flex: 1; border-radius: 4px; box-shadow: 0 0 10px var(--primary);"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-dim); margin-top: 5px;">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Today</span>
            </div>
        `;

        // Update vitals history bars
        const lastSugar = Store.state.healthData.sugar[Store.state.healthData.sugar.length - 1]?.value || 110;
        const lastBP = parseInt(Store.state.healthData.bp[Store.state.healthData.bp.length - 1]?.value.split('/')[0]) || 120;
        
        document.getElementById('sugar-bar').style.height = `${(lastSugar / 200) * 100}%`;
        document.getElementById('bp-bar').style.height = `${(lastBP / 180) * 100}%`;

        this.els.timeline.innerHTML = `
            <div style="border-left: 2px solid var(--glass-border); padding-left: 20px; position: relative;">
                <div style="position: relative; margin-bottom: 25px;">
                    <div style="position: absolute; left: -26px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: var(--primary);"></div>
                    <div style="font-size: 12px; color: var(--text-muted);">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div style="font-size: 14px; font-weight: 600;">System Synced</div>
                </div>
            </div>
        `;
    },

    handleSendMessage() {
        const text = this.els.chatInput.value.trim();
        if (!text) return;

        this.addChatMessage('user', text);
        this.els.chatInput.value = '';

        setTimeout(() => {
            const resp = AI.getChatResponse(text);
            this.addChatMessage('ai', resp);
        }, 800);
    },

    addChatMessage(sender, text) {
        const div = document.createElement('div');
        div.className = `message ${sender} page-enter`;
        div.innerHTML = `<div class="bubble">${text}</div>`;
        this.els.chatMessages.appendChild(div);
        this.els.chatMessages.scrollTop = this.els.chatMessages.scrollHeight;
    },

    runScannerSim(mode) {
        this.els.startScanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        this.els.scanResults.classList.add('hidden');
        document.getElementById('res-med').classList.add('hidden');
        document.getElementById('res-health').classList.add('hidden');

        setTimeout(() => {
            document.querySelector('.scanner-viewport').style.borderColor = 'var(--success)';
            this.els.scanResults.classList.remove('hidden');

            if (mode === 'med') {
                const meds = [
                    { name: 'Paracetamol', dosage: '500mg' },
                    { name: 'Amoxicillin', dosage: '250mg' },
                    { name: 'Lisinopril', dosage: '10mg' }
                ];
                const pick = meds[Math.floor(Math.random() * meds.length)];
                this.els.scanMedName.textContent = pick.name;
                this.els.scanMedDosage.textContent = pick.dosage;
                document.getElementById('res-med').classList.remove('hidden');
            } else {
                const bp = `${Math.floor(Math.random() * (150 - 110) + 110)}/${Math.floor(Math.random() * (95 - 70) + 70)}`;
                const sugar = Math.floor(Math.random() * (200 - 90) + 90);
                document.getElementById('scan-bp').textContent = bp;
                document.getElementById('scan-sugar').textContent = `${sugar} mg/dL`;
                document.getElementById('res-health').classList.remove('hidden');
            }

            this.els.startScanBtn.innerHTML = '<i class="fas fa-camera"></i>';
        }, 2500);
    },

    showToast(msg) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            background: var(--bg-surface); color: white; padding: 12px 24px;
            border-radius: 12px; border: 1px solid var(--primary); z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5); font-weight: 600;
            animation: slideUp 0.3s ease;
        `;
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// Global Exposure for onclick handlers
window.UI = UI;
