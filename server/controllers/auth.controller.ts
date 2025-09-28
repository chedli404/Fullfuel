// Register new user
register: async (req: Request, res: Response) => {
  try {
    const { name, email, password, username, phoneNumber } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    // Validate phone number if provided
    if (phoneNumber) {
      let normalizedPhone = phoneNumber.replace(/\s+/g, '');
      if (!normalizedPhone.startsWith('+') && /^\d{11,15}$/.test(normalizedPhone)) {
        normalizedPhone = '+' + normalizedPhone;
      }
      let valid = false;
      try {
        const parsed = parsePhoneNumber(normalizedPhone);
        valid = parsed.isValid() && parsed.isPossible();
      } catch (e) {
        try {
          valid = isValidPhoneNumber(normalizedPhone, 'TN');
        } catch (e2) {
          console.error('Phone validation error:', e2);
        }
      }
      if (!valid) {
        console.error('Phone validation failed for:', normalizedPhone);
        return res.status(400).json({ error: 'Invalid or incomplete phone number' });
      }
    }
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    if (phoneNumber) {
      const existingPhone = await storage.getUserByPhoneNumber(phoneNumber);
      if (existingPhone) {
        return res.status(400).json({ error: 'Phone number is already in use' });
      }
    }
    if (username) {
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser: InsertUser = {
      name,
      email,
      username: username || email.split('@')[0],
      password: hashedPassword,
      role: 'user',
      phoneNumber: phoneNumber || '',
      favoriteArtists: [],
      purchasedTickets: [],
      status: 'active',
      isEmailVerified: false,
      ...(phoneNumber ? { phoneNumber } : {})
    };
    // Create user
    const user = await storage.createUser(newUser);
    // Generate verification token
    const verificationToken = generateVerificationToken();
    // Update user with token and expiry using UserModel
    const userDoc = await UserModel.findByIdAndUpdate(
      user.id,
      {
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      { new: true }
    );
    
    // Try to send verification email, but don't fail registration if it fails
    if (userDoc) {
      try {
        await sendVerificationEmail(userDoc.email, userDoc.username || userDoc.name, verificationToken);
        console.log('Verification email sent successfully');
      } catch (emailError) {
        console.error('Email sending failed, but continuing registration:', emailError);
        // Don't throw the error - let registration succeed even if email fails
      }
    }
    
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const userWithoutPassword = {
      ...user,
      password: undefined
    };
    return res.json({ token, user: userWithoutPassword, verification: 'sent' });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Error creating user' });
  }
},
