document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!checkAuth()) {
        // Redirect to login page
        window.location.href = 'login.html';
        return;
    }
    
    // Load user data
    const userData = getUserData();
    if (!userData) {
        // Something went wrong, redirect to login
        logout();
        return;
    }
    
    // Update profile info
    updateProfileInfo(userData);
    
    // Load progress data
    loadProgressData(userData);
    
    // Set up tab navigation
    setupTabs();
    
    // Set up logout button
    document.getElementById('logout-button').addEventListener('click', function() {
        logout();
    });
    
    // Set up settings form
    setupSettingsForm(userData);
    
    // Load FAR topics for progress tab
    loadFarTopics(userData);
});

// Function to check if user is logged in
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

// Function to get user data
function getUserData() {
    // Get user ID from session
    let session = JSON.parse(sessionStorage.getItem('cpaUserSession')) || 
                 JSON.parse(localStorage.getItem('cpaUserSession'));
    
    if (!session || !session.userId) {
        return null;
    }
    
    // Get user data from storage
    const users = JSON.parse(localStorage.getItem('cpaUsers')) || [];
    const user = users.find(u => u.id === session.userId);
    
    return user;
}

// Function to update profile info
function updateProfileInfo(userData) {
    // Set profile name
    document.getElementById('profile-name').textContent = userData.name;
    
    // Set profile email
    document.getElementById('profile-email').textContent = userData.email;
    
    // Set avatar with initials
    const avatar = document.getElementById('profile-avatar');
    const initials = userData.name.split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase();
    avatar.textContent = initials;
}

// Function to load progress data
function loadProgressData(userData) {
    // Get watched videos
    const watchedVideos = userData.watchedVideos || [];
    
    // Set videos watched count
    document.getElementById('videos-watched').textContent = watchedVideos.length;
    
    // Set total videos (this would come from your actual content)
    // For demonstration, we'll use a placeholder
    const totalVideos = 120; // Example total
    document.getElementById('total-videos').textContent = totalVideos;
    
    // Calculate overall progress
    const overallProgress = totalVideos > 0 ? Math.round((watchedVideos.length / totalVideos) * 100) : 0;
    document.getElementById('overall-progress').textContent = overallProgress + '%';
    
    // Set study streak (this would be calculated based on actual usage)
    // For demonstration, we'll use a placeholder
    document.getElementById('study-streak').textContent = '3';
    
    // Update section progress
    updateSectionProgress(userData.progress);
    
    // Load recent activity
    loadRecentActivity(userData);
    
    // Load enrolled courses
    loadEnrolledCourses(userData);
    
    // Update course overview
    updateCourseOverview(userData);
}

// Function to update section progress
function updateSectionProgress(progress) {
    if (!progress) {
        progress = {
            far: 0,
            aud: 0,
            reg: 0,
            bar: 0,
            isc: 0,
            tcp: 0
        };
    }
    
    // Update dashboard progress bars
    updateProgressBar('far', progress.far);
    updateProgressBar('aud', progress.aud);
    updateProgressBar('reg', progress.reg);
    updateProgressBar('bar', progress.bar);
    updateProgressBar('isc', progress.isc);
    updateProgressBar('tcp', progress.tcp);
    
    // Update detailed progress for FAR
    document.getElementById('far-detail-progress').textContent = progress.far + '%';
    document.getElementById('far-detail-fill').style.width = progress.far + '%';
}

// Function to update progress bar
function updateProgressBar(section, percentage) {
    document.getElementById(`${section}-progress`).textContent = percentage + '%';
    document.getElementById(`${section}-progress-fill`).style.width = percentage + '%';
}

