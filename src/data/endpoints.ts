
import { Endpoint } from '../types/api';

export const endpoints: Endpoint[] = [
  // Authentication
  {
    id: 'auth-login',
    title: 'User Login',
    method: 'POST',
    path: '/auth/login',
    description: 'Authenticate user and receive access token',
    category: 'Authentication',
    requestBody: {
      email: 'user@example.com',
      password: 'password123'
    },
    responseExamples: [
      {
        statusCode: '200',
        description: 'Successful response',
        example: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refresh_token: 'def50200e3c...',
          expires_in: 3600,
          user: {
            id: 1,
            email: 'user@example.com',
            name: 'John Doe'
          }
        }
      }
    ]
  },
  {
    id: 'auth-refresh',
    title: 'Refresh Token',
    method: 'POST',
    path: '/auth/refresh',
    description: 'Refresh access token using refresh token',
    category: 'Authentication',
    requestBody: {
      refresh_token: 'def50200e3c...'
    }
  },
  
  // Customers
  {
    id: 'customers-list',
    title: 'List Customers',
    method: 'GET',
    path: '/customers',
    description: 'Retrieve a paginated list of customers',
    category: 'Customers',
    parameters: [
      { name: 'page', type: 'number', required: false, description: 'Page number', example: 1 },
      { name: 'limit', type: 'number', required: false, description: 'Items per page', example: 20 },
      { name: 'search', type: 'string', required: false, description: 'Search term', example: 'acme' }
    ],
    responseExamples: [
      {
        statusCode: '200',
        description: 'Successful response',
        example: {
          data: [
            {
              customer_code: 'CUST001',
              name: 'Acme Corporation',
              email: 'contact@acme.com',
              phone: '+1-555-0123',
              created_at: '2024-01-15T10:30:00Z'
            }
          ],
          pagination: {
            current_page: 1,
            total_pages: 5,
            total_items: 95,
            per_page: 20
          }
        }
      }
    ]
  },
  {
    id: 'customers-get',
    title: 'Get Customer',
    method: 'GET',
    path: '/customers/{customer_code}',
    description: 'Retrieve specific customer details',
    category: 'Customers',
    pathParams: [
      { name: 'customer_code', type: 'string', required: true, description: 'Customer code', example: 'CUST001' }
    ]
  },
  {
    id: 'customers-create',
    title: 'Create Customer',
    method: 'POST',
    path: '/customers',
    description: 'Create a new customer record',
    category: 'Customers',
    requestBody: {
      customer_code: 'CUST002',
      name: 'Tech Solutions Inc',
      email: 'info@techsolutions.com',
      phone: '+1-555-0456',
      address: {
        street: '123 Business Ave',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105'
      }
    }
  },
  
  // Invoices
  {
    id: 'invoices-list',
    title: 'List Invoices',
    method: 'GET',
    path: '/invoices',
    description: 'Retrieve invoices with filtering options',
    category: 'Invoices',
    parameters: [
      { name: 'customer_code', type: 'string', required: false, description: 'Filter by customer', example: 'CUST001' },
      { name: 'status', type: 'string', required: false, description: 'Filter by status', example: 'paid' },
      { name: 'from_date', type: 'string', required: false, description: 'Start date', example: '2024-01-01' },
      { name: 'to_date', type: 'string', required: false, description: 'End date', example: '2024-12-31' }
    ]
  },
  {
    id: 'invoices-get',
    title: 'Get Invoice',
    method: 'GET',
    path: '/invoices/{invoice_number}',
    description: 'Retrieve specific invoice details',
    category: 'Invoices',
    pathParams: [
      { name: 'invoice_number', type: 'string', required: true, description: 'Invoice number', example: 'INV-2024-001' }
    ]
  },
  {
    id: 'invoices-create',
    title: 'Create Invoice',
    method: 'POST',
    path: '/invoices',
    description: 'Create a new invoice',
    category: 'Invoices',
    requestBody: {
      customer_code: 'CUST001',
      invoice_date: '2024-07-02',
      due_date: '2024-08-01',
      items: [
        {
          description: 'Web Development Services',
          quantity: 1,
          unit_price: 2500.00,
          total: 2500.00
        }
      ],
      subtotal: 2500.00,
      tax_rate: 0.08,
      tax_amount: 200.00,
      total: 2700.00
    }
  },
  
  // Products
  {
    id: 'products-list',
    title: 'List Products',
    method: 'GET',
    path: '/products',
    description: 'Retrieve product catalog',
    category: 'Products',
    parameters: [
      { name: 'category', type: 'string', required: false, description: 'Product category', example: 'software' },
      { name: 'active', type: 'boolean', required: false, description: 'Filter active products', example: true }
    ]
  },
  {
    id: 'products-create',
    title: 'Create Product',
    method: 'POST',
    path: '/products',
    description: 'Add new product to catalog',
    category: 'Products',
    requestBody: {
      sku: 'SOFT-001',
      name: 'Enterprise Software License',
      description: 'Annual enterprise software license',
      price: 999.99,
      category: 'software',
      active: true
    }
  }
];

export const endpointCategories = Array.from(new Set(endpoints.map(e => e.category)));
