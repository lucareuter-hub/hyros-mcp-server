#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

class HyrosMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'hyros-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupToolHandlers() {
    // List all available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'retrieveLeads',
            description: 'Search and retrieve leads by their join date, email or id',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                ids: { type: 'array', items: { type: 'string' }, description: 'Array of lead ids' },
                emails: { type: 'array', items: { type: 'string' }, description: 'Array of emails' },
                fromDate: { type: 'string', description: 'Start date (ISO 8601)' },
                toDate: { type: 'string', description: 'End date (ISO 8601)' },
                pageSize: { type: 'number', description: 'Results per page' },
                pageId: { type: 'number', description: 'Page number' }
              },
              required: ['apiKey']
            }
          },
          {
            name: 'createLead',
            description: 'Create a new lead in Hyros',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                email: { type: 'string', description: 'Lead email address' },
                firstName: { type: 'string', description: 'Lead first name' },
                lastName: { type: 'string', description: 'Lead last name' },
                phone: { type: 'string', description: 'Lead phone number' },
                sourceId: { type: 'string', description: 'Traffic source ID' },
                campaignId: { type: 'string', description: 'Campaign ID' }
              },
              required: ['apiKey', 'email']
            }
          },
          {
            name: 'retrieveLeadsJourney',
            description: 'Retrieve the journey/funnel steps for specific leads',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                ids: { type: 'array', items: { type: 'string' }, description: 'Array of lead ids' }
              },
              required: ['apiKey', 'ids']
            }
          },
          {
            name: 'retrieveSales',
            description: 'Search and retrieve sales data',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                isRecurringSale: { type: 'boolean', description: 'Filter by recurring sales' },
                saleRefundedState: { type: 'string', description: 'Filter by refund state' },
                fromDate: { type: 'string', description: 'Start date for sales search' },
                toDate: { type: 'string', description: 'End date for sales search' },
                pageSize: { type: 'number', description: 'Results per page' },
                pageId: { type: 'number', description: 'Page number' },
                ids: { type: 'array', items: { type: 'string' }, description: 'Array of sale ids' },
                emails: { type: 'array', items: { type: 'string' }, description: 'Array of emails' },
                leadIds: { type: 'array', items: { type: 'string' }, description: 'Array of lead ids' },
                productTags: { type: 'array', items: { type: 'string' }, description: 'Array of product tags' }
              },
              required: ['apiKey']
            }
          },
          {
            name: 'updateSales',
            description: 'Update sale information such as refund status',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                ids: { type: 'string', description: 'Sale ID to update' },
                isRecurringSale: { type: 'boolean', description: 'Whether this is a recurring sale' },
                isRefunded: { type: 'boolean', description: 'Whether the sale is refunded' },
                refundedAmount: { type: 'number', description: 'Amount refunded' },
                refundedDate: { type: 'string', description: 'Date of refund' }
              },
              required: ['apiKey', 'ids']
            }
          },
          {
            name: 'createOrder',
            description: 'Create a new order in Hyros',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                email: { type: 'string', description: 'Customer email' },
                orderId: { type: 'string', description: 'Unique order identifier' },
                amount: { type: 'number', description: 'Order total amount' },
                currency: { type: 'string', description: 'Order currency' },
                items: { type: 'array', description: 'Array of order items' }
              },
              required: ['apiKey', 'email', 'orderId', 'amount']
            }
          },
          {
            name: 'retrieveCalls',
            description: 'Search and retrieve call data',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                ids: { type: 'array', items: { type: 'string' }, description: 'Array of call ids' },
                fromDate: { type: 'string', description: 'Start date for calls search' },
                toDate: { type: 'string', description: 'End date for calls search' },
                pageSize: { type: 'number', description: 'Results per page' },
                pageId: { type: 'number', description: 'Page number' },
                emails: { type: 'array', items: { type: 'string' }, description: 'Array of emails' },
                leadIds: { type: 'array', items: { type: 'string' }, description: 'Array of lead ids' },
                qualified: { type: 'boolean', description: 'Filter by qualified calls' }
              },
              required: ['apiKey']
            }
          },
          {
            name: 'createCall',
            description: 'Create a new call record in Hyros',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                email: { type: 'string', description: 'Lead email for the call' },
                callDate: { type: 'string', description: 'Date and time of the call' },
                duration: { type: 'number', description: 'Call duration in seconds' },
                qualified: { type: 'boolean', description: 'Whether the call was qualified' }
              },
              required: ['apiKey', 'email', 'callDate']
            }
          },
          {
            name: 'updateCall',
            description: 'Update call information such as qualification status',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                ids: { type: 'string', description: 'Call ID to update' },
                state: { type: 'string', description: 'New call state' }
              },
              required: ['apiKey', 'ids']
            }
          },
          {
            name: 'getAdsAttributionReport',
            description: 'Get attribution report for ads performance',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                startDate: { type: 'string', description: 'Report start date' },
                endDate: { type: 'string', description: 'Report end date' },
                attributionModel: { type: 'string', description: 'Attribution model to use' },
                level: { type: 'string', description: 'Reporting level (ad, adset, campaign)' },
                fields: { type: 'string', description: 'Fields to include in report' },
                currency: { type: 'string', description: 'Currency for monetary values' }
              },
              required: ['apiKey', 'startDate', 'endDate']
            }
          },
          {
            name: 'getAdAccountAttributionReport',
            description: 'Get attribution report at ad account level',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                startDate: { type: 'string', description: 'Report start date' },
                endDate: { type: 'string', description: 'Report end date' },
                attributionModel: { type: 'string', description: 'Attribution model to use' },
                fields: { type: 'string', description: 'Fields to include in report' },
                currency: { type: 'string', description: 'Currency for monetary values' }
              },
              required: ['apiKey', 'startDate', 'endDate']
            }
          },
          {
            name: 'createProduct',
            description: 'Create a new product in Hyros',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                name: { type: 'string', description: 'Product name' },
                price: { type: 'number', description: 'Product price' },
                externalId: { type: 'string', description: 'External product identifier' }
              },
              required: ['apiKey', 'name', 'price']
            }
          },
          {
            name: 'listTags',
            description: 'List all available tags in Hyros',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' }
              },
              required: ['apiKey']
            }
          },
          {
            name: 'listSources',
            description: 'List all traffic sources in Hyros',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' }
              },
              required: ['apiKey']
            }
          },
          {
            name: 'createSource',
            description: 'Create a new traffic source in Hyros',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                name: { type: 'string', description: 'Source name' },
                type: { type: 'string', description: 'Source type' }
              },
              required: ['apiKey', 'name']
            }
          },
          {
            name: 'listAds',
            description: 'List ads with optional filtering',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                adSourceIds: { type: 'array', items: { type: 'string' }, description: 'Array of ad source IDs' },
                integrationType: { type: 'string', description: 'Integration type filter' },
                pageSize: { type: 'number', description: 'Results per page' },
                pageId: { type: 'number', description: 'Page number' }
              },
              required: ['apiKey']
            }
          },
          {
            name: 'createCustomCost',
            description: 'Create a custom cost entry for attribution',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                date: { type: 'string', description: 'Date of the cost entry' },
                amount: { type: 'number', description: 'Cost amount' },
                source: { type: 'string', description: 'Cost source' }
              },
              required: ['apiKey', 'date', 'amount']
            }
          },
          {
            name: 'createClick',
            description: 'Create a click event for tracking',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                timestamp: { type: 'string', description: 'Click timestamp' },
                ip: { type: 'string', description: 'IP address of the click' },
                userAgent: { type: 'string', description: 'User agent string' }
              },
              required: ['apiKey', 'timestamp']
            }
          },
          {
            name: 'retrieveClicks',
            description: 'Retrieve clicks for a specific lead',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                leadId: { type: 'string', description: 'Lead ID to retrieve clicks for' }
              },
              required: ['apiKey', 'leadId']
            }
          },
          {
            name: 'createCart',
            description: 'Create a cart abandonment event',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                email: { type: 'string', description: 'Customer email' },
                items: { type: 'array', description: 'Array of cart items' },
                timestamp: { type: 'string', description: 'Cart creation timestamp' }
              },
              required: ['apiKey', 'email', 'items']
            }
          },
          {
            name: 'getUserInfo',
            description: 'Retrieve current user information and account details',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' }
              },
              required: ['apiKey']
            }
          },
          {
            name: 'retrieveKeywords',
            description: 'Retrieve keywords for specific ad groups',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                adgroupId: { type: 'string', description: 'Ad group ID to retrieve keywords for' },
                pageSize: { type: 'number', description: 'Results per page' },
                pageId: { type: 'number', description: 'Page number' }
              },
              required: ['apiKey', 'adgroupId']
            }
          },
          {
            name: 'createSubscription',
            description: 'Create a new subscription record',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                email: { type: 'string', description: 'Subscriber email' },
                planId: { type: 'string', description: 'Subscription plan ID' },
                status: { type: 'string', description: 'Subscription status' },
                startDate: { type: 'string', description: 'Subscription start date' }
              },
              required: ['apiKey', 'email', 'planId']
            }
          },
          {
            name: 'updateSubscription',
            description: 'Update an existing subscription',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string', description: 'Hyros API key' },
                subscriptionId: { type: 'string', description: 'Subscription ID to update' },
                status: { type: 'string', description: 'New subscription status' },
                endDate: { type: 'string', description: 'Subscription end date' }
              },
              required: ['apiKey', 'subscriptionId']
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const result = await this.callHyrosAPI(name, args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async callHyrosAPI(toolName, args) {
    const { apiKey, ...params } = args;
    const baseUrl = 'https://api.hyros.com/v1';

    const config = {
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    };

    switch (toolName) {
      case 'retrieveLeads':
        return this.makeRequest('GET', `${baseUrl}/api/v1.0/leads`, params, config);
      
      case 'createLead':
        return this.makeRequest('POST', `${baseUrl}/api/v1.0/leads`, null, config, params);
      
      case 'retrieveLeadsJourney':
        return this.makeRequest('GET', `${baseUrl}/api/v1.0/leads/journey`, params, config);
      
      case 'retrieveSales':
        return this.makeRequest('GET', `${baseUrl}/api/v1.0/sales`, params, config);
      
      case 'updateSales':
        return this.makeRequest('PUT', `${baseUrl}/api/v1.0/sales`, params, config);
      
      case 'createOrder':
        return this.makeRequest('POST', `${baseUrl}/api/v1.0/orders`, null, config, params);
      
      case 'retrieveCalls':
        return this.makeRequest('GET', `${baseUrl}/api/v1.0/calls`, params, config);
      
      case 'createCall':
        return this.makeRequest('POST', `${baseUrl}/api/v1.0/calls`, null, config, params);
      
      case 'updateCall':
        return this.makeRequest('PUT', `${baseUrl}/api/v1.0/calls`, params, config);
      
      case 'getAdsAttributionReport':
        return this.makeRequest('GET', `${baseUrl}/api/v1.0/attribution`, params, config);
      
      case 'getAdAccountAttributionReport':
        return this.makeRequest('GET', `${baseUrl}/api/v1.0/attribution/ad-account`, params, config);
      
      case 'createProduct':
        return this.makeRequest('POST', `${baseUrl}/api/v1.0/products`, null, config, params);
      
      case 'listTags':
        return this.makeRequest('GET', `${baseUrl}/api/v1.0/tags`, null, config);
      
      case 'listSources':
        return this.makeRequest('GET', `${baseUrl}/api/v1.0/sources`, null, config);
      
      case 'createSource':
        return this.makeRequest('POST', `${baseUrl}/api/v1.0/sources`, null, config, params);
      
      case 'listAds':
        return this.makeRequest('GET', `${baseUrl}/api/v1.0/ads`, params, config);
      
      case 'createCustomCost':
        return this.makeRequest('POST', `${baseUrl}/api/v1.0/custom-costs`, null, config, params);
      
      case 'createClick':
        return this.makeRequest('POST', `${baseUrl}/api/v1.0/clicks`, null, config, params);
      
      case 'retrieveClicks':
        return this.makeRequest('GET', `${baseUrl}/api/v1.0/leads/clicks`, params, config);
      
      case 'createCart':
        return this.makeRequest('POST', `${baseUrl}/api/v1.0/carts`, null, config, params);
      
      case 'getUserInfo':
        return this.makeRequest('GET', `${baseUrl}/api/v1.0/user-info`, null, config);
      
      case 'retrieveKeywords':
        return this.makeRequest('GET', `${baseUrl}/api/v1.0/keywords`, params, config);
      
      case 'createSubscription':
        return this.makeRequest('POST', `${baseUrl}/api/v1.0/subscriptions`, null, config, params);
      
      case 'updateSubscription':
        return this.makeRequest('PUT', `${baseUrl}/api/v1.0/subscriptions`, null, config, params);
      
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  async makeRequest(method, url, queryParams, config, bodyData) {
    try {
      // Add query parameters for GET requests
      if (method === 'GET' && queryParams) {
        const urlObj = new URL(url);
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              urlObj.searchParams.set(key, value.join(','));
            } else {
              urlObj.searchParams.set(key, String(value));
            }
          }
        });
        url = urlObj.toString();
      }

      const requestConfig = {
        method,
        url,
        ...config
      };

      // Add body for POST/PUT requests
      if ((method === 'POST' || method === 'PUT') && bodyData) {
        requestConfig.data = bodyData;
      }

      const response = await axios(requestConfig);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`Hyros API error: ${error.response.status} ${error.response.statusText} - ${JSON.stringify(error.response.data)}`);
      } else {
        throw new Error(`Request failed: ${error.message}`);
      }
    }
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const { SSEServerTransport } = await import('@modelcontextprotocol/sdk/server/sse.js');
    const express = (await import('express')).default;

    const app = express();
    const port = parseInt(process.env.PORT || '8000', 10);

    // Bearer token protection
    const secret = process.env.MCP_SECRET_TOKEN;
    if (secret) {
        app.use((req, res, next) => {
            const auth = req.headers['authorization'] || '';
            if (auth !== `Bearer ${secret}`) {
                return res.status(401).send('Unauthorized');
            }
            next();
        });
    }

    app.get('/sse', async (req, res) => {
        const transport = new SSEServerTransport('/messages', res);
        await this.server.connect(transport);
    });

    app.post('/messages', async (req, res) => {
        // handled by SSEServerTransport
    });

    app.listen(port, '0.0.0.0', () => {
        console.error(`Hyros MCP server running on SSE at port ${port}`);
    });
}

}

const server = new HyrosMCPServer();
server.run().catch(console.error);
