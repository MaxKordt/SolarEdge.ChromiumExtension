# ☀️ SolarEdge Monitor - Chrome Extension

A beautiful and intuitive browser extension for monitoring your SolarEdge solar installation directly from your browser.

## Features

- **Real-time Power Monitoring**: View your current solar power production at a glance
- **24-Hour Energy Chart**: Visualize your energy production over the last 24 hours with 15-minute intervals
- **Easy Configuration**: Simple settings page to configure your API credentials
- **Connection Testing**: Test your API connection before saving settings
- **Auto-refresh**: Manually refresh data with a single click
- **Beautiful UI**: Modern, gradient-based design with smooth animations

## Installation

### Load as Unpacked Extension (Development)

1. Open Chrome/Chromium browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the extension directory: `/Users/livakordt/Documents/repositories/SolarEdge.ChromiumExtension`

The extension icon should now appear in your browser toolbar!

## Configuration

### Getting Your SolarEdge Credentials

1. **Log in** to the [SolarEdge Monitoring Portal](https://monitoring.solaredge.com)
2. **Get your Site ID**:
   - Look at the URL when viewing your site
   - Format: `monitoring.solaredge.com/solaredge-web/p/site/SITE_ID`
   - Copy the `SITE_ID` number
3. **Get your API Key**:
   - Navigate to Admin → Site Access
   - Generate or copy your API key
   - Keep this key secure!

### Setting Up the Extension

1. Click the SolarEdge Monitor extension icon in your toolbar
2. Click "⚙️ Settings" button
3. Enter your **API Key** and **Site ID**
4. Click "Test Connection" to verify credentials
5. Click "Save Settings"

## Usage

1. Click the extension icon in your browser toolbar
2. The popup will display:
   - **Current Power**: Your real-time solar power production in kW
   - **Energy Chart**: Last 24 hours of power generation with 15-minute intervals
   - **Last Updated**: Timestamp of the last data refresh
3. Click "🔄 Refresh" to manually update the data
4. Click "⚙️ Settings" to modify your configuration

## API Endpoints Used

The extension uses the following SolarEdge API endpoints:

- **Current Power Flow**: `/site/{siteId}/currentPowerFlow.json`
  - Provides real-time power production data
- **Power Data**: `/site/{siteId}/power`
  - Retrieves historical power data with time intervals

## Project Structure

```
SolarEdge.ChromiumExtension/
├── manifest.json          # Extension manifest (Manifest V3)
├── popup.html            # Main popup interface
├── popup.css             # Popup styling
├── popup.js              # Popup logic and API integration
├── settings.html         # Settings page
├── settings.css          # Settings page styling
├── settings.js           # Settings page logic
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── lib/                  # External libraries
│   └── chart.min.js     # Chart.js for data visualization
└── README.md            # This file
```

## Technologies Used

- **Manifest V3**: Latest Chrome extension API
- **Chart.js**: Beautiful and responsive charts
- **Chrome Storage API**: Secure credential storage
- **SolarEdge Monitoring API**: Real-time solar data
- **Modern ES6+**: Classes, async/await, arrow functions
- **CSS3**: Gradients, animations, flexbox

## Privacy & Security

- API credentials are stored locally using Chrome's secure storage API
- No data is sent to third-party servers (only SolarEdge API)
- All API calls are made directly from your browser to SolarEdge
- Your API key is never exposed or logged

## Troubleshooting

### "Please configure your API key and Site ID"
- Open settings and enter your credentials
- Make sure to save the settings

### "Connection failed" Error
- Verify your API key is correct and active
- Check that your Site ID matches your SolarEdge installation
- Ensure you have internet connectivity
- Check if the SolarEdge API is accessible

### No Data Displayed
- Verify your solar installation is online
- Check if your site is producing power (or has recent data)
- Try refreshing the data
- Check browser console for error messages (F12 → Console)

### Chart Not Showing
- Ensure Chart.js library is present in `lib/chart.min.js`
- Check for JavaScript errors in browser console

## Development

### Making Changes

1. Edit the relevant files in the extension directory
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

### Adding Features

The codebase is modular and easy to extend:
- `popup.js`: Add new API calls or UI components
- `popup.html/css`: Modify the interface design
- `settings.js`: Add new configuration options
- `manifest.json`: Request additional permissions if needed

## API Rate Limits

Be aware of SolarEdge API rate limits:
- Default: ~300 requests per day
- Consider implementing caching if you need more frequent updates

## Future Enhancements

Potential features to add:
- [ ] Multiple site support
- [ ] Notifications for production milestones
- [ ] Dark mode toggle
- [ ] Custom time range selection
- [ ] Export data functionality
- [ ] Battery status (if available)
- [ ] Weather integration
- [ ] Historical comparison charts

## License

This project is provided as-is for personal use with SolarEdge installations.

## Support

For issues related to:
- **Extension functionality**: Check the troubleshooting section
- **SolarEdge API**: Contact [SolarEdge Support](https://www.solaredge.com/support)
- **API credentials**: Log in to your SolarEdge monitoring portal

## Credits

- Built with ❤️ for SolarEdge users
- Chart.js for beautiful visualizations
- Icons designed with solar theme

---

**Note**: This is an unofficial extension and is not affiliated with or endorsed by SolarEdge Technologies Ltd.

