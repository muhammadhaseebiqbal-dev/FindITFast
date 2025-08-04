# Test Data Management Scripts

This directory contains scripts for managing test data in the FindItFast PWA database.

## Scripts Overview

### 1. `populate-test-data.js`
Populates the Firestore database with comprehensive test data including:
- **3 Test Stores** with realistic names and locations
- **11 Test Items** with prices, positions, and verification status
- **2 Test Owner Accounts** with Firebase Authentication
- **Sample Search History** for common terms
- **Test Reports** for item feedback simulation

### 2. `clean-test-data.js`
Safely removes all test data from the database:
- Deletes test items and stores
- Removes test owner accounts from Firestore
- Cleans up test reports and search history
- Provides confirmation prompts for safety

### 3. `test-data-manager.js`
CLI utility for managing test data operations:
- Check current test data status
- Easy access to populate/clean operations
- Help and usage information

## Quick Start

### Using NPM Scripts (Recommended)

```bash
# Populate test data
npm run test:populate

# Check test data status
npm run test:status

# Clean test data (with confirmation)
npm run test:clean

# Nuclear option - clean ALL data (dangerous!)
npm run test:clean:all

# Access the manager CLI
npm run test:manager help
```

### Direct Script Execution

```bash
# Populate test data
node scripts/populate-test-data.js

# Clean test data
node scripts/clean-test-data.js

# Check status
node scripts/test-data-manager.js status
```

## Test Data Created

### Test Stores
1. **SuperMart Downtown**
   - Address: 123 Main Street, Downtown, City 12345
   - Items: Organic Milk, Whole Wheat Bread, Free Range Eggs, Greek Yogurt

2. **Fresh Market Plaza**
   - Address: 456 Oak Avenue, Midtown, City 12346
   - Items: Artisan Coffee, Organic Bananas, Almond Butter, Quinoa Pasta

3. **Corner Grocery**
   - Address: 789 Pine Street, Uptown, City 12347
   - Items: Local Honey, Sourdough Bread, Craft Beer

### Test Owner Accounts
- **owner1@test.com** : TestPassword123!
- **owner2@test.com** : TestPassword123!

### Sample Items
- Mix of verified and unverified items
- Realistic prices and positioning
- Some items with report counts for testing feedback features

## Environment Setup

Before running the scripts, ensure your environment variables are set:

```bash
# Create .env file with your Firebase configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

## Safety Features

### Confirmation Prompts
Both cleanup scripts require explicit confirmation before deleting data:
```
⚠️  WARNING: This will permanently delete all test data from the database!
Are you sure you want to continue? (yes/no):
```

### Test Data Identification
Scripts only target data with specific test identifiers:
- Store IDs: `test-store-1`, `test-store-2`, `test-store-3`
- Owner IDs: `test-owner-1`, `test-owner-2`
- Email patterns: `*@test.com`

### Nuclear Option
The `--nuclear` flag provides a way to delete ALL data (use with extreme caution):
```bash
npm run test:clean:all
# or
node scripts/clean-test-data.js --nuclear
```

## Usage Examples

### Development Workflow
```bash
# 1. Start fresh with test data
npm run test:populate

# 2. Develop and test your features
npm run dev

# 3. Check what test data exists
npm run test:status

# 4. Clean up when done
npm run test:clean
```

### Testing Scenarios
```bash
# Test user search functionality
# - Search for "milk", "bread", "coffee" (should find results)
# - Search for "xyz" (should show no results)

# Test store owner features
# - Login with owner1@test.com : TestPassword123!
# - View store dashboard
# - Add/edit items

# Test reporting system
# - Report missing items
# - Check report counts on items
```

## Troubleshooting

### Common Issues

**Firebase Configuration**
```
Error: Firebase configuration not found
```
Solution: Check your `.env` file has all required Firebase configuration variables.

**Permission Errors**
```
Error: Missing or insufficient permissions
```
Solution: Ensure your Firebase project has proper security rules configured.

**Auth User Cleanup**
```
Note: Firebase Auth users need to be deleted manually
```
Solution: Go to Firebase Console > Authentication > Users and delete test accounts manually.

### Debug Mode
For detailed logging during script execution:
```bash
DEBUG=true npm run test:populate
```

## Script Architecture

### Error Handling
- All scripts include comprehensive error handling
- Partial failures are logged but don't stop execution
- Clear error messages with suggested solutions

### Batch Operations
- Uses Firestore batch operations for efficiency
- Processes multiple documents simultaneously
- Optimized for large datasets

### Logging
- Color-coded console output
- Progress indicators for long operations
- Summary statistics after completion

## Security Considerations

### Production Safety
- Scripts check for test-specific identifiers
- Won't accidentally delete production data
- Confirmation prompts for all destructive operations

### Test Isolation
- Test data uses specific naming conventions
- Easy to identify and separate from real data
- Safe cleanup without affecting production content

---

## Contributing

When adding new test data:
1. Use `test-` prefix for IDs
2. Use `@test.com` email domain
3. Add cleanup logic to `clean-test-data.js`
4. Update this README with new data descriptions
