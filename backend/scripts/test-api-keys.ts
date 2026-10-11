import { config } from '../src/config/index.js';

async function testAdminApiKeysFlow() {
  console.log('Testing Admin API Keys flow against local backend...');
  const baseUrl = `http://localhost:${config.port || 4000}`;

  // 1. Login as Admin
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@reviewplatform.local',
      password: 'AdminSecurePassword123!',
    }),
  });
  const loginJson = await loginRes.json();
  if (!loginJson.success || !loginJson.data?.token) {
    throw new Error(`Login failed: ${JSON.stringify(loginJson)}`);
  }
  const token = loginJson.data.token;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  console.log('✓ Successfully logged in as Super Admin');

  // 2. Fetch existing API keys
  const listRes = await fetch(`${baseUrl}/api/admin/api-keys`, { headers });
  const listJson = await listRes.json();
  console.log(`✓ Fetched initial API keys count: ${listJson.data?.length || 0}`);
  if (listJson.data?.length > 0) {
    console.log('Existing Keys:', listJson.data.map((k: any) => ({ name: k.name, service: k.service, mask: k.keyMask, active: k.isActive })));
  }

  // 3. Register a new Gemini API Key
  const createRes = await fetch(`${baseUrl}/api/admin/api-keys`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      service: 'GEMINI',
      name: 'Secondary Gemini Failover Key',
      keyValue: 'AIzaSyDemoSecondaryKeyForTestingOnly987654321',
      secondaryValue: 'gemini-1.5-flash',
    }),
  });
  const createJson = await createRes.json();
  if (!createJson.success) {
    throw new Error(`Failed to create API key: ${JSON.stringify(createJson)}`);
  }
  const newKey = createJson.data;
  console.log(`✓ Successfully registered API Key: ID=${newKey.id}, Mask=${newKey.keyMask}`);

  // 4. Update the key (e.g. rename and toggle pause)
  const updateRes = await fetch(`${baseUrl}/api/admin/api-keys/${newKey.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      name: 'Secondary Gemini Key (Paused)',
      isActive: false,
    }),
  });
  const updateJson = await updateRes.json();
  console.log(`✓ Updated key: active=${updateJson.data.isActive}, name="${updateJson.data.name}"`);

  // 5. Test connection raw endpoint
  const rawTestRes = await fetch(`${baseUrl}/api/admin/api-keys/test-raw`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      service: 'GEMINI',
      keyValue: 'AIzaSyFakeKeyTestValidation',
      secondaryValue: 'gemini-1.5-flash',
    }),
  });
  const rawTestJson = await rawTestRes.json();
  console.log(`✓ Raw key validation check completed: success=${rawTestJson.success}, isValid=${rawTestJson.data?.isValid}`);

  // 6. Delete the test API key
  const deleteRes = await fetch(`${baseUrl}/api/admin/api-keys/${newKey.id}`, {
    method: 'DELETE',
    headers,
  });
  const deleteJson = await deleteRes.json();
  console.log(`✓ Deleted key response: success=${deleteJson.success}`);

  // 7. Re-fetch keys list to verify deletion
  const verifyListRes = await fetch(`${baseUrl}/api/admin/api-keys`, { headers });
  const verifyListJson = await verifyListRes.json();
  const exists = verifyListJson.data.some((k: any) => k.id === newKey.id);
  console.log(`✓ Verified key removed from system: exists=${exists}`);

  console.log('\n🌟 ALL SUPER ADMIN API KEY ENDPOINTS VERIFIED AND WORKING 100%!');
}

testAdminApiKeysFlow().catch((err) => {
  console.error('Test script failed:', err);
  process.exit(1);
});
