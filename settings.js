// Settings Controller
class SettingsController {
  constructor() {
    this.initElements();
    this.attachListeners();
    this.loadSettings();
  }

  initElements() {
    this.elements = {
      form: document.getElementById('settings-form'),
      apiKeyInput: document.getElementById('api-key'),
      siteIdInput: document.getElementById('site-id'),
      successMessage: document.getElementById('success-message'),
      testBtn: document.getElementById('test-btn'),
      testResult: document.getElementById('test-result')
    };
  }

  attachListeners() {
    this.elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveSettings();
    });

    this.elements.testBtn.addEventListener('click', () => {
      this.testConnection();
    });
  }

  async loadSettings() {
    try {
      const settings = await chrome.storage.sync.get(['apiKey', 'siteId']);

      if (settings.apiKey) {
        this.elements.apiKeyInput.value = settings.apiKey;
      }

      if (settings.siteId) {
        this.elements.siteIdInput.value = settings.siteId;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async saveSettings() {
    const apiKey = this.elements.apiKeyInput.value.trim();
    const siteId = this.elements.siteIdInput.value.trim();

    if (!apiKey || !siteId) {
      this.showTestResult('Please fill in all fields', false);
      return;
    }

    try {
      await chrome.storage.sync.set({
        apiKey: apiKey,
        siteId: siteId
      });

      this.showSuccessMessage();
      this.hideTestResult();
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showTestResult('Failed to save settings: ' + error.message, false);
    }
  }

  async testConnection() {
    const apiKey = this.elements.apiKeyInput.value.trim();
    const siteId = this.elements.siteIdInput.value.trim();

    if (!apiKey || !siteId) {
      this.showTestResult('Please fill in all fields before testing', false);
      return;
    }

    this.elements.testBtn.disabled = true;
    this.elements.testBtn.textContent = 'Testing...';
    this.hideTestResult();

    try {
      const url = `https://monitoringapi.solaredge.com/site/${siteId}/currentPowerFlow.json?api_key=${apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.siteCurrentPowerFlow) {
        const siteName = data.siteCurrentPowerFlow.unit || 'Site';
        this.showTestResult(`✓ Connection successful! Connected to ${siteName}`, true);
      } else {
        this.showTestResult('✓ Connection successful!', true);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      this.showTestResult(`✗ Connection failed: ${error.message}`, false);
    } finally {
      this.elements.testBtn.disabled = false;
      this.elements.testBtn.textContent = 'Test Connection';
    }
  }

  showSuccessMessage() {
    this.elements.successMessage.classList.remove('hidden');
    setTimeout(() => {
      this.elements.successMessage.classList.add('hidden');
    }, 3000);
  }

  showTestResult(message, isSuccess) {
    this.elements.testResult.textContent = message;
    this.elements.testResult.classList.remove('hidden', 'success', 'error');
    this.elements.testResult.classList.add(isSuccess ? 'success' : 'error');
  }

  hideTestResult() {
    this.elements.testResult.classList.add('hidden');
  }
}

// Initialize settings page
document.addEventListener('DOMContentLoaded', () => {
  new SettingsController();
});

