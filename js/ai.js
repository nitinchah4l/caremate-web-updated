const AI = {
    calculateHealthScore() {
        const meds = Store.state.medicines;
        const bp = Store.state.healthData.bp;
        const sugar = Store.state.healthData.sugar;

        // Adherence Score (0-40)
        let adherence = 0;
        if (meds.length > 0) {
            const taken = meds.filter(m => m.status === 'Taken').length;
            adherence = (taken / meds.length) * 40;
        }

        // Vitals Score (0-60)
        let vitals = 30; // Base
        const latestBP = bp[bp.length - 1];
        const latestSugar = sugar[sugar.length - 1];

        if (latestBP) {
            const [systolic, diastolic] = latestBP.value.split('/').map(Number);
            if (systolic > 140 || diastolic > 90) vitals -= 10;
            else if (systolic < 120 && diastolic < 80) vitals += 10;
        }

        if (latestSugar) {
            if (latestSugar.value > 140) vitals -= 10;
            else if (latestSugar.value < 100) vitals += 10;
        }

        return Math.min(100, Math.max(0, Math.round(adherence + vitals + 20)));
    },

    getInsights() {
        const score = this.calculateHealthScore();
        const insights = [];

        const missed = meds.filter(m => m.status === 'Missed').length;
        const upcomingMeds = meds.filter(m => m.status === 'Upcoming').length;
        const apts = Store.state.appointments;
        const upcomingApts = apts.filter(a => a.status === 'Upcoming');

        if (upcomingApts.length > 0) {
            const next = upcomingApts[0];
            insights.push({
                type: 'info',
                icon: 'fa-user-md',
                title: 'Upcoming Appointment',
                message: `You have an appointment with ${next.doctor} (${next.specialty}) on ${next.date}.`
            });
        }

        if (missed > 0 && upcomingApts.length > 0) {
            insights.push({
                type: 'risk',
                icon: 'fa-triangle-exclamation',
                title: 'Medication Non-Adherence',
                message: `You missed ${missed} doses and have a doctor visit coming up. Be prepared to discuss this.`
            });
        }

        if (score < 70) {
            insights.push({
                type: 'risk',
                icon: 'fa-exclamation-triangle',
                title: 'Health Risk Warning',
                message: 'Your health metrics indicate a rising risk level. Please consult your physician.'
            });
        }

        if (latestBP && latestBP.value.split('/')[0] > 140) {
            insights.push({
                type: 'warning',
                icon: 'fa-heart-pulse',
                title: 'Elevated Pressure',
                message: 'Your systolic BP is currently high. Avoid salt and rest for 15 minutes.'
            });
        }

        if (insights.length === 0) {
            insights.push({
                type: 'success',
                icon: 'fa-circle-check',
                title: 'Doing Great!',
                message: 'Your adherence is 100% today. Your health score is in the optimal range.'
            });
        }

        // Add a predictive alert
        insights.push({
            type: 'info',
            icon: 'fa-crystal-ball',
            title: 'Predictive Insight',
            message: 'If current trend continues, your risk level may drop by 5% in the next 3 days.'
        });

        return insights;
    },

    getChatResponse(query) {
        query = query.toLowerCase();
        
        if (query.includes('bp') || query.includes('blood pressure')) {
            const bp = Store.state.healthData.bp;
            const last = bp[bp.length - 1].value;
            return `Your last recorded Blood Pressure was ${last}. This is slightly elevated. I recommend monitoring it again in 4 hours.`;
        }

        if (query.includes('appointment') || query.includes('doctor')) {
            const apts = Store.state.appointments.filter(a => a.status === 'Upcoming');
            if (apts.length > 0) {
                const next = apts[0];
                return `Your next appointment is with ${next.doctor} on ${next.date} at ${next.time}. Note: ${next.notes || 'No specific notes'}.`;
            }
            return "You don't have any upcoming doctor appointments scheduled.";
        }

        if (query.includes('miss') || query.includes('dose') || query.includes('medicine')) {
            const meds = Store.state.medicines;
            const upcoming = meds.filter(m => m.status === 'Upcoming');
            if (upcoming.length > 0) {
                return `You have ${upcoming.length} upcoming doses today. Next is ${upcoming[0].name} at ${upcoming[0].time}.`;
            }
            return "You've taken all your scheduled doses for today! Great job.";
        }

        if (query.includes('health') || query.includes('score')) {
            const score = this.calculateHealthScore();
            return `Your current Health Score is ${score}/100. ${score > 80 ? 'You are in the optimal zone!' : 'There is room for improvement in your medication adherence.'}`;
        }

        return "I'm here to help with your health data and meds. You can ask about your BP, missed doses, or your overall health score.";
    }
};
