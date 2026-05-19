// Set Current Year in Footer
document.getElementById('year').textContent = new Date().getFullYear();

// Particle System Logic
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particlesArray;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = {
    x: null,
    y: null
};

window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.baseVy = Math.random() * 1.5 + 0.5; // fall speed
        this.baseVx = 0;
        this.vx = this.baseVx;
        this.vy = this.baseVy;
        const colors = [
            '255, 153, 0', // AWS Orange
            '59, 130, 246', // Network Blue
            '0, 210, 255', // Cyan
            '255, 255, 255' // White
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        this.color = `rgba(${randomColor}, ${Math.random() * 0.5 + 0.2})`;
    }

    update() {
        // Calculate tilt based on mouse position relative to center of screen
        let tilt = 0;
        if (mouse.x !== null) {
            // Maps mouse.x from [0, width] to [-1, 1]
            tilt = (mouse.x / canvas.width) * 2 - 1;
        }

        // Apply tilt to horizontal velocity (max tilt speed is 1.5)
        this.vx = this.baseVx + (tilt * 1.5);
        this.vy = this.baseVy;

        this.x += this.vx;
        this.y += this.vy;

        // Reset if goes off screen
        if (this.y > canvas.height) {
            this.y = 0 - this.size;
            this.x = Math.random() * canvas.width;
        } else if (this.y < 0 - this.size * 2 && this.vy < 0) {
            this.y = canvas.height + this.size;
        }

        if (this.x > canvas.width) {
            this.x = 0;
        } else if (this.x < 0) {
            this.x = canvas.width;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}

function initParticles() {
    particlesArray = [];
    const numberOfParticles = (canvas.width * canvas.height) / 8000;
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();


// Custom Smooth Scrolling (Slow & Relaxed)
let isAutoScrolling = false;
let autoScrollRAF = null;

function stopAutoScroll() {
    isAutoScrolling = false;
    if (autoScrollRAF) cancelAnimationFrame(autoScrollRAF);
    window.removeEventListener('wheel', stopAutoScroll);
    window.removeEventListener('touchstart', stopAutoScroll);
    window.removeEventListener('mousedown', stopAutoScroll);
}

function startAutoScrollSkills(skillsSection) {
    if (isAutoScrolling) stopAutoScroll();
    
    // Only auto-scroll on smaller screens (phones/tablets) where content stacks
    if (window.innerWidth > 992) return;

    window.addEventListener('wheel', stopAutoScroll, {passive: true});
    window.addEventListener('touchstart', stopAutoScroll, {passive: true});
    window.addEventListener('mousedown', stopAutoScroll, {passive: true});

    setTimeout(() => {
        isAutoScrolling = true;
        let lastTime = null;
        const pixelsPerSecond = 40; // Slow, readable speed

        function autoScrollStep(timestamp) {
            if (!isAutoScrolling) return;
            if (!lastTime) lastTime = timestamp;
            const delta = timestamp - lastTime;
            lastTime = timestamp;
            
            const move = (delta / 1000) * pixelsPerSecond;
            const skillsBottom = skillsSection.getBoundingClientRect().bottom + window.pageYOffset;
            const currentScrollBottom = window.pageYOffset + window.innerHeight;

            // Continue scrolling if the bottom of the section is not fully visible yet
            if (currentScrollBottom < skillsBottom + 30) {
                window.scrollBy(0, move);
                autoScrollRAF = window.requestAnimationFrame(autoScrollStep);
            } else {
                stopAutoScroll();
            }
        }
        autoScrollRAF = window.requestAnimationFrame(autoScrollStep);
    }, 1500); // Wait 1.5s after smooth scroll finishes before starting to auto-scroll
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        // Stop any ongoing auto-scroll if user clicks another link
        stopAutoScroll();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = 1200; // 1.2 seconds for a very relaxed scroll
            let start = null;

            function step(timestamp) {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                // easeInOutCubic
                const ease = progress < duration / 2 
                    ? 4 * Math.pow(progress / duration, 3) 
                    : 1 - Math.pow(-2 * progress / duration + 2, 3) / 2;
                
                window.scrollTo(0, startPosition + distance * ease);
                if (progress < duration) {
                    window.requestAnimationFrame(step);
                } else {
                    // Start auto-scroll if the target is the skills section
                    if (targetId === '#skills') {
                        startAutoScrollSkills(targetElement);
                    }
                }
            }
            window.requestAnimationFrame(step);
        }
    });
});

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if(hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        // Simple animation for hamburger lines
        hamburger.classList.toggle('toggle');
    });
}

// Close mobile menu when link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Typewriter Effect
const textArray = ["Hardware Specialist", "Network Engineer", "CCNA Certified", "Cloud Architect", "AWS Expert"];
const typingDelay = 100;
const erasingDelay = 50;
const newTextDelay = 2000; 
let textArrayIndex = 0;
let charIndex = 0;
const typedTextSpan = document.querySelector(".typewriter-text");

function type() {
    if (charIndex < textArray[textArrayIndex].length) {
        typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
        charIndex++;
        setTimeout(type, typingDelay);
    } else {
        setTimeout(erase, newTextDelay);
    }
}

function erase() {
    if (charIndex > 0) {
        typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(erase, erasingDelay);
    } else {
        textArrayIndex++;
        if (textArrayIndex >= textArray.length) textArrayIndex = 0;
        setTimeout(type, typingDelay + 1100);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    if(textArray.length) setTimeout(type, newTextDelay + 250);
});

// Scroll Reveal Animation (Intersection Observer)
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            // Stop observing once revealed
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el, index) => {
    // Add staggered delay based on element's position if there are multiple
    el.style.transitionDelay = `${index % 5 * 0.1}s`;
    observer.observe(el);
});

// Type Once Effect for Paragraphs
const typeOnceElements = document.querySelectorAll('.type-once');

const typeOnceObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const textToType = el.getAttribute('data-text');
            const delayStr = el.getAttribute('data-delay');
            const delay = delayStr ? parseInt(delayStr, 10) : 0;

            if (textToType && !el.classList.contains('typed')) {
                el.classList.add('typed');
                let charIndex = 0;
                
                function typeChar() {
                    if (charIndex < textToType.length) {
                        el.textContent += textToType.charAt(charIndex);
                        charIndex++;
                        // Random typing speed for realism
                        const randomSpeed = Math.random() * 20 + 10; 
                        setTimeout(typeChar, randomSpeed);
                    }
                }
                
                if (delay > 0) {
                    setTimeout(typeChar, delay);
                } else {
                    typeChar();
                }
            }
            observer.unobserve(el);
        }
    });
}, { threshold: 0.2 });

typeOnceElements.forEach(el => {
    typeOnceObserver.observe(el);
});

// Icon & Box Reveal Animation Logic
document.addEventListener("DOMContentLoaded", function() {
    const revealElements = document.querySelectorAll('.icon-reveal, .box-reveal');
    revealElements.forEach(el => {
        const delayStr = el.getAttribute('data-delay');
        const delay = delayStr ? parseInt(delayStr, 10) : 0;
        setTimeout(() => {
            el.classList.add('revealed');
        }, delay);
    });
});

// Contact Form Submission
const contactForm = document.getElementById('contactForm');
const formContent = document.querySelector('.form-content');
const successMessage = document.getElementById('successMessage');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('.submit-btn');
        submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
        
        // Simulate a network request delay (1.5 seconds)
        setTimeout(() => {
            formContent.style.display = 'none';
            successMessage.style.display = 'block';
            this.reset();
        }, 1500);
    });
}
