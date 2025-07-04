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

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
        }
    });

    // Touch gestures for mobile
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    });

    document.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;
        
        // Swipe up to close mobile menu
        if (diff > swipeThreshold && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    }

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
    
    // Update aria-labels
    document.querySelectorAll('[data-en-label][data-nl-label]').forEach(element => {
        if (element.hasAttribute(`data-${lang}-label`)) {
            element.setAttribute('aria-label', element.getAttribute(`data-${lang}-label`));
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
    
    // Track language change in Google Analytics
    if (window.gtag) {
        gtag('event', 'language_change', {
            event_category: 'UI',
            event_label: lang,
            custom_language: lang
        });
    }
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

// Dark mode functionality
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update theme color meta tag
    const themeColor = newTheme === 'dark' ? '#121212' : '#1a237e';
    document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColor);
    
    // Track theme change in Google Analytics
    if (window.gtag) {
        gtag('event', 'theme_change', {
            event_category: 'UI',
            event_label: newTheme,
            value: newTheme === 'dark' ? 1 : 0
        });
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDarkScheme.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Update theme color based on current theme
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const themeColor = currentTheme === 'dark' ? '#121212' : '#1a237e';
    document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColor);
    
    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
        }
    });
});

// Search functionality
const searchData = [
    // Mental Models
    { title: "Margin of Safety", content: "Reminds us that plans can fail and we need buffers", section: "philosophy", tags: ["safety", "planning", "risk"] },
    { title: "Reciprocity", content: "Reveals how proactive positivity can influence outcomes in our favor", section: "philosophy", tags: ["psychology", "influence"] },
    { title: "Compounding", content: "Shows how small, consistent improvements lead to extraordinary results over time", section: "philosophy", tags: ["growth", "time", "investment"] },
    { title: "Opportunity Cost", content: "Forces us to consider what we're giving up when we make any choice", section: "philosophy", tags: ["economics", "decision"] },
    { title: "Inversion", content: "Invert, always invert - solve problems by thinking backwards", section: "pillars", tags: ["problem-solving", "thinking"] },
    { title: "Circle of Competence", content: "Understanding the boundaries of your knowledge and expertise", section: "pillars", tags: ["knowledge", "expertise", "limits"] },
    // Psychological Tendencies
    { title: "Reward and Punishment Superresponse", content: "The power of incentives in shaping behavior", section: "psychology", tags: ["incentives", "behavior"] },
    { title: "Liking/Loving Tendency", content: "We ignore faults of and comply with wishes of those we like", section: "psychology", tags: ["bias", "emotions"] },
    { title: "Disliking/Hating Tendency", content: "We ignore virtues in those we dislike", section: "psychology", tags: ["bias", "emotions"] },
    { title: "Doubt-Avoidance Tendency", content: "The brain resolves doubt by making decisions quickly", section: "psychology", tags: ["decision-making", "uncertainty"] },
    { title: "Inconsistency-Avoidance Tendency", content: "People are reluctant to change their minds", section: "psychology", tags: ["consistency", "change"] },
    { title: "Curiosity Tendency", content: "Humans have an innate drive to learn and discover", section: "psychology", tags: ["learning", "discovery"] },
    { title: "Kantian Fairness Tendency", content: "People expect fair treatment and reciprocate accordingly", section: "psychology", tags: ["fairness", "reciprocity"] },
    { title: "Envy/Jealousy Tendency", content: "Comparison with others drives behavior", section: "psychology", tags: ["emotions", "comparison"] },
    { title: "Reciprocation Tendency", content: "People feel obligated to return favors", section: "psychology", tags: ["social", "influence"] },
    { title: "Influence-from-Mere-Association", content: "We associate things incorrectly due to past experiences", section: "psychology", tags: ["association", "bias"] },
    { title: "Simple, Pain-Avoiding Psychological Denial", content: "People deny reality when it's too painful", section: "psychology", tags: ["denial", "psychology"] },
    { title: "Excessive Self-Regard Tendency", content: "People overestimate their own abilities", section: "psychology", tags: ["ego", "overconfidence"] },
    { title: "Overoptimism Tendency", content: "Excessive optimism about outcomes", section: "psychology", tags: ["optimism", "bias"] },
    { title: "Deprival-Superreaction Tendency", content: "Loss aversion - losses hurt more than gains feel good", section: "psychology", tags: ["loss", "aversion"] },
    { title: "Social-Proof Tendency", content: "People copy the actions of others", section: "psychology", tags: ["social", "conformity"] },
    { title: "Contrast-Misreaction Tendency", content: "Judgments are affected by comparisons", section: "psychology", tags: ["comparison", "judgment"] },
    { title: "Stress-Influence Tendency", content: "Stress affects decision-making ability", section: "psychology", tags: ["stress", "decisions"] },
    { title: "Availability-Misweighing Tendency", content: "Overweighting easily recalled information", section: "psychology", tags: ["memory", "bias"] },
    { title: "Use-It-or-Lose-It Tendency", content: "Skills decay without practice", section: "psychology", tags: ["practice", "skills"] },
    { title: "Drug-Misinfluence Tendency", content: "Substances impair judgment", section: "psychology", tags: ["substances", "judgment"] },
    { title: "Senescence-Misinfluence Tendency", content: "Aging affects cognitive function", section: "psychology", tags: ["aging", "cognition"] },
    { title: "Authority-Misinfluence Tendency", content: "Overreliance on authority figures", section: "psychology", tags: ["authority", "influence"] },
    { title: "Twaddle Tendency", content: "Tendency to speak nonsense", section: "psychology", tags: ["communication", "clarity"] },
    { title: "Reason-Respecting Tendency", content: "People comply better when given reasons", section: "psychology", tags: ["reasoning", "compliance"] },
    { title: "Lollapalooza Tendency", content: "Multiple tendencies acting together create extreme outcomes", section: "psychology", tags: ["synergy", "extreme"] }
];

