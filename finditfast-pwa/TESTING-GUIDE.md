# Database Testing Quick Start Guide

## 🚀 Quick Commands

```powershell
# 1. Preview what data will be created (safe - no changes)
npm run test:demo

# 2. Populate database with test data
npm run test:populate

# 3. Clean up test data
npm run test:clean

# 4. Interactive database management
npm run test:manage
```

## 📊 Test Data Structure

### Owners (2 accounts)
- **owner1@test.com** / TestPassword123!
- **owner2@test.com** / TestPassword123!

### Stores (3 locations)
- **TechMart** (Electronics) - owned by owner1
- **FashionHub** (Clothing) - owned by owner2  
- **BookNook** (Books) - owned by owner1

### Items (11 products)
- 4 items in TechMart
- 4 items in FashionHub
- 3 items in BookNook

## 🔧 Development Workflow

1. **Start Development Server**
   ```powershell
   npm run dev
   ```

2. **Populate Test Data**
   ```powershell
   npm run test:populate
   ```

3. **Test the Application**
   - Visit http://localhost:5174
   - Use owner credentials to log in
   - Test search functionality
   - Try mobile responsive features

4. **Clean Up After Testing**
   ```powershell
   npm run test:clean
   ```

## 📱 Mobile Testing Features

Your app now includes:
- Touch-friendly interface (44px minimum touch targets)
- Responsive design for all screen sizes
- Performance optimizations (lazy loading, image optimization)
- Safe area support for iOS devices
- Gesture handlers for mobile interactions

## 🔥 Firebase Collections Created

- `owners` - Store owner accounts
- `stores` - Store information and locations
- `items` - Product inventory with coordinates
- `users` - Customer accounts (if any)

## ⚠️ Safety Features

- All scripts require confirmation before making changes
- Demo mode shows exactly what will be created
- Clean script only removes test data (not production data)
- Batch operations for efficient database management

## 📝 Next Steps

1. Run `npm run test:demo` to see what data would be created
2. Run `npm run test:populate` to add test data to your database
3. Test your application with realistic data
4. Use `npm run test:clean` when you're done testing

Happy testing! 🎉
