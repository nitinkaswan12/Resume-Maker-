const express = require('express')
const router = express.Router()
const { createCheckoutSession, handleWebhook, PLANS } = require('../services/stripeService')

/**
 * POST /api/payment/create-session
 * Body: { userId, userEmail, plan, billingCycle }
 *   plan         → 'base' | 'pro' | 'enterprise'
 *   billingCycle  → 'monthly' | 'yearly'
 */
router.post('/create-session', async (req, res) => {
  try {
    const { userId, userEmail, plan, billingCycle } = req.body

    if (!userId || !userEmail) {
      return res.status(400).json({ error: 'userId and userEmail are required' })
    }

    const validPlans = Object.keys(PLANS)
    const selectedPlan = validPlans.includes(plan) ? plan : 'pro'
    const selectedCycle = billingCycle === 'yearly' ? 'yearly' : 'monthly'

    const session = await createCheckoutSession(userId, userEmail, selectedPlan, selectedCycle)
    res.json({ url: session.url })
  } catch (error) {
    console.error('Create checkout session error:', error)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
})

/**
 * GET /api/payment/plans
 * Returns the available plans and their pricing for the frontend.
 */
router.get('/plans', (req, res) => {
  const plans = Object.entries(PLANS).map(([key, config]) => ({
    id: key,
    name: config.name,
    description: config.description,
    monthlyPrice: config.monthly / 100,   // Convert cents → dollars
    yearlyPrice: config.yearly / 100,
    yearlyMonthly: Math.round(config.yearly / 12) / 100,
  }))
  res.json({ plans })
})

// Stripe webhook — must receive raw body (not parsed by express.json)
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature']
    const payload = req.body

    const result = await handleWebhook(payload, signature)
    res.json(result)
  } catch (error) {
    console.error('Stripe webhook error:', error.message)
    res.status(400).send(`Webhook error: ${error.message}`)
  }
})

module.exports = router