// Function to load recent activity
function loadRecentActivity(userData) {
    const activityList = document.getElementById('activity-list');
    
    // Clear existing content
    activityList.innerHTML = '';
    
    // If no activity, show message
    if (!userData.activity || userData.activity.length === 0) {
        activityList.innerHTML = '<div class="no-activity">No recent activity to display.</div>';
        return;
    }
    
    // Sort activity by timestamp (newest first)
    const sortedActivity = [...userData.activity].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Take only the 5 most recent
    const recentActivity = sortedActivity.slice(0, 5);
    
    // Add activity items
    recentActivity.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        let iconClass = 'fa-video';
        switch (activity.type) {
            case 'completed':
                iconClass = 'fa-check-circle';
                break;
            case 'started':
                iconClass = 'fa-play-circle';
                break;
            case 'login':
                iconClass = 'fa-sign-in-alt';
                break;
        }
        
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.description}</div>
                <div class="activity-time">${formatTimestamp(activity.timestamp)}</div>
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

// Function to format timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
        return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`;
    }
    
    if (diffHour > 0) {
        return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    }
    
    if (diffMin > 0) {
        return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    return 'Just now';
}

// Function to set up tabs
function setupTabs() {
    // Profile menu tabs
    const menuItems = document.querySelectorAll('.profile-menu-item');
    const profileTabs = document.querySelectorAll('.profile-tab');
    
    menuItems.forEach(item => {
        if (item.id !== 'logout-button') {
            item.addEventListener('click', function() {
                // Remove active class from all menu items and tabs
                menuItems.forEach(i => i.classList.remove('active'));
                profileTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked menu item
                this.classList.add('active');
                
                // Show corresponding tab
                const tabId = this.dataset.tab + '-tab';
                document.getElementById(tabId).classList.add('active');
            });
        }
    });
    
    // Section tabs in progress tab
    const sectionTabs = document.querySelectorAll('.section-tab');
    const sectionContents = document.querySelectorAll('.section-content');
    
    sectionTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            sectionTabs.forEach(t => t.classList.remove('active'));
            sectionContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const contentId = this.dataset.section + '-content';
            document.getElementById(contentId).classList.add('active');
        });
    });
}

// Function to set up settings form
function setupSettingsForm(userData) {
    const settingsForm = document.getElementById('settings-form');
    
    // Populate form with user data
    document.getElementById('settings-name').value = userData.name;
    document.getElementById('settings-email').value = userData.email;
    
    // Handle form submission
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('settings-name').value;
        const email = document.getElementById('settings-email').value;
        const currentPassword = document.getElementById('settings-current-password').value;
        const newPassword = document.getElementById('settings-new-password').value;
        const confirmPassword = document.getElementById('settings-confirm-password').value;
        
        // Validate inputs
        if (!name || !email) {
            showSettingsMessage('Please fill in your name and email', 'error');
            return;
        }
        
        // Check if trying to change password
        if (currentPassword || newPassword || confirmPassword) {
            // Validate current password
            if (currentPassword !== userData.password) {
                showSettingsMessage('Current password is incorrect', 'error');
                return;
            }
            
            // Validate new password
            if (newPassword !== confirmPassword) {
                showSettingsMessage('New passwords do not match', 'error');
                return;
            }
            
            if (newPassword.length < 8) {
                showSettingsMessage('New password must be at least 8 characters long', 'error');
                return;
            }
            
            if (!/\d/.test(newPassword)) {
                showSettingsMessage('New password must include at least one number', 'error');
                return;
            }
        }
        
        // Update user data
        updateUserData(userData.id, {
            name: name,
            email: email,
            password: newPassword || userData.password
        });
        
        // Show success message
        showSettingsMessage('Settings updated successfully', 'success');
        
        // Clear password fields
        document.getElementById('settings-current-password').value = '';
        document.getElementById('settings-new-password').value = '';
        document.getElementById('settings-confirm-password').value = '';
        
        // Update profile info
        const updatedUserData = getUserData();
        updateProfileInfo(updatedUserData);
    });
}

// Function to show settings message
function showSettingsMessage(message, type) {
    const messageElement = document.getElementById('settings-message');
    messageElement.textContent = message;
    messageElement.className = 'auth-message ' + type;
    
    // Hide message after 5 seconds
    setTimeout(() => {
        messageElement.className = 'auth-message';
        messageElement.textContent = '';
    }, 5000);
}

// Function to update user data
function updateUserData(userId, newData) {
    // Get all users
    const users = JSON.parse(localStorage.getItem('cpaUsers')) || [];
    
    // Find user index
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        // Update user data
        users[userIndex] = {
            ...users[userIndex],
            ...newData
        };
        
        // Save updated users
        localStorage.setItem('cpaUsers', JSON.stringify(users));
        
        // Update session if email changed
        if (newData.email) {
            let session = JSON.parse(sessionStorage.getItem('cpaUserSession')) || 
                         JSON.parse(localStorage.getItem('cpaUserSession'));
            
            if (session) {
                session.email = newData.email;
                session.name = newData.name;
                
                if (sessionStorage.getItem('cpaUserSession')) {
                    sessionStorage.setItem('cpaUserSession', JSON.stringify(session));
                }
                
                if (localStorage.getItem('cpaUserSession')) {
                    localStorage.setItem('cpaUserSession', JSON.stringify(session));
                }
            }
        }
    }
}

// Function to load FAR topics
function loadFarTopics(userData) {
    const topicsList = document.getElementById('far-topics');
    
    // Clear loading message
    topicsList.innerHTML = '';
    
    // Check if user is enrolled in FAR
    const isEnrolled = isUserEnrolled(userData, 'far');
    
    if (!isEnrolled) {
        // Show enroll button if not enrolled
        topicsList.innerHTML = `
            <div class="not-enrolled-message">
                <i class="fas fa-book-reader"></i>
                <h3>Not Enrolled</h3>
                <p>You are not currently enrolled in this course. Enroll to track your progress and access all content.</p>
                <button class="btn enroll-btn" data-course="far">Enroll in FAR</button>
            </div>
        `;
        
        // Add event listener to enroll button
        const enrollBtn = topicsList.querySelector('.enroll-btn');
        if (enrollBtn) {
            enrollBtn.addEventListener('click', function() {
                enrollInCourse(userData.id, 'far');
            });
        }
        
        return;
    }
    
    // Sample FAR topics
    const farTopics = [
        { id: 'far-1', title: 'Conceptual Framework', videos: 5, watched: 3 },
        { id: 'far-2', title: 'Financial Statements', videos: 8, watched: 2 },
        { id: 'far-3', title: 'Revenue Recognition', videos: 6, watched: 0 },
        { id: 'far-4', title: 'Leases', videos: 4, watched: 0 },
        { id: 'far-5', title: 'Bonds & Long-term Liabilities', videos: 7, watched: 0 },
        { id: 'far-6', title: 'Assets', videos: 9, watched: 0 },
        { id: 'far-7', title: 'Equity', videos: 5, watched: 0 },
        { id: 'far-8', title: 'Governmental Accounting', videos: 10, watched: 0 }
    ];
    
    // Create topic items
    farTopics.forEach(topic => {
        const progress = topic.videos > 0 ? Math.round((topic.watched / topic.videos) * 100) : 0;
        
        const topicItem = document.createElement('div');
        topicItem.className = 'topic-item';
        topicItem.innerHTML = `
            <div class="topic-header">
                <div class="topic-title">${topic.title}</div>
                <div class="topic-progress">${topic.watched}/${topic.videos} videos (${progress}%)</div>
            </div>
            <div class="topic-progress-bar">
                <div class="topic-progress-fill" style="width: ${progress}%"></div>
            </div>
            <a href="far/${topic.title.toLowerCase().replace(/\s+/g, '-')}.html" class="btn-secondary">Continue Learning</a>
        `;
        
        topicsList.appendChild(topicItem);
    });
}

// Function to load enrolled courses
function loadEnrolledCourses(userData) {
    // Get enrolled courses container
    const enrolledCoursesContainer = document.getElementById('enrolled-courses');
    if (!enrolledCoursesContainer) return;
    
    // Clear container
    enrolledCoursesContainer.innerHTML = '';
    
    // Get enrolled courses
    const enrolledCourses = userData.enrolledCourses || [];
    
    // If no enrolled courses
    if (enrolledCourses.length === 0) {
        enrolledCoursesContainer.innerHTML = `
            <div class="no-courses-message">
                <i class="fas fa-book"></i>
                <h3>No Courses Enrolled</h3>
                <p>You are not currently enrolled in any courses. Browse the available courses and enroll to start learning.</p>
            </div>
        `;
        return;
    }
    
    // Course data
    const courses = [
        { id: 'far', title: 'Financial Accounting and Reporting', color: 'var(--far-color)', icon: 'fas fa-chart-line' },
        { id: 'aud', title: 'Auditing and Attestation', color: 'var(--aud-color)', icon: 'fas fa-search' },
        { id: 'reg', title: 'Regulation', color: 'var(--reg-color)', icon: 'fas fa-gavel' },
        { id: 'bar', title: 'Business Analysis and Reporting', color: 'var(--bar-color)', icon: 'fas fa-chart-bar' },
        { id: 'isc', title: 'Information Systems and Controls', color: 'var(--isc-color)', icon: 'fas fa-laptop-code' },
        { id: 'tcp', title: 'Tax Compliance and Planning', color: 'var(--tcp-color)', icon: 'fas fa-file-invoice-dollar' }
    ];
    
    // Create enrolled course cards
    enrolledCourses.forEach(courseId => {
        const course = courses.find(c => c.id === courseId);
        if (!course) return;
        
        const progress = userData.progress && userData.progress[courseId] ? userData.progress[courseId] : 0;
        
        const courseCard = document.createElement('div');
        courseCard.className = 'enrolled-course-card';
        courseCard.innerHTML = `
            <div class="course-icon" style="background-color: ${course.color}">
                <i class="${course.icon}"></i>
            </div>
            <div class="course-info">
                <h3>${course.id.toUpperCase()} - ${course.title}</h3>
                <div class="course-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${progress}%; background-color: ${course.color}"></div>
                    </div>
                    <span class="progress-percentage">${progress}%</span>
                </div>
            </div>
            <a href="${courseId}/index.html" class="btn-secondary">Continue</a>
        `;
        
        enrolledCoursesContainer.appendChild(courseCard);
    });
}

// Function to check if user is enrolled in a course
function isUserEnrolled(userData, courseId) {
    if (!userData.enrolledCourses) return false;
    return userData.enrolledCourses.includes(courseId);
}

// Function to enroll user in a course
function enrollInCourse(userId, courseId) {
    // Get user data
    const userData = getUserData();
    if (!userData) return;
    
    // Initialize enrolled courses if not exists
    if (!userData.enrolledCourses) {
        userData.enrolledCourses = [];
    }
    
    // Check if already enrolled
    if (userData.enrolledCourses.includes(courseId)) return;
    
    // Add course to enrolled courses
    userData.enrolledCourses.push(courseId);
    
    // Add to activity log
    if (!userData.activity) {
        userData.activity = [];
    }
    
    // Get course title
    let courseTitle = courseId.toUpperCase();
    switch(courseId) {
        case 'far': courseTitle += ' - Financial Accounting and Reporting'; break;
        case 'aud': courseTitle += ' - Auditing and Attestation'; break;
        case 'reg': courseTitle += ' - Regulation'; break;
        case 'bar': courseTitle += ' - Business Analysis and Reporting'; break;
        case 'isc': courseTitle += ' - Information Systems and Controls'; break;
        case 'tcp': courseTitle += ' - Tax Compliance and Planning'; break;
    }
    
    // Add enrollment activity
    userData.activity.push({
        type: 'enrolled',
        description: `Enrolled in ${courseTitle}`,
        timestamp: new Date().toISOString(),
        courseId: courseId
    });
    
    // Save updated user data
    saveUserData(userData);
    
    // Reload page to reflect changes
    window.location.reload();
}

// Function to update course overview section
function updateCourseOverview(userData) {
    // Get all course overview cards
    const courseCards = document.querySelectorAll('.course-overview-card');
    if (!courseCards.length) return;
    
    // Get enrolled courses or initialize if not exists
    const enrolledCourses = userData.enrolledCourses || [];
    
    // Update each course card
    courseCards.forEach(card => {
        const courseId = card.getAttribute('data-course');
        const isEnrolled = enrolledCourses.includes(courseId);
        
        // Get elements
        const enrollmentStatus = card.querySelector('.enrollment-status');
        const progressBar = card.querySelector('.progress-bar');
        const progressPercentage = card.querySelector('.progress-percentage');
        const enrollBtn = card.querySelector('.enroll-btn');
        
        // Get progress for this course
        const progress = userData.progress && userData.progress[courseId] ? userData.progress[courseId] : 0;
        
        // Update enrollment status
        if (isEnrolled) {
            enrollmentStatus.className = 'enrollment-status enrolled';
            enrollmentStatus.innerHTML = '<span>Enrolled</span>';
            
            // Update progress
            progressBar.style.width = progress + '%';
            progressPercentage.textContent = progress + '%';
            
            // Update enroll button to unenroll
            enrollBtn.textContent = 'Unenroll';
            enrollBtn.classList.add('unenroll');
            
            // Add unenroll event listener
            enrollBtn.onclick = function() {
                if (confirm(`Are you sure you want to unenroll from ${courseId.toUpperCase()}? Your progress will be saved.`)) {
                    unenrollFromCourse(userData.id, courseId);
                }
            };
        } else {
            enrollmentStatus.className = 'enrollment-status not-enrolled';
            enrollmentStatus.innerHTML = '<span>Not Enrolled</span>';
            
            // Reset progress
            progressBar.style.width = '0%';
            progressPercentage.textContent = '0%';
            
            // Update button to enroll
            enrollBtn.textContent = 'Enroll';
            enrollBtn.classList.remove('unenroll');
            
            // Add enroll event listener
            enrollBtn.onclick = function() {
                enrollInCourse(userData.id, courseId);
            };
        }
    });
    
    // Add event listeners to enrollment buttons
    setupEnrollmentButtons();
}

// Function to setup enrollment buttons
function setupEnrollmentButtons() {
    // Get all enrollment buttons in the courses tab
    const enrollBtns = document.querySelectorAll('#courses-tab .enroll-btn:not(.unenroll)');
    
    // Add click event listeners
    enrollBtns.forEach(btn => {
        if (!btn.hasAttribute('data-listener-added')) {
            btn.setAttribute('data-listener-added', 'true');
            btn.addEventListener('click', function() {
                const courseId = this.getAttribute('data-course');
                enrollInCourse(null, courseId);
            });
        }
    });
}

// Function to unenroll from a course
function unenrollFromCourse(userId, courseId) {
    // Get user data
    const userData = getUserData();
    if (!userData || !userData.enrolledCourses) return;
    
    // Remove course from enrolled courses
    userData.enrolledCourses = userData.enrolledCourses.filter(id => id !== courseId);
    
    // Add to activity log
    if (!userData.activity) {
        userData.activity = [];
    }
    
    // Get course title
    let courseTitle = courseId.toUpperCase();
    switch(courseId) {
        case 'far': courseTitle += ' - Financial Accounting and Reporting'; break;
        case 'aud': courseTitle += ' - Auditing and Attestation'; break;
        case 'reg': courseTitle += ' - Regulation'; break;
        case 'bar': courseTitle += ' - Business Analysis and Reporting'; break;
        case 'isc': courseTitle += ' - Information Systems and Controls'; break;
        case 'tcp': courseTitle += ' - Tax Compliance and Planning'; break;
    }
    
    // Add unenrollment activity
    userData.activity.push({
        type: 'unenrolled',
        description: `Unenrolled from ${courseTitle}`,
        timestamp: new Date().toISOString(),
        courseId: courseId
    });
    
    // Save updated user data
    saveUserData(userData);
    
    // Reload page to reflect changes
    window.location.reload();
}

// Function to logout
function logout() {
    // Clear session
    sessionStorage.removeItem('cpaUserSession');
    localStorage.removeItem('cpaUserSession');
    
    // Redirect to home page
    window.location.href = 'index.html';
}
