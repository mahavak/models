// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    // Toggle mobile menu
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed nav
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Highlight active section in navigation
    function highlightActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.pageYOffset + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        });
    }

    // Navbar scroll effect
    function handleNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.backgroundColor = '#ffffff';
            navbar.style.backdropFilter = 'none';
        }
    }

    // Scroll event listeners
    window.addEventListener('scroll', function() {
        highlightActiveSection();
        handleNavbarScroll();
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.pillar-card, .toolkit-category, .case-study, .challenge-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add hover effects to cards
    const cards = document.querySelectorAll('.pillar-card, .toolkit-category, .challenge-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Table row hover effects
    const tableRows = document.querySelectorAll('.misjudgment-table tr');
    tableRows.forEach((row, index) => {
        if (index > 0) { // Skip header row
            row.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#e8eaf6';
                this.style.transition = 'background-color 0.3s ease';
            });
            
            row.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
            });
        }
    });

    // Add copy functionality to formulas
    const formulas = document.querySelectorAll('.formula');
    formulas.forEach(formula => {
        formula.style.cursor = 'pointer';
        formula.title = 'Click to copy';
        
        formula.addEventListener('click', function() {
            const text = this.textContent;
            navigator.clipboard.writeText(text).then(() => {
                const originalText = this.textContent;
                this.textContent = 'Copied!';
                this.style.backgroundColor = '#4caf50';
                this.style.color = 'white';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.backgroundColor = '#f5f5f5';
                    this.style.color = '';
                }, 1000);
            });
        });
    });

    // Back to top button functionality
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '↑';
    backToTopButton.className = 'back-to-top';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: var(--accent-color);
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s ease, transform 0.3s ease;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(backToTopButton);

    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.style.opacity = '1';
        } else {
            backToTopButton.style.opacity = '0';
        }
    });

    // Add loading animation
    window.addEventListener('load', function() {
        document.body.style.opacity = '1';
        document.body.style.transition = 'opacity 0.5s ease';
    });

    // Initialize
    document.body.style.opacity = '0';
    highlightActiveSection();
});

// Add some utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance optimization for scroll events
const debouncedScroll = debounce(function() {
    highlightActiveSection();
    handleNavbarScroll();
}, 10);

window.addEventListener('scroll', debouncedScroll);

// Language switching functionality
let currentLanguage = 'en';

function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`lang-${lang}`).classList.add('active');
    
    // Update all elements with data attributes
    document.querySelectorAll('[data-en][data-nl]').forEach(element => {
        if (element.hasAttribute(`data-${lang}`)) {
            element.textContent = element.getAttribute(`data-${lang}`);
        }
    });
    
    // Update document language
    document.documentElement.lang = lang;
    
    // Update meta tags for SEO
    updateMetaTags(lang);
    
    // Save language preference
    localStorage.setItem('preferredLanguage', lang);
    
    // Update social sharing buttons
    updateSocialSharing(lang);
}

function updateMetaTags(lang) {
    const titles = {
        'en': "Charlie Munger's Mental Models Framework - The Latticework of Worldly Wisdom",
        'nl': "Charlie Munger's Mentale Modellen Raamwerk - Het Raamwerk van Wereldse Wijsheid"
    };
    
    const descriptions = {
        'en': "Comprehensive analysis of Charlie Munger's 25 psychological tendencies and 80+ mental models. Learn the latticework approach to decision-making used by Berkshire Hathaway.",
        'nl': "Uitgebreide analyse van Charlie Munger's 25 psychologische neigingen en 80+ mentale modellen. Leer de raamwerk benadering voor besluitvorming gebruikt door Berkshire Hathaway."
    };
    
    // Update title
    document.title = titles[lang];
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', descriptions[lang]);
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        ogTitle.setAttribute('content', titles[lang]);
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
        ogDescription.setAttribute('content', descriptions[lang]);
    }
    
    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
        twitterTitle.setAttribute('content', titles[lang]);
    }
    
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
        twitterDescription.setAttribute('content', descriptions[lang]);
    }
}

function updateSocialSharing(lang) {
    const shareTexts = {
        'en': {
            twitter: "Charlie Munger's Mental Models Framework - The Latticework of Worldly Wisdom",
            email: "Charlie Munger's Mental Models Framework",
            emailBody: "Check out this comprehensive analysis of Charlie Munger's mental models: https://mahavak.github.io/models/"
        },
        'nl': {
            twitter: "Charlie Munger's Mentale Modellen Raamwerk - Het Raamwerk van Wereldse Wijsheid", 
            email: "Charlie Munger's Mentale Modellen Raamwerk",
            emailBody: "Bekijk deze uitgebreide analyse van Charlie Munger's mentale modellen: https://mahavak.github.io/models/"
        }
    };
    
    // Update Twitter share link
    const twitterBtn = document.querySelector('.social-btn.twitter');
    if (twitterBtn) {
        const newUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTexts[lang].twitter)}&url=https://mahavak.github.io/models/`;
        twitterBtn.setAttribute('href', newUrl);
    }
    
    // Update email share link
    const emailBtn = document.querySelector('.social-btn.email');
    if (emailBtn) {
        const newUrl = `mailto:?subject=${encodeURIComponent(shareTexts[lang].email)}&body=${encodeURIComponent(shareTexts[lang].emailBody)}`;
        emailBtn.setAttribute('href', newUrl);
    }
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'nl')) {
        switchLanguage(savedLanguage);
    } else {
        // Detect browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('nl')) {
            switchLanguage('nl');
        } else {
            switchLanguage('en');
        }
    }
});