// SolarEdge API Service
class SolarEdgeAPI {
  constructor(apiKey, siteId) {
    this.apiKey = apiKey;
    this.siteId = siteId;
    this.baseUrl = 'https://monitoringapi.solaredge.com';
  }

  async getCurrentPower() {
    const url = `${this.baseUrl}/site/${this.siteId}/currentPowerFlow.json?api_key=${this.apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  async getEnergyLast24Hours() {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

    const formatDate = (date) => {
      return date.toISOString().split('T')[0] + ' ' +
             date.toTimeString().split(' ')[0];
    };

    const url = `${this.baseUrl}/site/${this.siteId}/power?` +
                `startTime=${encodeURIComponent(formatDate(startTime))}&` +
                `endTime=${encodeURIComponent(formatDate(endTime))}&` +
                `api_key=${this.apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }
}

// UI Controller
class PopupController {
  constructor() {
    this.chart = null;
    this.initElements();
    this.attachListeners();
  }

  initElements() {
    this.elements = {
      loading: document.getElementById('loading'),
      content: document.getElementById('content'),
      error: document.getElementById('error-message'),
      currentPower: document.getElementById('current-power'),
      totalEnergy: document.getElementById('total-energy'),
      lastUpdate: document.getElementById('last-update-time'),
      refreshBtn: document.getElementById('refresh-btn'),
      settingsBtn: document.getElementById('settings-btn'),
      chartCanvas: document.getElementById('energyChart')
    };
  }

  attachListeners() {
    this.elements.refreshBtn.addEventListener('click', () => this.loadData());
    this.elements.settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  showLoading() {
    this.elements.loading.classList.remove('hidden');
    this.elements.content.classList.add('hidden');
    this.elements.error.classList.add('hidden');
  }

  showContent() {
    this.elements.loading.classList.add('hidden');
    this.elements.content.classList.remove('hidden');
    this.elements.error.classList.add('hidden');
  }

  showError(message) {
    this.elements.loading.classList.add('hidden');
    this.elements.content.classList.add('hidden');
    this.elements.error.classList.remove('hidden');
    this.elements.error.textContent = message;
  }

  updateCurrentPower(powerData) {
    // Extract current power from the power flow data
    const currentPower = powerData.siteCurrentPowerFlow?.PV?.currentPower || 0;
    this.elements.currentPower.textContent = (currentPower / 1000).toFixed(2);
  }

  updateEnergyChart(energyData) {
    const values = energyData.power?.values || [];

    // Filter out null values and format data
    const chartData = values
      .filter(item => item.value !== null)
      .map(item => ({
        time: new Date(item.date),
        value: item.value / 1000 // Convert W to kW
      }));
    // Calculate total energy (sum of all power values * time interval)
    // Assuming 15-minute intervals, convert kW to kWh
    const totalEnergy = chartData.reduce((sum, item) => sum + item.value, 0) * 0.25; // 15min = 0.25h
    this.elements.totalEnergy.textContent = totalEnergy.toFixed(2);


    // Format time labels
    const labels = chartData.map(item => {
      const hour = item.time.getHours();
      const minute = item.time.getMinutes();
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    });

    const data = chartData.map(item => item.value);

    // Destroy previous chart if exists
    if (this.chart) {
      this.chart.destroy();
    }

    // Create new chart
    const ctx = this.elements.chartCanvas.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Power (kW)',
          data: data,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.7)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        onResize: null,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return `${context.parsed.y.toFixed(2)} kW`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              maxTicksLimit: 8
            }
          },
          y: {
            display: true,
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toFixed(1) + ' kW';
              }
            }
          }
        }
      }
    });
  }

  updateLastUpdateTime() {
    const now = new Date();
    this.elements.lastUpdate.textContent = now.toLocaleTimeString();
  }

  async loadData() {
    try {
      this.showLoading();

      // Get settings from storage
      const settings = await chrome.storage.sync.get(['apiKey', 'siteId']);

      if (!settings.apiKey || !settings.siteId) {
        this.showError('Please configure your API key and Site ID in settings.');
        return;
      }

      const api = new SolarEdgeAPI(settings.apiKey, settings.siteId);

      // Fetch data in parallel
      const [powerData, energyData] = await Promise.all([
        api.getCurrentPower(),
        api.getEnergyLast24Hours()
      ]);

      // Update UI
      this.updateCurrentPower(powerData);
      this.updateEnergyChart(energyData);
      this.updateLastUpdateTime();

      this.showContent();
    } catch (error) {
      console.error('Error loading data:', error);
      this.showError(`Failed to load data: ${error.message}`);
    }
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  const controller = new PopupController();
  controller.loadData();
});

