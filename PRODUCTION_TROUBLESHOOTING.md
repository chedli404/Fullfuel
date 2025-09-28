# Production Troubleshooting Guide

## 🚀 Performance Issues Fixed

### 1. Slow Panel Loading
**Problem**: Application takes too long to load
**Solutions Applied**:
- ✅ **Lazy Loading**: All pages now load on-demand instead of all at once
- ✅ **Non-blocking Database**: MongoDB connection no longer blocks server startup
- ✅ **Async Initialization**: Notification scheduler starts asynchronously
- ✅ **Loading States**: Added proper loading indicators

### 2. Email Verification Not Working
**Problem**: No verification emails in production
**Solutions Applied**:
- ✅ **Fixed URL Construction**: Verification links now point to correct backend
- ✅ **Enhanced Error Handling**: Better logging and graceful failures
- ✅ **Debug Endpoint**: Added `/api/debug/email-config` for troubleshooting

## 🔧 Production Setup Checklist

### Required Environment Variables
```bash
# Email Configuration (CRITICAL)
EMAIL_USER=infofullfueltv@gmail.com
EMAIL_PASS=your-gmail-app-password

# URL Configuration
CLIENT_URL=https://fullfueltv.online
BACKEND_URL=https://fullfueltv.online

# Database
MONGODB_URI=your-mongodb-connection-string

# Security
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
```

### Gmail App Password Setup
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication
3. Go to "App passwords"
4. Generate password for "Mail"
5. Use this as `EMAIL_PASS` (NOT your regular password)

## 🐛 Debugging Steps

### 1. Check Email Configuration
Visit: `https://fullfueltv.online/api/debug/email-config`

Expected response:
```json
{
  "hasEmailUser": true,
  "hasEmailPass": true,
  "emailUserLength": 20,
  "emailPassLength": 16,
  "clientUrl": "https://fullfueltv.online",
  "backendUrl": "https://fullfueltv.online",
  "nodeEnv": "production"
}
```

### 2. Check Server Logs
Look for these messages in production logs:
- ✅ `Email server is ready to send messages`
- ✅ `Verification email sent successfully`
- ❌ `Email configuration error:`
- ❌ `DETAILED EMAIL ERROR:`

### 3. Test Email Verification
1. Register a new user
2. Check server logs for email sending attempts
3. Check spam folder for verification email
4. Verify the email link works

## 🚨 Common Issues & Solutions

### Issue: "Email server is ready to send messages" not appearing
**Solution**: Check `EMAIL_USER` and `EMAIL_PASS` environment variables

### Issue: "Invalid login" email errors
**Solution**: Use Gmail App Password, not regular password

### Issue: Verification link doesn't work
**Solution**: Check `BACKEND_URL` environment variable

### Issue: Slow loading still occurs
**Solution**: 
- Check if all pages are lazy loaded
- Monitor network requests in browser dev tools
- Check server response times

## 📊 Performance Monitoring

### Server Performance
- Database connection should be non-blocking
- Server should start in < 5 seconds
- Email verification should complete in < 10 seconds

### Client Performance
- Initial page load should be < 3 seconds
- Navigation between pages should be < 1 second
- Loading indicators should appear immediately

## 🔄 Deployment Steps

1. **Set Environment Variables** in your production environment
2. **Deploy Updated Code** with performance optimizations
3. **Test Email Configuration** using debug endpoint
4. **Test User Registration** and email verification
5. **Monitor Performance** and server logs

## 📞 Support

If issues persist:
1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test email configuration using the debug endpoint
4. Check Gmail account for any security restrictions

## 🎯 Expected Results

After applying these fixes:
- ✅ **Fast Loading**: Application loads in < 3 seconds
- ✅ **Email Verification**: Users receive verification emails
- ✅ **Better UX**: Loading indicators and smooth navigation
- ✅ **Production Ready**: Stable and performant in production
