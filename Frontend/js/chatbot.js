/**
 * Study Pro Global - Consultation Chatbot
 * Automated chatbot for collecting user data for free consultation
 */

const Chatbot = {
    // Conversation state
    state: {
        step: 0,
        userData: {
            name: '',
            email: '',
            phone: '',
            country: '',
            academicLevel: '',
            targetCountry: '',
            fieldOfStudy: '',
            budget: '',
            timeline: ''
        },
        conversationId: null,
        isTyping: false
    },

    // Conversation flow
    flow: [
        {
            question: "Hi there! 👋 I'm your Study Pro Assistant. I'm here to help you get a FREE consultation for studying abroad. What's your name?",
            field: 'name',
            validate: (input) => input.length >= 2,
            errorMsg: "Please enter a valid name (at least 2 characters)."
        },
        {
            question: (data) => `Nice to meet you, ${data.name}! 🎓 What's your email address so we can send you the consultation details?`,
            field: 'email',
            validate: (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input),
            errorMsg: "Please enter a valid email address."
        },
        {
            question: "Great! What's your phone number? (Include country code, e.g., +880...)",
            field: 'phone',
            validate: (input) => /^[\d\s\-\+\(\)]{8,20}$/.test(input),
            errorMsg: "Please enter a valid phone number."
        },
        {
            question: "Which country are you currently in?",
            field: 'country',
            options: ['Bangladesh', 'India', 'Pakistan', 'Nepal', 'Nigeria', 'Other'],
            validate: (input) => input.length >= 2,
            errorMsg: "Please select or enter your country."
        },
        {
            question: "What's your current academic level?",
            field: 'academicLevel',
            options: ['High School', "Bachelor's Degree", "Master's Degree", 'PhD', 'Other'],
            validate: (input) => input.length >= 2,
            errorMsg: "Please select your academic level."
        },
        {
            question: "Where do you want to study? 🌍",
            field: 'targetCountry',
            options: ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Europe', 'Asia', 'Not Sure'],
            validate: (input) => input.length >= 2,
            errorMsg: "Please select your preferred destination."
        },
        {
            question: "What field would you like to study?",
            field: 'fieldOfStudy',
            options: ['Engineering', 'Business/MBA', 'Computer Science', 'Medicine', 'Arts & Humanities', 'Sciences', 'Other'],
            validate: (input) => input.length >= 2,
            errorMsg: "Please select or enter your field of study."
        },
        {
            question: "What's your approximate budget for tuition + living expenses per year? 💰",
            field: 'budget',
            options: ['Under $10,000', '$10,000 - $25,000', '$25,000 - $50,000', 'Above $50,000', 'Need Scholarship'],
            validate: (input) => input.length >= 2,
            errorMsg: "Please select your budget range."
        },
        {
            question: "When are you planning to start your studies?",
            field: 'timeline',
            options: ['2025 Fall', '2026 Spring', '2026 Fall', 'Not Sure Yet'],
            validate: (input) => input.length >= 2,
            errorMsg: "Please select your planned start time."
        }
    ],

    // Initialize chatbot
    init() {
        this.setupEventListeners();
        this.showInitialMessage();
    },

    // Setup event listeners
    setupEventListeners() {
        const toggle = document.getElementById('chatbotToggle');
        const closeBtn = document.getElementById('chatbotClose');
        const sendBtn = document.getElementById('chatbotSend');
        const input = document.getElementById('chatbotInput');
        const window = document.getElementById('chatbotWindow');

        if (toggle) {
            toggle.addEventListener('click', () => this.toggleWindow());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.toggleWindow(false));
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.handleUserInput());
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleUserInput();
                }
            });
        }

        // Handle option clicks via event delegation
        const messagesContainer = document.getElementById('chatbotMessages');
        if (messagesContainer) {
            messagesContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('chatbot-option')) {
                    this.handleOptionClick(e.target.textContent);
                }
            });
        }
    },

    // Toggle chat window
    toggleWindow(show = null) {
        const window = document.getElementById('chatbotWindow');
        const badge = document.querySelector('.chatbot-badge');
        
        if (window) {
            const isHidden = window.style.display === 'none';
            const shouldShow = show !== null ? show : isHidden;
            window.style.display = shouldShow ? 'flex' : 'none';
            
            if (shouldShow && badge) {
                badge.style.display = 'none';
            }
        }
    },

    // Show initial welcome message
    showInitialMessage() {
        setTimeout(() => {
            this.addMessage(this.flow[0].question, 'bot');
        }, 500);
    },

    // Add message to chat
    addMessage(text, sender, options = null) {
        const container = document.getElementById('chatbotMessages');
        if (!container) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = `chatbot-message ${sender}`;
        // Use textContent for all user or DOM-derived messages to prevent XSS.
        if (sender === 'bot') {
            // If bot messages require formatting and are trusted, use DOMPurify here.
            msgDiv.textContent = text;
        } else {
            msgDiv.textContent = text;
        }

        container.appendChild(msgDiv);

        // Add options if provided
        if (options && sender === 'bot') {
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'chatbot-options';
            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'chatbot-option';
                btn.textContent = opt;
                optionsDiv.appendChild(btn);
            });
            container.appendChild(optionsDiv);
        }

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    },

    // Show typing indicator
    showTyping() {
        const container = document.getElementById('chatbotMessages');
        if (!container || this.state.isTyping) return;

        this.state.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot typing';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        container.appendChild(typingDiv);
        container.scrollTop = container.scrollHeight;
    },

    // Hide typing indicator
    hideTyping() {
        const typing = document.getElementById('typingIndicator');
        if (typing) {
            typing.remove();
        }
        this.state.isTyping = false;
    },

    // Handle user input
    handleUserInput() {
        const input = document.getElementById('chatbotInput');
        if (!input) return;

        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        this.processInput(text);
    },

    // Handle option button click
    handleOptionClick(optionText) {
        // Remove options buttons
        const optionsDivs = document.querySelectorAll('.chatbot-options');
        optionsDivs.forEach(div => div.remove());
        
        this.processInput(optionText);
    },

    // Process user input
    processInput(text) {
        // Add user message
        this.addMessage(text, 'user');

        // Validate and process
        const currentFlow = this.flow[this.state.step];
        
        if (currentFlow && currentFlow.validate(text)) {
            // Save data
            this.state.userData[currentFlow.field] = text;
            this.state.step++;

            // Show next question or complete
            this.showTyping();
            setTimeout(() => {
                this.hideTyping();
                
                if (this.state.step < this.flow.length) {
                    const nextFlow = this.flow[this.state.step];
                    const question = typeof nextFlow.question === 'function' 
                        ? nextFlow.question(this.state.userData) 
                        : nextFlow.question;
                    this.addMessage(question, 'bot', nextFlow.options);
                } else {
                    this.completeConsultation();
                }
            }, 800);
        } else if (currentFlow) {
            // Show error
            this.showTyping();
            setTimeout(() => {
                this.hideTyping();
                this.addMessage(currentFlow.errorMsg, 'bot');
            }, 500);
        }
    },

    // Complete consultation request
    async completeConsultation() {
        const userData = this.state.userData;
        
        // Show confirmation message
        this.addMessage(`
            🎉 <strong>Thank you, ${userData.name}!</strong><br><br>
            I've collected all the information for your FREE consultation:<br>
            📧 Email: ${userData.email}<br>
            📱 Phone: ${userData.phone}<br>
            🌍 Target: ${userData.targetCountry}<br>
            📚 Field: ${userData.fieldOfStudy}<br><br>
            <strong>Within a short time, you'll receive your personalized consultation results via email!</strong><br><br>
            Our expert advisors will analyze your profile and suggest the best universities and scholarship opportunities for you. 🎓
        `, 'bot');

        // Try to submit to backend
        try {
            if (typeof API !== 'undefined' && typeof API.post === 'function') {
                const response = await API.post('/chat/consultation-request', {
                    ...userData,
                    requestType: 'free_consultation',
                    source: 'chatbot'
                });
                
                if (response.success) {
                    console.log('Consultation request submitted successfully');
                }
            }
        } catch (error) {
            console.error('Failed to submit consultation request:', error);
        }

        // Store in sessionStorage as backup (cleared when browser closes for privacy)
        try {
            const existingRequests = JSON.parse(sessionStorage.getItem('consultationRequests') || '[]');
            existingRequests.push({
                name: userData.name,
                email: userData.email,
                targetCountry: userData.targetCountry,
                timestamp: new Date().toISOString()
            });
            sessionStorage.setItem('consultationRequests', JSON.stringify(existingRequests));
        } catch (e) {
            // Ignore storage errors
        }

        // Show follow-up message
        setTimeout(() => {
            this.addMessage(`
                Meanwhile, feel free to explore our:<br><br>
                • <a href="#universities" onclick="Chatbot.toggleWindow(false)">Universities</a> - Browse partner institutions<br>
                • <a href="#scholarships" onclick="Chatbot.toggleWindow(false)">Scholarships</a> - Available funding<br>
                • <a href="#pricing" onclick="Chatbot.toggleWindow(false)">Pricing</a> - Subscription plans<br><br>
                Have more questions? Just type them here! 😊
            `, 'bot');

            // Reset for general questions
            this.state.step = -1; // Special state for general questions
        }, 2000);
    },

    // Handle general questions after consultation
    handleGeneralQuestion(text) {
        const lowerText = text.toLowerCase();

        // Simple keyword-based responses
        const responses = {
            'scholarship': 'We offer access to thousands of scholarships! Check out our <a href="#scholarships">Scholarships</a> section or subscribe to our Global Pack for auto-matching with eligible scholarships. 🎓',
            'ielts': 'We provide IELTS preparation resources and discounts on language tests with our Global Application Pack!',
            'toefl': 'TOEFL preparation materials are included in our subscription plans. Our Global Pack offers language test discounts too!',
            'visa': 'Our advisors help with visa guidance as part of the consultation. Book a consultation for personalized visa support!',
            'price': 'We have 3 plans: Asia Pack ($25), Europe Pack ($50), and Global Pack ($100) - all valid for 2 years! Check <a href="#pricing">Pricing</a> for details.',
            'cost': 'Our subscription plans start from just $25 for the Asia Pack. Visit our <a href="#pricing">Pricing</a> section for all options.',
            'free': 'Yes! You get 3 FREE university applications even without a subscription. Sign up to get started!',
            'application': 'We help with complete application support including document preparation, SOP writing, and interview guidance.',
            'usa': 'The USA is a popular destination! Our Global Pack gives you access to top US universities. Average tuition ranges from $25,000-$55,000/year.',
            'uk': 'The UK offers excellent education with shorter degree programs. Masters programs are typically 1 year. Our Europe Pack includes UK access!',
            'canada': 'Canada is known for post-study work opportunities and pathway to PR. Included in our Global Pack!',
            'germany': 'Germany offers many tuition-free programs at public universities! Included in our Europe Pack.',
            'help': 'I can help with: Scholarships, Applications, Pricing, University info, Visa guidance. What would you like to know?',
            'hi': 'Hello! 👋 How can I assist you today?',
            'hello': 'Hi there! 👋 How can I help you with your study abroad journey?',
            'thank': "You're welcome! 😊 Feel free to ask if you have more questions."
        };

        // Find matching response
        for (const [keyword, response] of Object.entries(responses)) {
            if (lowerText.includes(keyword)) {
                this.showTyping();
                setTimeout(() => {
                    this.hideTyping();
                    this.addMessage(response, 'bot');
                }, 600);
                return;
            }
        }

        // Default response
        this.showTyping();
        setTimeout(() => {
            this.hideTyping();
            this.addMessage(`Thanks for your question! For detailed assistance, I recommend:<br><br>
                • <a href="#contact">Contact Us</a> - Submit an inquiry<br>
                • <a href="#register">Register</a> - Get personalized support<br>
                • Book a consultation with our experts<br><br>
                Is there anything specific about our services I can help with?`, 'bot');
        }, 800);
    }
};

// Process input with general question handling
const originalProcessInput = Chatbot.processInput.bind(Chatbot);
Chatbot.processInput = function(text) {
    if (this.state.step === -1) {
        // Handle general questions after consultation
        this.addMessage(text, 'user');
        this.handleGeneralQuestion(text);
    } else {
        originalProcessInput(text);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Chatbot.init();
});
