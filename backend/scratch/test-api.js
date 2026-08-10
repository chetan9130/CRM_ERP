const http = require('http');

const baseUrl = 'http://localhost:5000/api';

async function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = `${baseUrl}${path}`;
    const parsedUrl = new URL(url);
    
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsedData });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testAll() {
  console.log('--- Testing Auth API (Admin Login) ---');
  let token;
  try {
    const loginRes = await makeRequest('POST', '/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    console.log('Login Status:', loginRes.status);
    console.log('Login Body:', loginRes.body);
    token = loginRes.body.token;
  } catch (error) {
    console.error('Login failed:', error);
  }

  if (!token) {
    console.error('Could not get token. Aborting test.');
    return;
  }

  console.log('\n--- Testing CRM API (List Customers) ---');
  let customerId;
  try {
    const listCustRes = await makeRequest('GET', '/customers?page=1&limit=5', null, token);
    console.log('List Customers Status:', listCustRes.status);
    console.log('First Customer:', listCustRes.body.data ? listCustRes.body.data[0] : 'None');
    if (listCustRes.body.data && listCustRes.body.data.length > 0) {
      customerId = listCustRes.body.data[0].id;
    }
  } catch (error) {
    console.error('List customers failed:', error);
  }

  console.log('\n--- Testing Products API (List Products) ---');
  let productId;
  try {
    const listProdRes = await makeRequest('GET', '/products?page=1&limit=5', null, token);
    console.log('List Products Status:', listProdRes.status);
    console.log('First Product:', listProdRes.body.data ? listProdRes.body.data[0] : 'None');
    if (listProdRes.body.data && listProdRes.body.data.length > 0) {
      productId = listProdRes.body.data[0].id;
    }
  } catch (error) {
    console.error('List products failed:', error);
  }

  if (customerId && productId) {
    console.log('\n--- Testing Challan API (Create Draft) ---');
    let challanId;
    try {
      const createChallanRes = await makeRequest('POST', '/challans', {
        customer_id: customerId,
        items: [
          {
            product_id: productId,
            quantity: 2
          }
        ]
      }, token);
      console.log('Create Challan Status:', createChallanRes.status);
      console.log('Create Challan Body:', createChallanRes.body);
      challanId = createChallanRes.body.id;
    } catch (error) {
      console.error('Create Challan failed:', error);
    }

    if (challanId) {
      console.log('\n--- Testing Challan API (Confirm Challan) ---');
      try {
        const confirmRes = await makeRequest('POST', `/challans/${challanId}/confirm`, {}, token);
        console.log('Confirm Challan Status:', confirmRes.status);
        console.log('Confirm Challan Body:', confirmRes.body);
      } catch (error) {
        console.error('Confirm Challan failed:', error);
      }

      console.log('\n--- Testing Challan API (Cancel Challan) ---');
      try {
        const cancelRes = await makeRequest('POST', `/challans/${challanId}/cancel`, {}, token);
        console.log('Cancel Challan Status:', cancelRes.status);
        console.log('Cancel Challan Body:', cancelRes.body);
      } catch (error) {
        console.error('Cancel Challan failed:', error);
      }
    }
  }
  
  console.log('\nAll tests complete.');
}

testAll();
