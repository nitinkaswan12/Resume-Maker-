const express = require('express')
const cors = require('cors')
require('dotenv').config()
const connectDB = require('./config/db')

const app = express()
connectDB()

app.use(cors({ origin: process.env.FRONTEND_URL }))

// Stripe webhook requires the raw body, so we parse it before global express.json()
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/ai', require('./routes/ai'))
app.use('/api/resume', require('./routes/resume'))
app.use('/api/payment', require('./routes/payment'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/upload', require('./routes/upload'))

app.get('/', (req, res) => {
  res.json({ status: 'CareerForge API Running' })
})

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`)
})
