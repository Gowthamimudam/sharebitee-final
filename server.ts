import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store for the preview environment
// Initialized with standard baseline records
let serverDonations: any[] = [];
let serverMissions: any[] = [];
let serverNgos: any[] = [];
let serverVolunteers: any[] = [];
let serverImpact = {
  mealsDonated: 1540,
  mealsRescued: 1280,
  donationsCompleted: 42,
  foodWasteDivertedKg: 940,
  co2AvoidedKg: 2350,
  activeDonors: 48,
  ngosSupported: 26,
  volunteerMissions: 84
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ShareBite REST API', timestamp: new Date().toISOString() });
});

// Donations endpoints
app.get('/api/donations', (req, res) => {
  res.json({ success: true, count: serverDonations.length, data: serverDonations });
});

app.post('/api/donations', (req, res) => {
  const newDonation = req.body;
  if (!newDonation.id) {
    newDonation.id = 'don-' + Date.now();
  }
  serverDonations.unshift(newDonation);
  serverImpact.mealsDonated += Number(newDonation.servings) || 0;
  res.status(201).json({ success: true, data: newDonation });
});

app.patch('/api/donations/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, allocations } = req.body;
  const index = serverDonations.findIndex((d) => d.id === id);
  if (index !== -1) {
    if (status) serverDonations[index].status = status;
    if (allocations) serverDonations[index].allocations = allocations;
    serverDonations[index].updatedAt = new Date().toISOString();
    return res.json({ success: true, data: serverDonations[index] });
  }
  res.status(404).json({ success: false, error: 'Donation not found' });
});

// NGOs endpoints
app.get('/api/ngos', (req, res) => {
  res.json({ success: true, count: serverNgos.length, data: serverNgos });
});

// Missions endpoints
app.get('/api/missions', (req, res) => {
  res.json({ success: true, count: serverMissions.length, data: serverMissions });
});

app.patch('/api/missions/:id/stage', (req, res) => {
  const { id } = req.params;
  const { stage, conditionVerification } = req.body;
  const index = serverMissions.findIndex((m) => m.id === id);
  if (index !== -1) {
    serverMissions[index].stage = stage;
    if (conditionVerification) {
      serverMissions[index].conditionVerification = conditionVerification;
    }
    if (stage === 'RESCUED_COMPLETED') {
      const servings = Number(serverMissions[index].servings) || 0;
      serverImpact.mealsRescued += servings;
      serverImpact.donationsCompleted += 1;
      serverImpact.foodWasteDivertedKg += Math.round(servings * 0.45);
      serverImpact.co2AvoidedKg += Math.round(servings * 1.15);
    }
    return res.json({ success: true, data: serverMissions[index] });
  }
  res.status(404).json({ success: false, error: 'Mission not found' });
});

// Impact statistics endpoint
app.get('/api/impact', (req, res) => {
  res.json({ success: true, data: serverImpact });
});

// Setup Vite dev server middleware or serve production dist
async function setupViteMiddleware() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ShareBite server listening on http://0.0.0.0:${PORT}`);
  });
}

setupViteMiddleware().catch((err) => {
  console.error('Failed to start server:', err);
});
