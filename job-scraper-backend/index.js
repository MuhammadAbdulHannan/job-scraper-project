import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db.js';
import ngrok from '@ngrok/ngrok';

// Importing Routes
import scrapeRoutes from './src/routes/scrape.js';
import webhookRoutes from './src/routes/webhook.routes.js';

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({
        status: "Backend Running"
    })
});



// Routes
app.use('/api', scrapeRoutes);
app.use('/api', webhookRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
});

async function forwardToApp() {
    const forwarder = await ngrok.forward({
        addr: "localhost:5000",
        authtoken_from_env: true,
        domain: "omit-stoop-capable.ngrok-free.dev",
    });
    console.log(`Available at: ${forwarder.url()}`);
}

forwardToApp();