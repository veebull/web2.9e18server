import express from 'express';
import dotenv from 'dotenv';
import { Telegraf } from 'telegraf';
import { InvoiceParams } from './types/invoice';
import cors from 'cors';
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Initialize Telegraf bot with your token
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

// Add start command handler
bot.command('start', (ctx) => {
  ctx.reply(
    'Welcome! I am your payment bot. I can help you process payments through Telegram.'
  );
});

// Add create command handler
bot.command('create', async (ctx) => {
  try {
    const invoiceLink = await bot.telegram.createInvoiceLink({
      title: 'Pizza',
      description: 'This is a test product description',
      payload: JSON.stringify({ telegramId: '1234567890_payload' }),
      provider_token: '',
      currency: 'XTR',
      prices: [{ label: 'Test Item', amount: 1 }], // amount in smallest currency unit (e.g., cents)
      provider_data: JSON.stringify({ telegramId: 'private_provider_data' }),
      photo_url:
        'https://png.pngtree.com/png-vector/20221119/ourmid/pngtree-cheese-pizza-vector-art-png-image_6469745.png',
    });

    await ctx.reply(`Here's your invoice link: ${invoiceLink}`);
  } catch (error) {
    console.error('Error creating invoice link via command:', error);
    await ctx.reply(`${error}`);
  }
});

app.use(express.json());

// Middleware to handle CORS
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5001',
      'https://5511-212-22-74-249.ngrok-free.app',
      'http://127.0.0.1:4040',
      'https://rnzpf-178-214-255-153.a.free.pinggy.link',
      'https://930b-178-214-255-153.ngrok-free.app/',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

// Add this before your routes
app.options('*', cors()); // Enable preflight requests for all routes

// Add this after the existing cors middleware setup
app.use((req, res, next) => {
  console.log(`[CORS] Request confirmed from origin: ${req.headers.origin}`);
  next();
});

// Create invoice link endpoint
app.post('/create-invoice-link', async (req, res) => {
  console.log('Received request body:', JSON.stringify(req.body, null, 2));
  try {
    const invoiceParams: InvoiceParams = req.body;

    // Log the processed invoice parameters
    console.log(
      'Processed invoice params:',
      JSON.stringify(invoiceParams, null, 2)
    );
    console.log(
      'Provider token:',
      process.env.TELEGRAM_PROVIDER_TOKEN ? 'exists' : 'missing'
    );

    // Validate provider token first
    // if (!process.env.TELEGRAM_PROVIDER_TOKEN) {
    //   throw new Error('Telegram provider token is not configured');
    // }

    // Create invoice link with detailed error handling
    try {
      const invoiceLink = await bot.telegram.createInvoiceLink({
        title: invoiceParams.title,
        description: invoiceParams.description,
        payload: invoiceParams.payload,
        provider_token: '',
        currency: 'XTR', // Changed from 'XTR' to 'USD' as XTR might not be supported
        prices: invoiceParams.prices,
        max_tip_amount: invoiceParams.max_tip_amount || 0,
        suggested_tip_amounts: invoiceParams.suggested_tip_amounts || [],
        photo_url: invoiceParams.photo_url,
        need_name: invoiceParams.need_name || false,
        need_phone_number: invoiceParams.need_phone_number || false,
        need_email: invoiceParams.need_email || false,
        need_shipping_address: invoiceParams.need_shipping_address || false,
        send_email_to_provider: invoiceParams.send_email_to_provider || false,
        is_flexible: invoiceParams.is_flexible || false,
      });

      console.log('Generated invoice link:', invoiceLink);
      res.json({ success: true, invoiceLink });
    } catch (telegramError: any) {
      console.error('Telegram API Error details:', {
        message: telegramError.message,
        description: telegramError.description,
        stack: telegramError.stack,
      });
      throw new Error(
        `Telegram API Error: ${telegramError.message || 'Unknown error'}`
      );
    }
  } catch (error) {
    console.error('Error creating invoice link:', error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to create invoice link',
      details: error,
    });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

// Launch bot
bot.launch().catch(console.error);

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Server URL: http://localhost:${port}`);
  console.log('----------------------------------------');
  console.log('Available endpoints:');
  console.log(`- GET  http://localhost:${port}/`);
  console.log(`- POST http://localhost:${port}/create-invoice-link`);
  console.log('----------------------------------------');
});
