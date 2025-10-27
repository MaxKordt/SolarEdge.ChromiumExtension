# Quick Installation Guide

## Step 1: Load the Extension

1. Open your Chrome/Chromium browser
2. Type `chrome://extensions/` in the address bar and press Enter
3. Enable "Developer mode" using the toggle switch in the top-right corner
4. Click the "Load unpacked" button
5. Navigate to and select this folder: 
   `/Users/livakordt/Documents/repositories/SolarEdge.ChromiumExtension`
6. The extension should now appear in your extensions list and toolbar

## Step 2: Configure Your Credentials

1. Click the SolarEdge Monitor icon in your browser toolbar
2. You'll see a message asking you to configure settings
3. Click the "⚙️ Settings" button
4. Enter your SolarEdge API credentials:
   - **API Key**: Get this from the SolarEdge monitoring portal (Admin → Site Access)
   - **Site ID**: Find this in your monitoring portal URL
5. Click "Test Connection" to verify your credentials work
6. Click "Save Settings"

## Step 3: Start Monitoring!

1. Click the extension icon again
2. You should now see:
   - Your current power production
   - A chart showing the last 24 hours of data
3. Click "🔄 Refresh" anytime to update the data

## Troubleshooting

**Problem**: Extension won't load
- Make sure you selected the correct folder
- Check that all files are present (manifest.json, popup.html, etc.)

**Problem**: "Please configure your API key and Site ID"
- Open the settings page and enter your credentials
- Make sure to click "Save Settings"

**Problem**: "Failed to load data"
- Verify your API key is correct
- Check that your Site ID is correct
- Ensure you have internet connection
- Try the "Test Connection" button in settings

**Problem**: No chart visible
- Check browser console for errors (F12 → Console tab)
- Verify Chart.js library is in the `lib/` folder
- Make sure your site has recent data to display

## Need Help?

Check the full README.md for more detailed documentation and troubleshooting steps.

