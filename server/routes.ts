import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { subscriberSchema } from "@shared/schema";
import { authController } from "./controllers/auth.controller";
import { ticketsController } from "./controllers/tickets.controller";
import { usersController } from "./controllers/users.controller";
import { shopController } from "./controllers/shop.controller";
import session from "express-session";
import { connectToDatabase, UserModel } from "./models/db";
import { generateVerificationToken, sendVerificationEmail, sendContactMessage } from "./emailService";
import { notificationScheduler } from "./notificationScheduler";
import Stripe from "stripe";
import jwt from "jsonwebtoken";

// Initialize Stripe with latest API version
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// JWT Secret for token verification
const JWT_SECRET = process.env.JWT_SECRET || 'full-fuel-jwt-secret';


// PayPal API client (to be initialized after checking for PayPal Client ID)
let paypalClient: any = null;

import { Request, Response } from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Resend verification email endpoint

  // Contact form endpoint
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const { name, email, message } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
      }
      await sendContactMessage(name, email, message || "");
      res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });
  app.post('/api/auth/resend-verification', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (user.isEmailVerified) {
        return res.status(400).json({ error: 'Email is already verified' });
      }
  // Generate new token and expiry
  const verificationToken = generateVerificationToken();
  user.emailVerificationToken = verificationToken;
  user.emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();
  await sendVerificationEmail(user.email, user.username || user.name, verificationToken);
  return res.json({ message: 'Verification email resent' });
    } catch (error) {
      console.error('Resend verification error:', error);
      return res.status(500).json({ error: 'Failed to resend verification email' });
    }
  });
  // Create HTTP server
  const httpServer = createServer(app);

  // Connect to MongoDB (async, don't block startup)
  connectToDatabase().catch(console.error);
  
  // Start notification scheduler (async, don't block startup)
  notificationScheduler.start();
  
  // Initialize PayPal client if credentials are available
  if (process.env.VITE_PAYPAL_CLIENT_ID) {
    // We'll initialize PayPal API client here when needed
    console.log("PayPal client ID available");
  }
  
  // Configure session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'fullfuel-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        secure: process.env.NODE_ENV === 'production',
      },
    })
  );

  // No passport initialization needed anymore
  
  // API Routes
  
  // Auth routes
  app.post('/api/auth/register', authController.register);
  app.post('/api/auth/login', authController.login);
  app.get('/api/auth/me', authController.getCurrentUser);
  app.post('/api/auth/google-login', authController.googleLogin);
  app.post('/api/auth/register/google', authController.registerWithGoogle);
  // Email verification endpoint
  app.get('/api/auth/verify-email', authController.verifyEmail);
  
  // Debug endpoint for email configuration (production only)
  app.get('/api/debug/email-config', (req, res) => {
    if (process.env.NODE_ENV !== 'production') {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPass: !!process.env.EMAIL_PASS,
      emailUserLength: process.env.EMAIL_USER?.length || 0,
      emailPassLength: process.env.EMAIL_PASS?.length || 0,
      clientUrl: process.env.CLIENT_URL,
      backendUrl: process.env.BACKEND_URL,
      nodeEnv: process.env.NODE_ENV
    });
  });
  
  
  // Videos
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.get("/api/videos/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const videos = await storage.getFeaturedVideos(limit);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured videos" });
    }
  });

  app.get("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  // Events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/upcoming", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const events = await storage.getUpcomingEvents(limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // Mixes
  app.get("/api/mixes", async (req, res) => {
    try {
      const mixes = await storage.getMixes();
      res.json(mixes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mixes" });
    }
  });

  app.get("/api/mixes/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 1;
      const mixes = await storage.getFeaturedMixes(limit);
      res.json(mixes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured mixes" });
    }
  });

  app.get("/api/mixes/:id", async (req, res) => {
    try {
      const mix = await storage.getMix(req.params.id);
      if (!mix) {
        return res.status(404).json({ message: "Mix not found" });
      }
      res.json(mix);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mix" });
    }
  });

  // Gallery
  app.get("/api/gallery", async (req, res) => {
    try {
      const gallery = await storage.getGallery();
      res.json(gallery);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery" });
    }
  });

  app.get("/api/gallery/:id", async (req, res) => {
    try {
      const item = await storage.getGalleryItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Gallery item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery item" });
    }
  });

  // Subscribers
  app.post("/api/subscribers", async (req, res) => {
    try {
      // Convert subscribeDate to Date if it's a string
      if (req.body.subscribeDate && typeof req.body.subscribeDate === 'string') {
        req.body.subscribeDate = new Date(req.body.subscribeDate);
      }
      // Validate request body
      const subscriberInput = subscriberSchema.omit({ id: true }).safeParse(req.body);
      if (!subscriberInput.success) {
        return res.status(400).json({ 
          message: "Invalid subscriber data", 
          errors: subscriberInput.error.errors 
        });
      }
      const subscriber = await storage.createSubscriber({
        ...subscriberInput.data,
        subscribeDate: subscriberInput.data.subscribeDate || new Date()
      });
      res.status(201).json(subscriber);
    } catch (error) {
      res.status(500).json({ message: "Failed to create subscriber" });
    }
  });
  
  // Ticket endpoints
  app.post('/api/tickets/purchase', ticketsController.purchaseTicket);
  app.get('/api/tickets/user', ticketsController.getUserTickets);
  
  // Stripe webhook
  app.post('/api/stripe/webhook', 
    // Raw body needed for signature verification
    express.raw({ type: 'application/json' }),
    ticketsController.handleStripeWebhook);
  
  // Stripe payment endpoints
  app.post('/api/create-payment-intent', async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }
    
    try {
      const { amount, eventId, metadata } = req.body;
      
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount, // Amount is already in cents
        currency: "usd",
        metadata: {
          eventId,
          ...metadata
        },
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: error.message || "Failed to create payment intent" });
    }
  });
  
  // User profile endpoints
  app.get('/api/user/profile', usersController.getProfile);
  app.put('/api/user/profile', usersController.updateProfile);
  
  // Admin endpoints
  app.get('/api/admin/users', usersController.listUsers);
  app.put('/api/admin/users/role', usersController.updateUserRole);

  // Shop endpoints
  app.get('/api/shop/products', shopController.getProducts);
  app.get('/api/shop/products/featured', shopController.getFeaturedProducts);
  app.get('/api/shop/products/:id', shopController.getProduct);
  app.post('/api/shop/products', shopController.createProduct);
  app.put('/api/shop/products/:id', shopController.updateProduct);
  app.delete('/api/shop/products/:id', shopController.deleteProduct);
  
  app.get('/api/shop/orders', shopController.getOrders);
  app.get('/api/shop/user/orders', shopController.getUserOrders);
  app.get('/api/shop/orders/:id', shopController.getOrder);
  app.put('/api/shop/orders/:id', shopController.updateOrder);
  
  app.post('/api/shop/create-payment-intent', shopController.createPaymentIntent);


  app.get('/api/shop/products/:id', async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

    

  
  // PayPal payment endpoints
  app.post('/api/create-paypal-order', async (req, res) => {
    if (!process.env.VITE_PAYPAL_CLIENT_ID) {
      return res.status(500).json({ message: "PayPal is not configured" });
    }
    
    try {
      const { amount, metadata } = req.body;
      
      // Here you would integrate with PayPal SDK to create an order
      // For now, we'll mock a successful response for testing
      const mockOrderId = `ORDER-${Date.now()}`;
      
      res.json({
        id: mockOrderId,
        status: "CREATED"
      });
    } catch (error: any) {
      console.error("Error creating PayPal order:", error);
      res.status(500).json({ message: error.message || "Failed to create PayPal order" });
    }
  });
  
  app.post('/api/capture-paypal-order', async (req, res) => {
    if (!process.env.VITE_PAYPAL_CLIENT_ID) {
      return res.status(500).json({ message: "PayPal is not configured" });
    }
    
    try {
      const { orderId } = req.body;
      
      // Here you would integrate with PayPal SDK to capture the payment
      // For now, we'll mock a successful response for testing
      
      // Create an order in our database - using any available user info
      const userId = (req as any).user?.id || null;
      if (userId) {
        // Would handle actual order creation here
        console.log("Processing order for user ID:", userId);
      }
      
      res.json({
        id: orderId,
        status: "COMPLETED"
      });
    } catch (error: any) {
      console.error("Error capturing PayPal order:", error);
      res.status(500).json({ message: error.message || "Failed to capture PayPal payment" });
    }
  });
  
  // Admin content management endpoints
  
  // Videos management (admin)
  app.post('/api/videos', async (req, res) => {
    try {
      // Check if user is admin
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await storage.getUser(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const newVideo = await storage.createVideo(req.body);
      res.status(201).json(newVideo);
    } catch (error) {
      console.error("Create video error:", error);
      res.status(500).json({ message: "Failed to create video" });
    }
  });
  
  app.put('/api/videos/:id', async (req, res) => {
    try {
      // Check if user is admin
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await storage.getUser(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const updatedVideo = await storage.updateVideo(req.params.id, req.body);
      if (!updatedVideo) {
        return res.status(404).json({ error: 'Video not found' });
      }
      
      res.json(updatedVideo);
    } catch (error) {
      console.error("Update video error:", error);
      res.status(500).json({ message: "Failed to update video" });
    }
  });
  
  app.delete('/api/videos/:id', async (req, res) => {
    try {
      // Check if user is admin
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await storage.getUser(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const success = await storage.deleteVideo(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Video not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Delete video error:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });
  
  // Events management (admin)
  app.post('/api/events', async (req, res) => {
    try {
      // Check if user is admin
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await storage.getUser(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const newEvent = await storage.createEvent(req.body);
      res.status(201).json(newEvent);
    } catch (error) {
      console.error("Create event error:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });
  
  app.put('/api/events/:id', async (req, res) => {
    try {
      // Check if user is admin
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await storage.getUser(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const updatedEvent = await storage.updateEvent(req.params.id, req.body);
      if (!updatedEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      res.json(updatedEvent);
    } catch (error) {
      console.error("Update event error:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });
  
  app.delete('/api/events/:id', async (req, res) => {
    try {
      // Check if user is admin
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await storage.getUser(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const success = await storage.deleteEvent(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Delete event error:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });
  
  // Mixes management (admin)
  app.post('/api/mixes', async (req, res) => {
    try {
      // Check if user is admin
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await storage.getUser(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const newMix = await storage.createMix(req.body);
      res.status(201).json(newMix);
    } catch (error) {
      console.error("Create mix error:", error);
      res.status(500).json({ message: "Failed to create mix" });
    }
  });
  
  app.put('/api/mixes/:id', async (req, res) => {
    try {
      // Check if user is admin
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await storage.getUser(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const updatedMix = await storage.updateMix(req.params.id, req.body);
      if (!updatedMix) {
        return res.status(404).json({ error: 'Mix not found' });
      }
      
      res.json(updatedMix);
    } catch (error) {
      console.error("Update mix error:", error);
      res.status(500).json({ message: "Failed to update mix" });
    }
  });
  
  app.delete('/api/mixes/:id', async (req, res) => {
    try {
      // Check if user is admin
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await storage.getUser(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const success = await storage.deleteMix(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Mix not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Delete mix error:", error);
      res.status(500).json({ message: "Failed to delete mix" });
    }
  });
  
  // Streams endpoints
  app.get("/api/streams/upcoming", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const streams = await storage.getUpcomingStreams(limit);
      res.json(streams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming streams" });
    }
  });

  // Get all streams (admin only) - MOVED HERE to avoid route conflicts
  app.get('/api/streams/all', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await storage.getUser(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const streams = await storage.getAllStreams();
      res.json(streams);
    } catch (error) {
      console.error("Get all streams error:", error);
      res.status(500).json({ message: "Failed to fetch streams" });
    }
  });

  app.get("/api/streams/:id", async (req, res) => {
    try {
      const stream = await storage.getStream(req.params.id);
      if (!stream) {
        return res.status(404).json({ message: "Stream not found" });
      }
      res.json(stream);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stream" });
    }
  });

  // Stream notifications
  app.post("/api/notifications/subscribe", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      
      const { streamId, notificationType } = req.body;
      if (!streamId || !notificationType) {
        return res.status(400).json({ error: 'Stream ID and notification type required' });
      }
      
      // Get stream details to calculate notification time
      const stream = await storage.getStream(streamId);
      if (!stream) {
        return res.status(404).json({ error: 'Stream not found' });
      }
      
      // Calculate notification time based on type
      const streamDate = new Date(stream.scheduledDate);
      let notifyAt = new Date(streamDate);
      
      switch (notificationType) {
        case '15min':
          notifyAt.setMinutes(notifyAt.getMinutes() - 15);
          break;
        case '1hour':
          notifyAt.setHours(notifyAt.getHours() - 1);
          break;
        case '24hour':
          notifyAt.setHours(notifyAt.getHours() - 24);
          break;
        default:
          return res.status(400).json({ error: 'Invalid notification type' });
      }
      
      const notification = await storage.createStreamNotification({
        userId: decoded.id,
        streamId,
        notificationType,
        notifyAt,
        status: 'pending'
      });
      
      res.status(201).json(notification);
    } catch (error) {
      console.error("Subscribe to notification error:", error);
      res.status(500).json({ message: "Failed to subscribe to notifications" });
    }
  });

  // Stream management (admin)
  app.post('/api/streams', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await storage.getUser(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const newStream = await storage.createStream(req.body);
      res.status(201).json(newStream);
    } catch (error) {
      console.error("Create stream error:", error);
      res.status(500).json({ message: "Failed to create stream" });
    }
  });
  
  app.put('/api/streams/:id', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await storage.getUser(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const updatedStream = await storage.updateStream(req.params.id, req.body);
      if (!updatedStream) {
        return res.status(404).json({ error: 'Stream not found' });
      }
      
      res.json(updatedStream);
    } catch (error) {
      console.error("Update stream error:", error);
      res.status(500).json({ message: "Failed to update stream" });
    }
  });
  
  app.delete('/api/streams/:id', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await storage.getUser(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const success = await storage.deleteStream(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Stream not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Delete stream error:", error);
      res.status(500).json({ message: "Failed to delete stream" });
    }
  });

  // Gallery management (admin)
  app.post('/api/gallery', async (req, res) => {
    try {
      // Check if user is admin
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await storage.getUser(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const newGalleryItem = await storage.createGalleryItem(req.body);
      res.status(201).json(newGalleryItem);
    } catch (error) {
      console.error("Create gallery item error:", error);
      res.status(500).json({ message: "Failed to create gallery item" });
    }
  });
  
  app.put('/api/gallery/:id', async (req, res) => {
    try {
      // Check if user is admin
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await storage.getUser(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const updatedGalleryItem = await storage.updateGalleryItem(req.params.id, req.body);
      if (!updatedGalleryItem) {
        return res.status(404).json({ error: 'Gallery item not found' });
      }
      
      res.json(updatedGalleryItem);
    } catch (error) {
      console.error("Update gallery item error:", error);
      res.status(500).json({ message: "Failed to update gallery item" });
    }
  });
  
  app.delete('/api/gallery/:id', async (req, res) => {
    try {
      // Check if user is admin
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await storage.getUser(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const success = await storage.deleteGalleryItem(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Gallery item not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Delete gallery item error:", error);
      res.status(500).json({ message: "Failed to delete gallery item" });
    }
  });

  // Sample Data for testing (remove in production)
  createSampleData();

  return httpServer;
}

// Helper function to create sample data
async function createSampleData() {
  try {
    // Check if we already have data
    const videos = await storage.getVideos();
    
    if (videos.length === 0) {
    
      
   
      
      // Create sample gallery items
      

      

      console.log("Sample data created successfully");
    }
  } catch (error) {
    console.error("Error creating sample data:", error);
  }

  
}
