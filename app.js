document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;

    // --- MOCK DATA (Replace with API calls) ---
    // This data simulates what your backend would provide.
    const MOCK_CURRENT_USER = { id: 'user1', username: 'MyUsername' };
    const MOCK_USERS = [
        { id: 'user2', username: 'Alice' },
        { id: 'user3', username: 'Bob' },
        { id: 'user4', username: 'Charlie' },
    ];
    const MOCK_CONVERSATIONS = [
        { id: 'conv1', withUser: { id: 'user2', username: 'Alice' }, lastMessage: 'Sounds good!', timestamp: '10:42 AM' },
        { id: 'conv2', withUser: { id: 'user3', username: 'Bob' }, lastMessage: 'See you tomorrow.', timestamp: 'Yesterday' },
    ];
    const MOCK_MESSAGES = {
        'conv1': [
            { from: 'user2', text: 'Hey, how are you?', timestamp: '10:40 AM' },
            { from: 'user1', text: "I'm good, thanks! How about you?", timestamp: '10:41 AM' },
            { from: 'user2', text: 'Doing great! Are we still on for lunch?', timestamp: '10:41 AM' },
            { from: 'user1', text: 'Absolutely. 12:30pm at the usual spot.', timestamp: '10:42 AM' },
            { from: 'user2', text: 'Sounds good!', image: 'https://via.placeholder.com/250', timestamp: '10:42 AM' },
        ],
        'conv2': [
             { from: 'user3', text: 'Project update is ready.', timestamp: 'Yesterday' },
             { from: 'user1', text: 'Great, I will review it tonight.', timestamp: 'Yesterday' },
             { from: 'user3', text: 'See you tomorrow.', timestamp: 'Yesterday' },
        ]
    };

    // --- ROUTING ---
    if (currentPage.includes('login.html')) {
        initLoginPage();
    } else if (currentPage.includes('register.html')) {
        initRegisterPage();
    } else if (currentPage.includes('chat.html')) {
        initChatPage();
    }

    // --- INITIALIZATION FUNCTIONS ---

    function initLoginPage() {
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', handleLogin);
    }

    function initRegisterPage() {
        const registerForm = document.getElementById('register-form');
        registerForm.addEventListener('submit', handleRegister);
    }

    function initChatPage() {
        // Element selectors
        const newChatBtn = document.getElementById('new-chat-btn');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const modal = document.getElementById('new-chat-modal');
        const userSearchInput = document.getElementById('user-search-input');
        const messageForm = document.getElementById('message-form');
        const backToConversationsBtn = document.getElementById('back-to-conversations');
        const deleteConversationBtn = document.getElementById('delete-conversation-btn');
        const imageUploadBtn = document.getElementById('image-upload-btn');
        const imageUploadInput = document.getElementById('image-upload');
        
        // Event Listeners
        newChatBtn.addEventListener('click', () => modal.classList.add('show'));
        closeModalBtn.addEventListener('click', () => modal.classList.remove('show'));
        userSearchInput.addEventListener('input', handleUserSearch);
        messageForm.addEventListener('submit', handleSendMessage);
        backToConversationsBtn.addEventListener('click', showConversationList);
        deleteConversationBtn.addEventListener('click', handleDeleteConversation);
        imageUploadBtn.addEventListener('click', () => imageUploadInput.click());
        imageUploadInput.addEventListener('change', handleImageUpload);

        // Initial Load
        loadConversations();
        document.getElementById('current-username').textContent = MOCK_CURRENT_USER.username;
    }

    // --- HANDLER FUNCTIONS ---

    function handleLogin(e) {
        e.preventDefault();
        // ** BACKEND INTEGRATION **
        // 1. Get username and password from form.
        // 2. Send POST request to your `/login` endpoint.
        // 3. On success, save the auth token (e.g., in localStorage).
        // 4. Redirect to `chat.html`.
        console.log('Attempting login...');
        alert('Login successful! Redirecting...');
        window.location.href = 'chat.html';
    }

    function handleRegister(e) {
        e.preventDefault();
        // ** BACKEND INTEGRATION **
        // 1. Get username and passwords from form, validate they match.
        // 2. Send POST request to your `/register` endpoint.
        // 3. On success, maybe auto-login or redirect to `login.html`.
        console.log('Attempting registration...');
        alert('Registration successful! Please log in.');
        window.location.href = 'login.html';
    }

    function handleUserSearch(e) {
        const query = e.target.value;
        const resultsContainer = document.getElementById('user-search-results');
        
        // ** BACKEND INTEGRATION **
        // - Fetch `/api/users/search?q=${query}` from your backend.
        // - The backend should return a list of users matching the query.
        // - For now, we simulate this with mock data.
        
        const filteredUsers = MOCK_USERS.filter(user => 
            user.username.toLowerCase().includes(query.toLowerCase()) && user.id !== MOCK_CURRENT_USER.id
        );
        
        resultsContainer.innerHTML = ''; // Clear previous results
        filteredUsers.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            userElement.innerHTML = `<img src="https://via.placeholder.com/40" alt="${user.username}" class="avatar"><span>${user.username}</span>`;
            userElement.addEventListener('click', () => startConversation(user.id));
            resultsContainer.appendChild(userElement);
        });
    }

    function handleSendMessage(e) {
        e.preventDefault();
        const input = document.getElementById('message-input');
        const messageText = input.value.trim();
        const activeConversationId = document.querySelector('.conversation-item.active')?.dataset.id;
        
        if (!messageText || !activeConversationId) return;

        // ** BACKEND INTEGRATION **
        // - Use WebSockets or send a POST request to `/api/messages`.
        // - Body should contain { conversationId, text }.
        // - The backend saves the message and broadcasts it to the other user.
        
        const messageData = { from: MOCK_CURRENT_USER.id, text: messageText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        renderMessage(messageData);
        input.value = '';
        document.getElementById('message-container').scrollTop = document.getElementById('message-container').scrollHeight;
    }

    function handleImageUpload(e) {
        const file = e.target.files[0];
        const activeConversationId = document.querySelector('.conversation-item.active')?.dataset.id;
        if (!file || !activeConversationId) return;

        // ** BACKEND INTEGRATION **
        // 1. Create a FormData object and append the file.
        // 2. Send a POST request to an `/api/upload` endpoint.
        // 3. Backend saves the image (e.g., to S3) and returns its URL.
        // 4. Call `sendMessage` with the image URL.
        
        // Simulate upload and get URL
        const imageUrl = URL.createObjectURL(file);
        const messageData = { from: MOCK_CURRENT_USER.id, image: imageUrl, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        renderMessage(messageData);
        document.getElementById('message-container').scrollTop = document.getElementById('message-container').scrollHeight;
    }

    function handleDeleteConversation() {
        const activeItem = document.querySelector('.conversation-item.active');
        if (!activeItem) return;
        const conversationId = activeItem.dataset.id;

        if (confirm('Are you sure you want to delete this conversation? This will only hide it from your view.')) {
            // ** BACKEND INTEGRATION **
            // - Send a DELETE request to `/api/conversations/${conversationId}`.
            // - Backend should mark the conversation as deleted FOR THE CURRENT USER ONLY.
            activeItem.remove();
            clearChatArea();
        }
    }

    // --- CORE LOGIC & RENDER FUNCTIONS ---
    
    function loadConversations() {
        const listContainer = document.getElementById('conversation-list');
        listContainer.innerHTML = '';

        // ** BACKEND INTEGRATION **
        // - Fetch `/api/conversations` for the logged-in user.
        // - The backend returns an array of conversation objects.
        
        MOCK_CONVERSATIONS.forEach(conv => {
            const convElement = document.createElement('div');
            convElement.className = 'conversation-item';
            convElement.dataset.id = conv.id;
            convElement.innerHTML = `
                <img src="https://via.placeholder.com/50" alt="${conv.withUser.username}" class="avatar">
                <div class="conversation-details">
                    <span class="conversation-name">${conv.withUser.username}</span>
                    <p class="last-message">${conv.lastMessage}</p>
                </div>
                <span class="conversation-timestamp">${conv.timestamp}</span>
            `;
            convElement.addEventListener('click', () => loadMessages(conv.id, conv.withUser));
            listContainer.appendChild(convElement);
        });
    }

    function loadMessages(conversationId, withUser) {
        const messageContainer = document.getElementById('message-container');
        messageContainer.innerHTML = '';

        // Update active conversation
        document.querySelectorAll('.conversation-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`.conversation-item[data-id="${conversationId}"]`).classList.add('active');

        // Update chat header
        document.getElementById('chat-username').textContent = withUser.username;
        document.getElementById('chat-avatar').src = `https://via.placeholder.com/40?text=${withUser.username.charAt(0)}`;
        
        // ** BACKEND INTEGRATION **
        // - Fetch `/api/messages/${conversationId}`.
        // - Backend returns an array of message objects for this conversation.
        
        const messages = MOCK_MESSAGES[conversationId] || [];
        messages.forEach(renderMessage);
        
        messageContainer.scrollTop = messageContainer.scrollHeight;

        // On mobile, hide sidebar and show chat
        if (window.innerWidth <= 768) {
            document.querySelector('.sidebar').classList.remove('open');
        }
    }

    function renderMessage(message) {
        const messageContainer = document.getElementById('message-container');
        const messageElement = document.createElement('div');
        const messageType = message.from === MOCK_CURRENT_USER.id ? 'sent' : 'received';
        messageElement.className = `message ${messageType}`;

        let content = '';
        if (message.text) {
            content = `<p>${message.text}</p>`;
        } else if (message.image) {
            content = `<img src="${message.image}" alt="Sent image" class="message-image">`;
        }

        messageElement.innerHTML = `
            ${content}
            <span class="timestamp">${message.timestamp}</span>
        `;
        messageContainer.appendChild(messageElement);
    }
    
    function startConversation(userId) {
        // ** BACKEND INTEGRATION **
        // - Send a POST to `/api/conversations/start` with the target `userId`.
        // - Backend should either create a new conversation or return the existing one.
        // - Then, it should refresh the conversation list.
        
        alert(`Starting conversation with user ID: ${userId}. This would open the chat.`);
        document.getElementById('new-chat-modal').classList.remove('show');
        // After starting, you would call `loadConversations()` again.
    }

    function clearChatArea() {
        document.getElementById('message-container').innerHTML = '';
        document.getElementById('chat-username').textContent = 'Select a conversation';
        document.getElementById('chat-avatar').src = 'https://via.placeholder.com/40';
    }
    
    function showConversationList() {
        document.querySelector('.sidebar').classList.add('open');
    }
});