require('dotenv').config()
const express  = require('express')
const mongoose = require('mongoose')
const cors     = require('cors')

const app         = express()
const PORT        = process.env.PORT || 5000
const MONGO_URI   = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/samagra_shiksha'

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/schools', require('./routes/schools'))

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// Connect to MongoDB then start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected:', MONGO_URI)
    app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`))
  })
  .catch((err) => {
    console.warn('⚠️   MongoDB unavailable — starting server without DB:', err.message)
    app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT} (no DB)`))
  })
