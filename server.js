#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import express from 'express';

const HYROS_API_KEY = process.env.HYROS_API_KEY;
if (!HYROS_API_KEY) {
  console.error('ERROR: HYROS_API_KEY environment variable is not set.');
  process.exit(1);
}
const MCP_SECRET_TOKEN = process.env.MCP_SECRET_TOKEN;

class HyrosMCPServer {
  constructor() {
    this.server = new Server(
      { name: 'hyros-mcp-server', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        { name: 'retrieveLeads', description: 'Search and retrieve leads by date, email or id', inputSchema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'string' } }, emails: { type: 'array', items: { type: 'string' } }, fromDate: { type: 'string' }, toDate: { type: 'string' }, pageSize: { type: 'number' }, pageId: { type: 'number' } }, required: [] } },
        { name: 'createLead', description: 'Create a new lead in Hyros', inputSchema: { type: 'object', properties: { email: { type: 'string' }, firstName: { type: 'string' }, lastName: { type: 'string' }, phone: { type: 'string' } }, required: ['email'] } },
        { name: 'retrieveLeadsJourney', description: 'Retrieve funnel steps for leads', inputSchema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'string' } } }, required: ['ids'] } },
        { name: 'retrieveSales', description: 'Search and retrieve sales data', inputSchema: { type: 'object', properties: { fromDate: { type: 'string' }, toDate: { type: 'string' }, pageSize: { type: 'number' }, pageId: { type: 'number' }, isRefunded: { type: 'boolean' } }, required: [] } },
        { name: 'updateSales', description: 'Update sale information', inputSchema: { type: 'object', properties: { ids: { type: 'string' }, isRefunded: { type: 'boolean' }, refundedAmount: { type: 'number' }, refundedDate: { type: 'string' } }, required: ['ids'] } },
        { name: 'createOrder', description: 'Create a new order in Hyros', inputSchema: { type: 'object', properties: { email: { type: 'string' }, orderId: { type: 'string' }, amount: { type: 'number' }, currency: { type: 'string' }, items: { type: 'array' } }, required: ['email', 'orderId', 'amount'] } },
        { name: 'retrieveCalls', description: 'Search and retrieve call data', inputSchema: { type: 'object', properties: { fromDate: { type: 'string' }, toDate: { type: 'string' }, emails: { type: 'array', items: { type: 'string' } }, qualified: { type: 'boolean' }, pageSize: { type: 'number' }, pageId: { type: 'number' } }, required: [] } },
        { name: 'createCall', description: 'Create a new call record', inputSchema: { type: 'object', properties: { email: { type: 'string' }, callDate: { type: 'string' }, duration: { type: 'number' }, qualified: { type: 'boolean' } }, required: ['email', 'callDate'] } },
        { name: 'updateCall', description: 'Update call information', inputSchema: { type: 'object', properties: { ids: { type: 'string' }, state: { type: 'string' } }, required: ['ids'] } },
        { name: 'getAdsAttributionReport', description: 'Get attribution report for ads', inputSchema: { type: 'object', properties: { startDate: { type: 'string' }, endDate: { type: 'string' }, attributionModel: { type: 'string' }, level: { type: 'string' }, currency: { type: 'string' } }, required: ['startDate', 'endDate'] } },
        { name: 'getAdAccountAttributionReport', description: 'Get attribution at ad account level', inputSchema: { type: 'object', properties: { startDate: { type: 'string' }, endDate: { type: 'string' }, attributionModel: { type: 'string' }, currency: { type: 'string' } }, required: ['startDate', 'endDate'] } },
        { name: 'createProduct', description: 'Create a new product', inputSchema: { type: 'object', properties: { name: { type: 'string' }, price: { type: 'number' }, externalId: { type: 'string' } }, required: ['name', 'price'] } },
        { name: 'listTags', description: 'List all tags', inputSchema: { type: 'object', properties: {}, required: [] } },
        { name: 'listSources', description: 'List all traffic sources', inputSchema: { type: 'object', properties: {}, required: [] } },
        { name: 'createSource', description: 'Create a traffic source', inputSchema: { type: 'object', properties: { name: { type: 'string' }, type: { type: 'string' } }, required: ['name'] } },
        { name: 'listAds', description: 'List ads with filtering', inputSchema: { type: 'object', properties: { pageSize: { type: 'number' }, pageId: { type: 'number' } }, required: [] } },
        { name: 'createCustomCost', description: 'Create a custom cost entry', inputSchema: { type: 'object', properties: { date: { type: 'string' }, amount: { type: 'number' }, source: { type: 'string' } }, required: ['date', 'amount'] } },
        { name: 'createClick', description: 'Create a click event', inputSchema: { type: 'object', properties: { timestamp: { type: 'string' }, ip: { type: 'string' }, userAgent: { type: 'string' } }, required: ['timestamp'] } },
        { name: 'retrieveClicks', description: 'Retrieve clicks for a lead', inputSchema: { type: 'object', properties: { leadId: { type: 'string' } }, required: ['leadId'] } },
        { name: 'createCart', description: 'Create a cart abandonment event', inputSchema: { type: 'object', properties: { email: { type: 'string' }, items: { type: 'array' }, timestamp: { type: 'string' } }, required: ['email', 'items'] } },
        { name: 'getUserInfo', description: 'Get current user info', inputSchema: { type: 'object', properties: {}, required: [] } },
        { name: 'retrieveKeywords', description: 'Retrieve keywords for ad groups', inputSchema: { type: 'object', properties: { adgroupId: { type: 'string' }, pageSize: { type: 'number' } }, required: ['adgroupId'] } },
        { name: 'createSubscription', description: 'Create a subscription record', inputSchema: { type: 'object', properties: { email: { type: 'string' }, planId: { type: 'string' }, status: { type: 'string' }, startDate: { type: 'string' } }, required: ['email', 'planId'] } },
        { name: 'updateSubscription', description: 'Update a subscription', inputSchema: { type: 'object', properties: { subscriptionId: { type: 'string' }, status: { type: 'string' }, endDate: { type: 'string' } }, required: ['subscriptionId'] } }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      try {
        const result = await this.callHyrosAPI(name, args);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
      }
    });
  }

  async callHyrosAPI(toolName, args) {
    const baseUrl = 'https://api.hyros.com/v1';
    const config = { headers: { 'Api-Key': HYROS_API_KEY, 'Content-Type': 'application/json' } };
    const routes = {
      retrieveLeads: ['GET', '/api/v1.0/leads', true],
      createLead: ['POST', '/api/v1.0/leads', false],
      retrieveLeadsJourney: ['GET', '/api/v1.0/leads/journey', true],
      retrieveSales: ['GET', '/api/v1.0/sales', true],
      updateSales: ['PUT', '/api/v1.0/sales', true],
      createOrder: ['POST', '/api/v1.0/orders', false],
      retrieveCalls: ['GET', '/api/v1.0/calls', true],
      createCall: ['POST', '/api/v1.0/calls', false],
      updateCall: ['PUT', '/api/v1.0/calls', true],
      getAdsAttributionReport: ['GET', '/api/v1.0/attribution', true],
      getAdAccountAttributionReport: ['GET', '/api/v1.0/attribution/ad-account', true],
      createProduct: ['POST', '/api/v1.0/products', false],
      listTags: ['GET', '/api/v1.0/tags', false],
      listSources: ['GET', '/api/v1.0/sources', false],
      createSource: ['POST', '/api/v1.0/sources', false],
      listAds: ['GET', '/api/v1.0/ads', true],
      createCustomCost: ['POST', '/api/v1.0/custom-costs', false],
      createClick: ['POST', '/api/v1.0/clicks', false],
      retrieveClicks: ['GET', '/api/v1.0/leads/clicks', true],
      createCart: ['POST', '/api/v1.0/carts', false],
      getUserInfo: ['GET', '/api/v1.0/user-info', false],
      retrieveKeywords: ['GET', '/api/v1.0/keywords', true],
      createSubscription: ['POST', '/api/v1.0/subscriptions', false],
      updateSubscription: ['PUT', '/api/v1.0/subscriptions', false],
    };
    const route = routes[toolName];
    if (!route ) throw new Error(`Unknown tool: ${toolName}`);
    const [method, path, isQuery] = route;
    return this.makeRequest(method, `${baseUrl}${path}`, isQuery ? args : null, config, isQuery ? null : args);
  }

  async makeRequest(method, url, queryParams, config, bodyData) {
    try {
      if (method === 'GET' && queryParams) {
        const urlObj = new URL(url);
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            urlObj.searchParams.set(key, Array.isArray(value) ? value.join(',') : String(value));
          }
        });
        url = urlObj.toString();
      }
      const requestConfig = { method, url, ...config };
      if ((method === 'POST' || method === 'PUT') && bodyData) requestConfig.data = bodyData;
      const response = await axios(requestConfig);
      return response.data;
    } catch (error) {
      if (error.response) throw new Error(`Hyros API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      throw new Error(`Request failed: ${error.message}`);
    }
  }

  setupErrorHandling() {
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => { await this.server.close(); process.exit(0); });
  }

  async run() {
    const app = express();
    const port = parseInt(process.env.PORT || '8000', 10);
    const transports = {};

    if (MCP_SECRET_TOKEN) {
      app.use((req, res, next) => {
        if (req.headers['authorization'] !== `Bearer ${MCP_SECRET_TOKEN}`) {
          return res.status(401).send('Unauthorized');
        }
        next();
      });
      console.log('Bearer token authentication ENABLED.');
    } else {
      console.warn('MCP_SECRET_TOKEN not set — server is UNPROTECTED.');
    }

    app.get('/sse', async (req, res) => {
      const transport = new SSEServerTransport('/messages', res);
      transports[transport.sessionId] = transport;
      res.on('close', () => delete transports[transport.sessionId]);
      await this.server.connect(transport);
    });

    app.post('/messages', async (req, res) => {
      const transport = transports[req.query.sessionId];
      if (transport) await transport.handlePostMessage(req, res);
      else res.status(400).send('No active session.');
    });

    app.listen(port, '0.0.0.0', () => console.log(`Hyros MCP running on http://0.0.0.0:${port}/sse` ));
  }
}

new HyrosMCPServer().run().catch(console.error);
