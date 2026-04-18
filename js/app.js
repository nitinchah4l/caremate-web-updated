const App = {
    init() {
        Store.init();
        this.setupAuth();
        
        // If user already logged in, skip to dashboard
        if (Store.state.user) {
            this.startApp();
        }
    },

    setupAuth() {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const goToSignup = document.getElementById('go-to-signup');
        const goToLogin = document.getElementById('go-to-login');
        const loginCont = document.getElementById('login-form-container');
        const signupCont = document.getElementById('signup-form-container');

        goToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            loginCont.classList.add('hidden');
            signupCont.classList.remove('hidden');
        });

        goToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            signupCont.classList.add('hidden');
            loginCont.classList.remove('hidden');
        });

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            // Simplified login
            Store.login({ name: 'Nitin', email: email });
            this.startApp();
        });

        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            Store.login({ name, email });
            this.startApp();
        });
    },

    startApp() {
        document.getElementById('auth-screen').classList.remove('active');
        document.getElementById('main-layout').classList.remove('hidden');
        UI.init();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
