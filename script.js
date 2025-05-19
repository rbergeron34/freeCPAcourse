document.addEventListener('DOMContentLoaded', function() {
    // Check auth status and update UI
    updateAuthUI();
    
    // Add event listeners to enrollment buttons
    setupEnrollmentButtons();
    // Course outline sidebar functionality
    // Toggle sections in the course outline
    const sectionTitles = document.querySelectorAll('.outline-section-title');
    if (sectionTitles) {
        sectionTitles.forEach(title => {
            title.addEventListener('click', function() {
                const section = this.parentElement;
                section.classList.toggle('active');
                this.classList.toggle('active');
            });
        });
    }
    
    // Handle topic selection from sidebar
    const topicLinks = document.querySelectorAll('.outline-topic a');
    if (topicLinks) {
        topicLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const topicId = this.closest('.outline-topic').dataset.topic;
                loadTopic(topicId);
            });
        });
    }
    
    // Handle next/previous navigation
    document.addEventListener('click', function(e) {
        if (e.target.closest('.nav-button.next')) {
            e.preventDefault();
            const nextButton = e.target.closest('.nav-button.next');
            const nextTopicId = nextButton.dataset.nextTopic;
            if (nextTopicId) {
                loadTopic(nextTopicId);
            }
        } else if (e.target.closest('.nav-button.prev')) {
            e.preventDefault();
            const prevButton = e.target.closest('.nav-button.prev');
            const prevTopicId = prevButton.dataset.prevTopic;
            if (prevTopicId) {
                loadTopic(prevTopicId);
            }
        }
    });
    
    // Function to load a topic
    function loadTopic(topicId) {
        // Update active topic in sidebar
        document.querySelectorAll('.outline-topic').forEach(topic => {
            topic.classList.remove('active');
        });
        const activeTopic = document.querySelector(`.outline-topic[data-topic="${topicId}"]`);
        if (activeTopic) {
            activeTopic.classList.add('active');
            
            // Ensure the section is expanded
            const parentSection = activeTopic.closest('.outline-section');
            if (parentSection) {
                parentSection.classList.add('active');
                parentSection.querySelector('.outline-section-title').classList.add('active');
            }
        }
        
        // If this is a topic in the hidden library
        const videoContent = document.querySelector(`.video-content[data-topic-id="${topicId}"]`);
        if (videoContent) {
            // Replace current video container with the selected content
            const currentContainer = document.querySelector('.current-video-container');
            if (currentContainer) {
                const newContainer = document.createElement('div');
                newContainer.className = 'current-video-container';
                newContainer.innerHTML = videoContent.innerHTML;
                currentContainer.replaceWith(newContainer);
                
                // Scroll to the top of the video
                newContainer.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
    
    // Mobile sidebar toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 992 && 
                sidebar.classList.contains('active') && 
                !e.target.closest('.sidebar') && 
                !e.target.closest('.sidebar-toggle')) {
                sidebar.classList.remove('active');
            }
        });
        
        // Update sidebar toggle icon for right-side sidebar
        if (sidebarToggle.querySelector('i')) {
            sidebarToggle.querySelector('i').className = 'fas fa-list';
        }
    }
    // Mobile menu toggle
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.classList.add('mobile-menu-btn');
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    document.querySelector('header .container').appendChild(mobileMenuBtn);
    
    const nav = document.querySelector('header nav');
    
    mobileMenuBtn.addEventListener('click', function() {
        nav.classList.toggle('active');
        this.classList.toggle('active');
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                nav.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    });
    
    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // In a real application, you would send this data to a server
            // For now, we'll just show a success message
            
            // Clear the form
            contactForm.reset();
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.classList.add('success-message');
            successMessage.textContent = 'Thank you for your message! We will get back to you soon.';
            
            contactForm.parentNode.insertBefore(successMessage, contactForm.nextSibling);
            
            // Remove the message after 5 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        });
    }
    
    // Progress tracking with user accounts
    // Function to mark a video as watched
    function markAsWatched(videoId) {
        // Check if user is logged in
        const isLoggedIn = checkAuth();
        
        // Get the current section (far, aud, reg, etc.)
        const currentSection = getCurrentSection();
        
        if (isLoggedIn) {
            // Get user data
            const userData = getUserData();
            if (!userData) return;
            
            // Check if user is enrolled in the current section
            if (currentSection && !isUserEnrolled(userData, currentSection)) {
                // Show enrollment prompt
                showEnrollmentPrompt(currentSection);
                return;
            }
            
            // Initialize watched videos array if not exists
            if (!userData.watchedVideos) {
                userData.watchedVideos = [];
            }
            
            // Check if video is already marked as watched
            if (!userData.watchedVideos.includes(videoId)) {
                // Add video to watched videos
                userData.watchedVideos.push(videoId);
                
                // Update progress
                updateProgress(userData, videoId);
                
                // Add to activity log
                if (!userData.activity) {
                    userData.activity = [];
                }
                
                // Get video title
                const videoElement = document.querySelector(`[data-video-id="${videoId}"]`);
                const videoTitle = videoElement ? videoElement.textContent.trim() : 'Unknown video';
                
                // Add activity
                userData.activity.push({
                    type: 'watched',
                    description: `Watched ${videoTitle}`,
                    timestamp: new Date().toISOString(),
                    videoId: videoId,
                    section: currentSection
                });
                
                // Save updated user data
                saveUserData(userData);
            }
        } else {
            // For non-logged in users, use localStorage
            let watchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
            
            // Check if video is already marked as watched
            if (!watchedVideos.includes(videoId)) {
                // Add video to watched videos
                watchedVideos.push(videoId);
                
                // Save to localStorage
                localStorage.setItem('watchedVideos', JSON.stringify(watchedVideos));
            }
        }
        
        // Update UI
        updateWatchedUI();
    }
    
    // Function to update watched UI
    function updateWatchedUI() {
        // Check if user is logged in
        const isLoggedIn = checkAuth();
        
        let watchedVideos = [];
        
        if (isLoggedIn) {
            // Get user data
            const userData = getUserData();
            if (userData && userData.watchedVideos) {
                watchedVideos = userData.watchedVideos;
            }
            
            // Check if user is enrolled in the current section
            const currentSection = getCurrentSection();
            if (currentSection && userData && !isUserEnrolled(userData, currentSection)) {
                // Add enrollment banner if not already present
                addEnrollmentBanner(currentSection);
            } else {
                // Remove enrollment banner if present
                removeEnrollmentBanner();
            }
        } else {
            // For non-logged in users, use localStorage
            watchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
        }
        
        // Update all video items
        const videoItems = document.querySelectorAll('.video-item');
        videoItems.forEach(item => {
            const videoId = item.getAttribute('data-video-id');
            if (watchedVideos.includes(videoId)) {
                item.classList.add('watched');
            } else {
                item.classList.remove('watched');
            }
        });
        
        // Update sidebar items
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            const videoId = item.getAttribute('data-video-id');
            if (watchedVideos.includes(videoId)) {
                item.classList.add('watched');
            } else {
                item.classList.remove('watched');
            }
        });
    }
    
    // Function to check if a video is watched
    function isWatched(videoId) {
        // Check if user is logged in
        const isLoggedIn = checkAuth();
        
        if (isLoggedIn) {
            // Get user data
            const userData = getUserData();
            if (userData && userData.watchedVideos) {
                return userData.watchedVideos.includes(videoId);
            }
            return false;
        } else {
            // Fall back to localStorage for non-logged in users
            let watchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
            return watchedVideos.includes(videoId);
        }
    }
    
    // Function to update progress UI
    function updateProgressUI() {
        let watchedVideos = [];
        
        // Check if user is logged in
        const isLoggedIn = checkAuth();
        
        if (isLoggedIn) {
            // Get user data
            const userData = getUserData();
            if (userData && userData.watchedVideos) {
                watchedVideos = userData.watchedVideos;
            }
        } else {
            // Fall back to localStorage for non-logged in users
            watchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
        }
        
        const totalVideos = document.querySelectorAll('.video-item').length;
        
        if (totalVideos > 0) {
            const progressPercentage = Math.round((watchedVideos.length / totalVideos) * 100);
            
            // Update progress bar if it exists
            const progressBar = document.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = progressPercentage + '%';
                document.querySelector('.progress-percentage').textContent = progressPercentage + '%';
            }
            
            // Update watched status for each video
            document.querySelectorAll('.video-item').forEach(item => {
                const videoId = item.dataset.videoId;
                if (isWatched(videoId)) {
                    item.classList.add('watched');
                    const watchBtn = item.querySelector('.watch-toggle');
                    if (watchBtn) {
                        watchBtn.innerHTML = '<i class="fas fa-check-circle"></i> Watched';
                    }
                }
            });
        }
    }
    
    // Function to update section progress
    function updateSectionProgress(userData, videoId) {
        // Determine which section this video belongs to
        let section = 'far'; // Default to FAR
        
        // Check URL path to determine section
        const path = window.location.pathname;
        if (path.includes('/aud/')) {
            section = 'aud';
        } else if (path.includes('/reg/')) {
            section = 'reg';
        } else if (path.includes('/bar/')) {
            section = 'bar';
        } else if (path.includes('/isc/')) {
            section = 'isc';
        } else if (path.includes('/tcp/')) {
            section = 'tcp';
        }
        
        // Initialize progress object if it doesn't exist
        if (!userData.progress) {
            userData.progress = {
                far: 0,
                aud: 0,
                reg: 0,
                bar: 0,
                isc: 0,
                tcp: 0
            };
        }
        
        // Get total videos for this section
        const sectionVideos = document.querySelectorAll('.video-item').length;
        
        // Count watched videos for this section
        let watchedCount = 0;
        document.querySelectorAll('.video-item').forEach(item => {
            const id = item.dataset.videoId;
            if (userData.watchedVideos.includes(id)) {
                watchedCount++;
            }
        });
        
        // Calculate percentage
        const percentage = sectionVideos > 0 ? Math.round((watchedCount / sectionVideos) * 100) : 0;
        
        // Update progress for this section
        userData.progress[section] = percentage;
    }
    
    // Add event listeners to watch toggle buttons
    document.querySelectorAll('.watch-toggle').forEach(button => {
        button.addEventListener('click', function() {
            const videoId = this.closest('.video-item').dataset.videoId;
            markAsWatched(videoId);
        });
    });
    
    // Initialize progress UI
    updateProgressUI();
    
    // Sticky header effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });
    
    // Add login/register button to header if not already there
    const headerNav = document.querySelector('header nav ul');
    if (headerNav && !document.querySelector('.auth-link') && !document.querySelector('.profile-link')) {
        // Create login/register link
        const authLi = document.createElement('li');
        authLi.className = 'auth-link';
        authLi.innerHTML = '<a href="login.html">Login / Register</a>';
        
        // Create profile link (hidden by default)
        const profileLi = document.createElement('li');
        profileLi.className = 'profile-link';
        profileLi.style.display = 'none';
        profileLi.innerHTML = '<a href="profile.html">My Progress</a>';
        
        // Add to nav
        headerNav.appendChild(authLi);
        headerNav.appendChild(profileLi);
        
        // Update auth UI
        updateAuthUI();
    }
});

