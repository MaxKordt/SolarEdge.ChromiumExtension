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

  async getEnergyToday() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };

    const url = `${this.baseUrl}/site/${this.siteId}/energy?` +
                `startDate=${formatDate(today)}&` +
                `endDate=${formatDate(today)}&` +
                `timeUnit=QUARTER_OF_AN_HOUR&` +
                `api_key=${this.apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  async getEnergyData() {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days

    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };

    const url = `${this.baseUrl}/site/${this.siteId}/energy?` +
                `startDate=${formatDate(startDate)}&` +
                `endDate=${formatDate(endDate)}&` +
                `timeUnit=DAY&` +
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
    this.todayEnergyChart = null;
    this.energyChart = null;
    this.cacheKey = 'solarEdgeCache';
    this.cacheExpiryMinutes = 15; // Fetch data only once every 15 minutes
    this.initElements();
    this.attachListeners();
    this.setupAutoRefresh();
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
      chartCanvas: document.getElementById('energyChart'),
      todayEnergyCanvas: document.getElementById('todayEnergyChart'),
      dailyEnergyCanvas: document.getElementById('dailyEnergyChart')
    };
  }

  attachListeners() {
    this.elements.refreshBtn.addEventListener('click', () => this.loadData(true)); // Force refresh on button click
    this.elements.settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  setupAutoRefresh() {
    // Auto-refresh every 15 minutes
    setInterval(() => {
      this.loadData(false);
    }, 15 * 60 * 1000);
  }

  async getCachedData() {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.cacheKey], (result) => {
        const cached = result[this.cacheKey];
        if (cached && cached.timestamp) {
          const age = Date.now() - cached.timestamp;
          const maxAge = this.cacheExpiryMinutes * 60 * 1000;
          if (age < maxAge) {
            resolve(cached.data);
            return;
          }
        }
        resolve(null);
      });
    });
  }

  async setCachedData(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set({
        [this.cacheKey]: {
          timestamp: Date.now(),
          data: data
        }
      }, resolve);
    });
  }

  async clearCache() {
    return new Promise((resolve) => {
      chrome.storage.local.remove([this.cacheKey], resolve);
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

  updateTodayEnergyChart(energyData) {
    const values = energyData.energy?.values || [];

    // Filter out null values and format data
    const chartData = values
      .filter(item => item.value !== null && item.value !== undefined)
      .map(item => ({
        time: new Date(item.date),
        value: item.value / 1000 // Convert Wh to kWh
      }));

    // Format time labels (e.g., "08:00", "08:15")
    const labels = chartData.map(item => {
      const hour = item.time.getHours();
      const minute = item.time.getMinutes();
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    });

    const data = chartData.map(item => item.value);

    // Destroy previous chart if exists
    if (this.todayEnergyChart) {
      this.todayEnergyChart.destroy();
    }

    // Create new chart
    const ctx = this.elements.todayEnergyCanvas.getContext('2d');
    this.todayEnergyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Energy (kWh)',
          data: data,
          borderColor: '#f6ad55',
          backgroundColor: 'rgba(246, 173, 85, 0.7)',
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
                return `${context.parsed.y.toFixed(3)} kWh`;
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
              maxTicksLimit: 12
            }
          },
          y: {
            display: true,
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toFixed(2) + ' kWh';
              }
            }
          }
        }
      }
    });
  }

  updateDailyEnergyChart(energyData) {
    const values = energyData.energy?.values || [];

    // Filter out null values and format data
    const chartData = values
      .filter(item => item.value !== null && item.value !== undefined)
      .map(item => ({
        date: new Date(item.date),
        value: item.value / 1000 // Convert Wh to kWh
      }));

    // Format date labels (e.g., "Oct 1", "Oct 2")
    const labels = chartData.map(item => {
      const month = item.date.toLocaleDateString('en-US', { month: 'short' });
      const day = item.date.getDate();
      return `${month} ${day}`;
    });

    const data = chartData.map(item => item.value);

    // Destroy previous chart if exists
    if (this.energyChart) {
      this.energyChart.destroy();
    }

    // Create new chart
    const ctx = this.elements.dailyEnergyCanvas.getContext('2d');
    this.energyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Energy (kWh)',
          data: data,
          borderColor: '#48bb78',
          backgroundColor: 'rgba(72, 187, 120, 0.7)',
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
                return `${context.parsed.y.toFixed(2)} kWh`;
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
              maxTicksLimit: 10
            }
          },
          y: {
            display: true,
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toFixed(0) + ' kWh';
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

  async loadData(forceRefresh = false) {
    try {
      this.showLoading();

      // Get settings from storage
      const settings = await chrome.storage.sync.get(['apiKey', 'siteId']);

      if (!settings.apiKey || !settings.siteId) {
        this.showError('Please configure your API key and Site ID in settings.');
        return;
      }

      // Check cache first unless force refresh
      if (!forceRefresh) {
        const cachedData = await this.getCachedData();
        if (cachedData) {
          console.log('Using cached data');
          this.updateCurrentPower(cachedData.powerData);
          this.updateEnergyChart(cachedData.energyData24h);
          this.updateTodayEnergyChart(cachedData.todayEnergyData);
          this.updateDailyEnergyChart(cachedData.dailyEnergyData);
          this.updateLastUpdateTime();
          this.showContent();
          return;
        }
      }

      console.log('Fetching fresh data from API');
      const api = new SolarEdgeAPI(settings.apiKey, settings.siteId);

      // Fetch data in parallel
      const [powerData, energyData24h, todayEnergyData, dailyEnergyData] = await Promise.all([
        api.getCurrentPower(),
        api.getEnergyLast24Hours(),
        api.getEnergyToday(),
        api.getEnergyData()
      ]);

      // Cache the data
      await this.setCachedData({
        powerData,
        energyData24h,
        todayEnergyData,
        dailyEnergyData
      });

      // Update UI
      this.updateCurrentPower(powerData);
      this.updateEnergyChart(energyData24h);
      this.updateTodayEnergyChart(todayEnergyData);
      this.updateDailyEnergyChart(dailyEnergyData);
      this.updateLastUpdateTime();

      this.showContent();
    } catch (error) {
      console.error('Error loading data:', error);

      // If rate limited, try to use cached data
      if (error.message.includes('429')) {
        const cachedData = await this.getCachedData();
        if (cachedData) {
          console.log('Rate limited - using cached data');
          this.updateCurrentPower(cachedData.powerData);
          this.updateEnergyChart(cachedData.energyData24h);
          this.updateTodayEnergyChart(cachedData.todayEnergyData);
          this.updateDailyEnergyChart(cachedData.dailyEnergyData);
          this.updateLastUpdateTime();
          this.showContent();
          this.showError('Rate limited. Showing cached data. Next update available in 15 minutes.');
          return;
        }
      }

      this.showError(`Failed to load data: ${error.message}`);
    }
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  const controller = new PopupController();
  controller.loadData();
});

