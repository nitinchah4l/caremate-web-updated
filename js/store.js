const Store = {
    // Initial State
    state: {
        user: null,
        medicines: [],
        healthData: {
            heartRate: [],
            steps: [],
            bp: [],
            sugar: []
        },
        streaks: 0,
        lastActive: null
    },

    init() {
        const saved = localStorage.getItem('caremate_data');
        if (saved) {
            this.state = JSON.parse(saved);
        } else {
            this.seedData();
            this.save();
        }
    },

    seedData() {
        this.state.medicines = [
            { id: 1, name: 'Lisinopril', dosage: '10mg', time: '08:00', period: 'Morning', instructions: 'Before food', status: 'Taken', date: new Date().toLocaleDateString() },
            { id: 2, name: 'Metformin', dosage: '500mg', time: '13:00', period: 'Afternoon', instructions: 'After food', status: 'Upcoming', date: new Date().toLocaleDateString() },
            { id: 3, name: 'Multivitamin', dosage: '1 Tab', time: '14:00', period: 'Afternoon', instructions: 'Daily', status: 'Upcoming', date: new Date().toLocaleDateString() }
        ];
        this.state.healthData.bp = [
            { value: '120/80', date: '2026-04-18', timestamp: Date.now() - 86400000 },
            { value: '148/92', date: '2026-04-19', timestamp: Date.now() }
        ];
        this.state.healthData.sugar = [
            { value: 110, date: '2026-04-18', timestamp: Date.now() - 86400000 },
            { value: 180, date: '2026-04-19', timestamp: Date.now() }
        ];
        this.state.streaks = 12;
    },

    save() {
        localStorage.setItem('caremate_data', JSON.stringify(this.state));
    },

    // User Actions
    login(user) {
        this.state.user = user;
        this.save();
    },

    logout() {
        this.state.user = null;
        this.save();
    },

    // Medicine Actions
    addMedicine(med) {
        const newMed = {
            ...med,
            id: Date.now(),
            status: 'Upcoming',
            date: new Date().toLocaleDateString()
        };
        this.state.medicines.push(newMed);
        this.save();
        return newMed;
    },

    toggleMedStatus(id) {
        const med = this.state.medicines.find(m => m.id === id);
        if (med) {
            med.status = med.status === 'Taken' ? 'Upcoming' : 'Taken';
            this.save();
        }
    },

    deleteMed(id) {
        this.state.medicines = this.state.medicines.filter(m => m.id !== id);
        this.save();
    },

    // Health Data Actions
    addRecord(type, value) {
        this.state.healthData[type].push({
            value,
            date: new Date().toISOString().split('T')[0],
            timestamp: Date.now()
        });
        this.save();
    }
};
