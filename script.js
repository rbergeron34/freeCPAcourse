document.addEventListener('DOMContentLoaded', function() {
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
    
    // Progress tracking (simulated)
    // In a real application, this would be connected to a backend
    // For demonstration, we'll use localStorage
    
    // Function to mark a video as watched
    function markAsWatched(videoId) {
        let watchedVideos = JSON.parse(localStorage.getItem('watchedVideos')) || [];
        if (!watchedVideos.includes(videoId)) {
            watchedVideos.push(videoId);
            localStorage.setItem('watchedVideos', JSON.stringify(watchedVideos));
        }
        updateProgressUI();
    }
    
    // Function to check if a video is watched
    function isWatched(videoId) {
        let watchedVideos = JSON.parse(localStorage.getItem('watchedVideos')) || [];
        return watchedVideos.includes(videoId);
    }
    
    // Function to update progress UI
    function updateProgressUI() {
        let watchedVideos = JSON.parse(localStorage.getItem('watchedVideos')) || [];
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
});