// Auth helper functions

// Function to check authentication status
function checkAuth() {
    // Check if user is logged in via session storage
    const sessionUser = sessionStorage.getItem('cpaUserSession');
    if (sessionUser) {
        return true;
    }
    
    // Check if user is logged in via local storage
    const localUser = localStorage.getItem('cpaUserSession');
    if (localUser) {
        // Refresh session
        sessionStorage.setItem('cpaUserSession', localUser);
        return true;
    }
    
    return false;
}

// Function to check if user is enrolled in a course
function isUserEnrolled(userData, courseId) {
    if (!userData || !userData.enrolledCourses) return false;
    return userData.enrolledCourses.includes(courseId);
}

// Function to get current section from URL
function getCurrentSection() {
    const path = window.location.pathname;
    const sections = ['far', 'aud', 'reg', 'bar', 'isc', 'tcp'];
    
    for (const section of sections) {
        if (path.includes(`/${section}/`)) {
            return section;
        }
    }
    
    return null;
}

// Function to show enrollment prompt
function showEnrollmentPrompt(section) {
    // Create modal if not exists
    let modal = document.getElementById('enrollment-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'enrollment-modal';
        modal.className = 'enrollment-modal';
        
        // Get section title
        let sectionTitle = section.toUpperCase();
        switch(section) {
            case 'far': sectionTitle += ' - Financial Accounting and Reporting'; break;
            case 'aud': sectionTitle += ' - Auditing and Attestation'; break;
            case 'reg': sectionTitle += ' - Regulation'; break;
            case 'bar': sectionTitle += ' - Business Analysis and Reporting'; break;
            case 'isc': sectionTitle += ' - Information Systems and Controls'; break;
            case 'tcp': sectionTitle += ' - Tax Compliance and Planning'; break;
        }
        
        modal.innerHTML = `
            <div class="enrollment-modal-content">
                <span class="close-modal">&times;</span>
                <div class="enrollment-icon">
                    <i class="fas fa-graduation-cap"></i>
                </div>
                <h3>Enroll in ${sectionTitle}</h3>
                <p>To track your progress and mark videos as watched, you need to enroll in this course.</p>
                <div class="enrollment-actions">
                    <button class="btn enroll-btn" data-course="${section}">Enroll Now</button>
                    <button class="btn-secondary cancel-btn">Maybe Later</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        const cancelBtn = modal.querySelector('.cancel-btn');
        cancelBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        const enrollBtn = modal.querySelector('.enroll-btn');
        enrollBtn.addEventListener('click', function() {
            const courseId = this.getAttribute('data-course');
            enrollInCourse(null, courseId);
            modal.style.display = 'none';
        });
    }
    
    // Show modal
    modal.style.display = 'flex';
}

// Function to add enrollment banner
function addEnrollmentBanner(section) {
    // Check if banner already exists
    if (document.getElementById('enrollment-banner')) return;
    
    // Get section title
    let sectionTitle = section.toUpperCase();
    
    // Create banner
    const banner = document.createElement('div');
    banner.id = 'enrollment-banner';
    banner.className = 'enrollment-banner';
    banner.innerHTML = `
        <div class="enrollment-banner-content">
            <div class="enrollment-banner-icon">
                <i class="fas fa-info-circle"></i>
            </div>
            <div class="enrollment-banner-text">
                <p>You are not enrolled in the ${sectionTitle} course. Enroll to track your progress.</p>
            </div>
            <div class="enrollment-banner-actions">
                <button class="btn-small enroll-btn" data-course="${section}">Enroll</button>
                <button class="close-banner"><i class="fas fa-times"></i></button>
            </div>
        </div>
    `;
    
    // Add to page
    const mainContent = document.querySelector('.main-content') || document.querySelector('main') || document.body;
    mainContent.insertBefore(banner, mainContent.firstChild);
    
    // Add event listeners
    const enrollBtn = banner.querySelector('.enroll-btn');
    enrollBtn.addEventListener('click', function() {
        const courseId = this.getAttribute('data-course');
        enrollInCourse(null, courseId);
    });
    
    const closeBtn = banner.querySelector('.close-banner');
    closeBtn.addEventListener('click', function() {
        removeEnrollmentBanner();
    });
}

// Function to remove enrollment banner
function removeEnrollmentBanner() {
    const banner = document.getElementById('enrollment-banner');
    if (banner) {
        banner.remove();
    }
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
    
    // Remove enrollment banner
    removeEnrollmentBanner();
    
    // Show success message
    showNotification(`Successfully enrolled in ${courseTitle}!`);
    
    // Update UI
    updateWatchedUI();
}

// Function to show notification
function showNotification(message) {
    // Create notification element if not exists
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set message
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(function() {
        notification.classList.remove('show');
    }, 3000);
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

// Function to save user data
function saveUserData(userData) {
    // Get all users
    const users = JSON.parse(localStorage.getItem('cpaUsers')) || [];
    
    // Find user index
    const userIndex = users.findIndex(u => u.id === userData.id);
    
    if (userIndex !== -1) {
        // Update user data
        users[userIndex] = userData;
        
        // Save updated users
        localStorage.setItem('cpaUsers', JSON.stringify(users));
    }
}

// Function to update UI based on auth status
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
        
        // Update progress tracking message if it exists
        const progressMessage = document.querySelector('.progress-message');
        if (progressMessage) {
            progressMessage.textContent = 'Your progress is being tracked.';
        }
        
        // Update enrollment buttons if on homepage
        updateEnrollmentButtons();
    } else {
        // Show login/register links
        authLinks.forEach(link => {
            link.style.display = 'block';
        });
        
        // Hide profile links
        profileLinks.forEach(link => {
            link.style.display = 'none';
        });
        
        // Update progress tracking message if it exists
        const progressMessage = document.querySelector('.progress-message');
        if (progressMessage) {
            progressMessage.textContent = 'Login to track your progress across devices.';
        }
        
        // Hide enrollment buttons for non-logged in users
        hideAllEnrollmentButtons();
    }
}

// Function to update enrollment buttons on homepage
function updateEnrollmentButtons() {
    // Get all enrollment buttons
    const enrollBtns = document.querySelectorAll('.enroll-btn');
    
    // Get user data
    const userData = getUserData();
    
    if (userData) {
        // Get enrolled courses or initialize if not exists
        const enrolledCourses = userData.enrolledCourses || [];
        
        // Show all enrollment buttons for logged-in users
        enrollBtns.forEach(btn => {
            const courseId = btn.getAttribute('data-course');
            btn.style.display = 'inline-block';
            
            if (enrolledCourses.includes(courseId)) {
                btn.textContent = 'Enrolled';
                btn.disabled = true;
                btn.classList.add('enrolled');
            } else {
                btn.textContent = 'Enroll';
                btn.disabled = false;
                btn.classList.remove('enrolled');
            }
        });
    }
}

// Function to setup enrollment button event listeners
function setupEnrollmentButtons() {
    // Get all enrollment buttons
    const enrollBtns = document.querySelectorAll('.enroll-btn');
    
    // Add click event listeners
    enrollBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Check if user is logged in
            const isLoggedIn = checkAuth();
            
            if (!isLoggedIn) {
                // Redirect to login page
                window.location.href = 'login.html';
                return;
            }
            
            // Get course ID
            const courseId = this.getAttribute('data-course');
            
            // Enroll user in course
            enrollInCourse(null, courseId);
        });
    });
}

// Function to hide all enrollment buttons
function hideAllEnrollmentButtons() {
    // Get all enrollment buttons
    const enrollBtns = document.querySelectorAll('.enroll-btn');
    
    // Hide enrollment buttons
    enrollBtns.forEach(btn => {
        btn.style.display = 'none';
    });
}
