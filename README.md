# Hyros MCP Server

A powerful Model Context Protocol (MCP) server that provides seamless access to the Hyros API for AI agents, automation tools, and workflow platforms like n8n.

![Version](https://img.shields.io/npm/v/hyros-mcp-api)
![License](https://img.shields.io/npm/l/hyros-mcp-api)
![Downloads](https://img.shields.io/npm/dm/hyros-mcp-api)

## 🚀 Quick Start

### For n8n Users

Add this to your n8n MCP configuration:

```json
{
  "mcpServers": {
    "hyros": {
      "command": "npx",
      "args": ["-y", "hyros-mcp-api@latest"]
    }
  }
}
```

### For Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hyros": {
      "command": "npx",
      "args": ["-y", "hyros-mcp-api@latest"]
    }
  }
}
```

### Direct Installation

```bash
# Install globally
npm install -g hyros-mcp-api

# Or run with npx (recommended)
npx hyros-mcp-api@latest
```

## 📚 Available Tools

This MCP server provides **24 comprehensive Hyros API tools**:

### 👥 Lead Management
- **`retrieveLeads`** - Search and retrieve leads by date, email, or ID
- **`createLead`** - Create new leads with contact information
- **`retrieveLeadsJourney`** - Get detailed lead funnel journey data

### 💰 Sales Tracking
- **`retrieveSales`** - Search and retrieve sales data with filters
- **`updateSales`** - Update sale information including refund status
- **`createOrder`** - Create new orders with items and pricing

### 📞 Call Management
- **`retrieveCalls`** - Search and retrieve call records
- **`createCall`** - Log new call records with qualification data
- **`updateCall`** - Update call information and status

### 📊 Attribution & Analytics
- **`getAdsAttributionReport`** - Get detailed ads performance attribution
- **`getAdAccountAttributionReport`** - Get ad account level attribution data

### 🏷️ Product & Tag Management
- **`createProduct`** - Create new products in your catalog
- **`listTags`** - Retrieve all available tags
- **`listSources`** - List all traffic sources
- **`createSource`** - Create new traffic sources

### 📱 Ad Management
- **`listAds`** - List ads with advanced filtering options

### 💸 Cost & Event Tracking
- **`createCustomCost`** - Add custom cost entries for attribution
- **`createClick`** - Track click events for attribution
- **`retrieveClicks`** - Get click data for specific leads
- **`createCart`** - Track cart abandonment events

### 👤 Account Management
- **`getUserInfo`** - Retrieve current user and account details
- **`retrieveKeywords`** - Get keywords for specific ad groups

### 🔄 Subscription Management
- **`createSubscription`** - Create new subscription records
- **`updateSubscription`** - Update existing subscription status

## 🔐 Authentication

All tools require your Hyros API key. Get your API key from your Hyros dashboard.

### Usage Example

```javascript
{
  "tool": "retrieveLeads",
  "arguments": {
    "apiKey": "your-hyros-api-key-here",
    "fromDate": "2024-01-01T00:00:00Z",
    "toDate": "2024-12-31T23:59:59Z",
    "pageSize": 50
  }
}
```

## 🛠️ Platform Integration

### n8n Workflow Automation
Perfect for building automated marketing workflows, lead nurturing sequences, and sales reporting dashboards.

### Claude Desktop
Enhance your AI conversations with real-time access to your Hyros data for analysis and insights.

### Custom AI Agents
Build powerful AI agents that can interact with your Hyros data for customer service, sales optimization, and marketing automation.

## 📋 Tool Parameters

### Common Parameters
- **`apiKey`** (required) - Your Hyros API key
- **`pageSize`** (optional) - Number of results per page (default varies by endpoint)
- **`pageId`** (optional) - Page number for pagination

### Date Filtering
Most tools support date filtering with:
- **`fromDate`** - Start date in ISO 8601 format
- **`toDate`** - End date in ISO 8601 format

### Example Date Format
```
"fromDate": "2024-01-01T00:00:00Z"
"toDate": "2024-12-31T23:59:59Z"
```

## 🔍 Advanced Usage

### Retrieving Leads with Filters
```javascript
{
  "tool": "retrieveLeads",
  "arguments": {
    "apiKey": "your-api-key",
    "emails": ["customer@example.com"],
    "fromDate": "2024-01-01T00:00:00Z",
    "pageSize": 25
  }
}
```

### Creating a New Lead
```javascript
{
  "tool": "createLead",
  "arguments": {
    "apiKey": "your-api-key",
    "email": "newlead@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "sourceId": "facebook-ads"
  }
}
```

### Getting Attribution Report
```javascript
{
  "tool": "getAdsAttributionReport",
  "arguments": {
    "apiKey": "your-api-key",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "level": "campaign",
    "currency": "USD"
  }
}
```

## 🚨 Error Handling

The server provides detailed error messages for:
- **Invalid API keys** - Check your Hyros dashboard for the correct key
- **Rate limiting** - The server respects Hyros API rate limits
- **Invalid parameters** - Clear validation messages for incorrect inputs
- **Network issues** - Automatic retry logic for temporary failures

## 🔄 Updates

The package is regularly updated to include:
- New Hyros API endpoints
- Enhanced error handling
- Performance improvements
- Additional filtering options

Always use `@latest` to get the most recent version:
```bash
npx hyros-mcp-api@latest
```

## 📞 Support

- **Package Issues**: Open an issue in this repository
- **Hyros API Questions**: Contact Hyros support
- **MCP Protocol**: Check the [Model Context Protocol documentation](https://modelcontextprotocol.io/)

## 📜 License

MIT - See LICENSE file for details.

## 🏗️ Technical Details

- **Built with**: Model Context Protocol SDK
- **Transport**: STDIO (standard input/output)
- **Node.js**: Requires Node.js 16.0.0 or higher
- **Protocol**: JSON-RPC 2.0 over MCP

---

**Made with ❤️ for the Hyros community**

> This MCP server bridges the gap between AI agents and Hyros data, enabling powerful automation and insights that drive business growth.