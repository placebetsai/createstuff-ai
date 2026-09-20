// CreateStuff.ai - Free AI-Powered App Builder
// MCP Hive Integration

class CreateStuff {
  constructor() {
    this.hiveUrl = '/api/hive';
    this.user = null;
    this.projects = [];
  }

  // Initialize the app
  async init() {
    console.log('[CreateStuff] Initializing...');
    this.setupEventListeners();
    await this.checkAuth();
    console.log('[CreateStuff] Ready!');
  }

  // Setup event listeners
  setupEventListeners() {
    // Start building button
    const startBtn = document.querySelector('a[href="#start"]');
    if (startBtn) {
      startBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showSignupModal();
      });
    }

    // Template cards
    document.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', () => {
        const template = card.querySelector('h3').textContent;
        this.startFromTemplate(template);
      });
    });
  }

  // Check authentication
  async checkAuth() {
    const token = localStorage.getItem('cs_token');
    if (token) {
      try {
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          this.user = await response.json();
          this.updateUIForUser();
        }
      } catch (error) {
        console.log('[CreateStuff] Not authenticated');
      }
    }
  }

  // Update UI for authenticated user
  updateUIForUser() {
    if (this.user) {
      const nav = document.querySelector('.nav-links');
      if (nav) {
        nav.innerHTML = `
          <a href="/dashboard">Dashboard</a>
          <a href="/projects">Projects</a>
          <span class="user-name">${this.user.name}</span>
        `;
      }
    }
  }

  // Show signup modal
  showSignupModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Start Building for Free</h2>
        <p>No credit card required. Access 9 free AI models.</p>
        <form id="signup-form">
          <input type="text" placeholder="Your name" required>
          <input type="email" placeholder="Email address" required>
          <input type="password" placeholder="Password" required>
          <button type="submit" class="btn-primary">Create Account</button>
        </form>
        <p class="login-link">Already have an account? <a href="/login">Log in</a></p>
      </div>
    `;
    document.body.appendChild(modal);

    // Handle form submission
    document.getElementById('signup-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      await this.signup({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password')
      });
      modal.remove();
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  // Signup
  async signup(data) {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.token) {
        localStorage.setItem('cs_token', result.token);
        this.user = result.user;
        this.updateUIForUser();
        this.showNotification('Account created! Welcome to CreateStuff.ai');
      }
    } catch (error) {
      this.showNotification('Error creating account', 'error');
    }
  }

  // Start from template
  async startFromTemplate(templateName) {
    if (!this.user) {
      this.showSignupModal();
      return;
    }

    this.showNotification(`Creating project from ${templateName} template...`);

    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('cs_token')}`
        },
        body: JSON.stringify({ template: templateName })
      });
      const project = await response.json();
      if (project.id) {
        window.location.href = `/editor/${project.id}`;
      }
    } catch (error) {
      this.showNotification('Error creating project', 'error');
    }
  }

  // Show notification
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.createStuff = new CreateStuff();
  window.createStuff.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CreateStuff;
}
