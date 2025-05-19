document.addEventListener('DOMContentLoaded', function() {
    // Auth tabs functionality
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    
    if (authTabs) {
        authTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs and forms
                authTabs.forEach(t => t.classList.remove('active'));
                authForms.forEach(f => f.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show corresponding form
                const formId = this.dataset.tab + '-form';
                document.getElementById(formId).classList.add('active');
            });
        });
    }
    
    // Forgot password link
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Hide all forms and show forgot password form
            authForms.forEach(f => f.classList.remove('active'));
            document.getElementById('forgot-password-form').classList.add('active');
        });
    }
    
    // Back to login link
    const backToLoginLink = document.getElementById('back-to-login-link');
    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Hide all forms and show login form
            authForms.forEach(f => f.classList.remove('active'));
            document.getElementById('login-form').classList.add('active');
            
            // Update tabs
            authTabs.forEach(t => t.classList.remove('active'));
            document.querySelector('[data-tab="login"]').classList.add('active');
        });
    }
    
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const rememberMe = document.getElementById('remember-me').checked;
            
            // Validate inputs
            if (!email || !password) {
                showMessage('login-message', 'Please fill in all fields', 'error');
                return;
            }
            
            // Attempt login
            login(email, password, rememberMe);
        });
    }
    
    // Register form submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            // Validate inputs
            if (!name || !email || !password || !confirmPassword) {
                showMessage('register-message', 'Please fill in all fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage('register-message', 'Passwords do not match', 'error');
                return;
            }
            
            if (password.length < 8) {
                showMessage('register-message', 'Password must be at least 8 characters long', 'error');
                return;
            }
            
            if (!/\d/.test(password)) {
                showMessage('register-message', 'Password must include at least one number', 'error');
                return;
            }
            
            // Attempt registration
            register(name, email, password);
        });
    }
    
    // Forgot password form submission
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('forgot-email').value;
            
            // Validate input
            if (!email) {
                showMessage('forgot-message', 'Please enter your email address', 'error');
                return;
            }
            
            // Simulate password reset
            resetPassword(email);
        });
    }
    
    // Function to show message
    function showMessage(elementId, message, type) {
        const messageElement = document.getElementById(elementId);
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.className = 'auth-message ' + type;
            
            // Hide message after 5 seconds
            setTimeout(() => {
                messageElement.className = 'auth-message';
                messageElement.textContent = '';
            }, 5000);
        }
    }
    
    // Function to login
    function login(email, password, rememberMe) {
        // In a real application, this would make an API call to a backend
        // For demonstration, we'll use localStorage
        
        // Check if user exists
        const users = JSON.parse(localStorage.getItem('cpaUsers')) || [];
        const user = users.find(u => u.email === email);
        
        if (!user) {
            showMessage('login-message', 'Invalid email or password', 'error');
            return;
        }
        
        // Check password (in a real app, this would be done securely on the server)
        if (user.password !== password) {
            showMessage('login-message', 'Invalid email or password', 'error');
            return;
        }
        
        // Login successful
        showMessage('login-message', 'Login successful! Redirecting...', 'success');
        
        // Store user session
        const session = {
            userId: user.id,
            name: user.name,
            email: user.email,
            loggedIn: true,
            timestamp: new Date().getTime()
        };
        
        if (rememberMe) {
            // Store in localStorage for persistent login
            localStorage.setItem('cpaUserSession', JSON.stringify(session));
        } else {
            // Store in sessionStorage for session-only login
            sessionStorage.setItem('cpaUserSession', JSON.stringify(session));
        }
        
        // Redirect to profile page or home page
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1500);
    }
    
    // Function to register
    function register(name, email, password) {
        // In a real application, this would make an API call to a backend
        // For demonstration, we'll use localStorage
        
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('cpaUsers')) || [];
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
            showMessage('register-message', 'Email already registered', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: generateUserId(),
            name: name,
            email: email,
            password: password, // In a real app, this would be hashed
            created: new Date().toISOString(),
            progress: {
                far: 0,
                aud: 0,
                reg: 0,
                bar: 0,
                isc: 0,
                tcp: 0
            },
            watchedVideos: []
        };
        
        // Add user to storage
        users.push(newUser);
        localStorage.setItem('cpaUsers', JSON.stringify(users));
        
        // Registration successful
        showMessage('register-message', 'Registration successful! You can now login.', 'success');
        
        // Clear form
        document.getElementById('register-form').reset();
        
        // Switch to login tab after a delay
        setTimeout(() => {
            document.querySelector('[data-tab="login"]').click();
        }, 2000);
    }
    
    // Function to reset password
    function resetPassword(email) {
        // In a real application, this would send an email with a reset link
        // For demonstration, we'll just show a success message
        
        // Check if user exists
        const users = JSON.parse(localStorage.getItem('cpaUsers')) || [];
        const user = users.find(u => u.email === email);
        
        if (!user) {
            // Don't reveal if email exists or not for security
            showMessage('forgot-message', 'If your email is registered, you will receive a reset link shortly.', 'success');
            return;
        }
        
        // Show success message
        showMessage('forgot-message', 'If your email is registered, you will receive a reset link shortly.', 'success');
        
        // Clear form
        document.getElementById('forgot-password-form').reset();
    }
    
    // Function to generate user ID
    function generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Check if user is logged in
    function checkAuth() {
        // Check sessionStorage first, then localStorage
        let session = JSON.parse(sessionStorage.getItem('cpaUserSession')) || 
                     JSON.parse(localStorage.getItem('cpaUserSession'));
        
        if (session && session.loggedIn) {
            // User is logged in
            return true;
        }
        
        return false;
    }
    
    // Update UI based on auth status
    function updateAuthUI() {
        const isLoggedIn = checkAuth();
        
        // Get all login/register links
        const authLinks = document.querySelectorAll('.auth-link');
        const profileLinks = document.querySelectorAll('.profile-link');
        
        if (isLoggedIn) {
            // Hide login/register links
            authLinks.forEach(link => {
                link.style.display = 'none';
            });
            
            // Show profile links
            profileLinks.forEach(link => {
                link.style.display = 'block';
            });
        } else {
            // Show login/register links
            authLinks.forEach(link => {
                link.style.display = 'block';
            });
            
            // Hide profile links
            profileLinks.forEach(link => {
                link.style.display = 'none';
            });
        }
    }
    
    // Call updateAuthUI on page load
    updateAuthUI();
});
