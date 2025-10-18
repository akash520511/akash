const express = require('express');
const { execFile } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Transaction endpoint
app.post('/transaction', (req, res) => {
    const { accNo, amount, location } = req.body;
    
    console.log('Received transaction:', { accNo, amount, location });

    // Input validation
    if (!accNo || !amount || !location) {
        return res.json({ 
            alerts: ["All fields are required"], 
            success: false 
        });
    }

    // Execute C backend
    execFile('./fraudBackend', [accNo.toString(), amount.toString(), location], (error, stdout, stderr) => {
        if (error) {
            console.error('Backend error:', error);
            return res.json({ 
                alerts: ["Backend service unavailable"], 
                success: false 
            });
        }
        
        try {
            console.log('Backend output:', stdout);
            const result = JSON.parse(stdout);
            res.json(result);
        } catch (parseError) {
            console.error('Parse error:', stdout);
            res.json({ 
                alerts: ["Service response error"], 
                success: false 
            });
        }
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
app.listen(PORT, 'localhost', () => {
    console.log(`🚀 Fraud Detection System running on http://localhost:${PORT}`);
});