function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const query = searchInput.value.toLowerCase().trim();
    
    if (query.length < 2) {
        searchResults.classList.remove('active');
        return;
    }
    
    const results = searchData.filter(item => {
        return item.title.toLowerCase().includes(query) || 
               item.content.toLowerCase().includes(query) ||
               item.tags.some(tag => tag.toLowerCase().includes(query));
    });
    
    displaySearchResults(results, query);
    
    // Track search in Google Analytics
    if (window.gtag && query.length > 2) {
        gtag('event', 'search', {
            search_term: query,
            event_category: 'Engagement',
            value: results.length
        });
    }
}

function displaySearchResults(results, query) {
    const searchResults = document.getElementById('search-results');
    const lang = currentLanguage || 'en';
    
    if (results.length === 0) {
        const noResultsText = lang === 'nl' ? 'Geen resultaten gevonden' : 'No results found';
        searchResults.innerHTML = `<div class="search-no-results">${noResultsText}</div>`;
    } else {
        const resultsHtml = results.map(result => {
            const highlightedTitle = highlightText(result.title, query);
            const highlightedContent = highlightText(result.content, query);
            
            return `
                <div class="search-result-item" onclick="navigateToSection('${result.section}')">
                    <div class="search-result-title">${highlightedTitle}</div>
                    <div class="search-result-excerpt">${highlightedContent}</div>
                </div>
            `;
        }).join('');
        
        searchResults.innerHTML = resultsHtml;
    }
    
    searchResults.classList.add('active');
}

function highlightText(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

function navigateToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 150; // Account for fixed nav and search
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
        
        // Clear search
        document.getElementById('search-input').value = '';
        document.getElementById('search-results').classList.remove('active');
    }
}

// Initialize search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(performSearch, 300));
        
        // Update placeholder based on language
        searchInput.addEventListener('focus', function() {
            const lang = currentLanguage || 'en';
            const placeholder = this.getAttribute(`data-${lang}-placeholder`);
            if (placeholder) {
                this.placeholder = placeholder;
            }
        });

        // Mobile-specific search improvements
        searchInput.addEventListener('focus', function() {
            // Scroll search into view on mobile
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });

        // Hide search results when clicking outside
        document.addEventListener('click', function(e) {
            if (searchResults && !searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.remove('active');
            }
        });

        // Hide search results on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && searchResults) {
                searchResults.classList.remove('active');
                searchInput.blur();
            }
        });
    }
});

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/models/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful:', registration.scope);
                
                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60000); // Check every minute
            })
            .catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });
    });
}

// PWA install prompt
let deferredPrompt;
const installButton = document.createElement('button');
installButton.className = 'install-button';
installButton.innerHTML = '📱 Install App';
installButton.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button
    installButton.style.display = 'block';
    
    // Add button to page
    const navbar = document.querySelector('.nav-container');
    if (navbar && !navbar.contains(installButton)) {
        navbar.appendChild(installButton);
    }
});

installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        
        if (outcome === 'accepted') {
            installButton.style.display = 'none';
        }
        
        deferredPrompt = null;
    }
});

// Detect if app is installed
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    installButton.style.display = 'none';
    
    // Track installation
    if (window.gtag) {
        gtag('event', 'app_install', {
            event_category: 'PWA',
            event_label: 'Mental Models Framework'
        });
    }
});

// Check if running as PWA
function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone || 
           document.referrer.includes('android-app://');
}

// Add PWA class to body if running as PWA
if (isPWA()) {
    document.body.classList.add('pwa-mode');
}

// Offline detection
let offlineIndicator;

function createOfflineIndicator() {
    offlineIndicator = document.createElement('div');
    offlineIndicator.className = 'offline-indicator';
    offlineIndicator.innerHTML = currentLanguage === 'nl' ? '📡 Je bent offline' : '📡 You are offline';
    document.body.appendChild(offlineIndicator);
}

function updateOnlineStatus() {
    if (!offlineIndicator) {
        createOfflineIndicator();
    }
    
    if (!navigator.onLine) {
        offlineIndicator.classList.add('show');
        offlineIndicator.innerHTML = currentLanguage === 'nl' ? '📡 Je bent offline' : '📡 You are offline';
    } else {
        offlineIndicator.classList.remove('show');
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Check initial status
document.addEventListener('DOMContentLoaded', updateOnlineStatus);