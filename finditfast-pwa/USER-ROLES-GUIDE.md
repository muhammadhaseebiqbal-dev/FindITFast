# User Roles & Authentication Guide 👥

## 🎯 **Different User Types Explained**

Your app now has **3 distinct user roles** with separate login systems:

---

## 🔧 **1. App Administrator**
**Purpose:** Manages the entire app, approves store requests from users

### **Login Details:**
- **URL:** http://localhost:5174/admin/auth
- **Email:** admin@finditfast.com  
- **Password:** AdminPassword123!

### **What They Can Do:**
- ✅ Approve/reject store creation requests
- ✅ View all stores and data
- ✅ Manage app-wide settings
- ✅ Access admin dashboard

### **When to Use:**
- When users submit store requests that need approval
- For overall app management and oversight

---

## 🏪 **2. Store Owner**
**Purpose:** Owns and manages individual stores

### **Login Details:**
- **URL:** http://localhost:5174/owner/auth
- **Test Accounts:**
  - owner1@test.com / TestPassword123!
  - owner2@test.com / TestPassword123!

### **What They Can Do:**
- ✅ Upload store floorplan
- ✅ Add/edit items in their store
- ✅ Manage their store information
- ✅ Access admin panel (can also approve store requests)

### **When to Use:**
- To manage your own store's inventory and layout
- When you own a physical store and want to add items

---

## 👤 **3. Regular User/Customer**
**Purpose:** Searches for items, reports issues, requests new stores

### **Access:**
- **URL:** http://localhost:5174/ (main search page)
- **No login required** for basic features

### **What They Can Do:**  
- ✅ Search for items in stores
- ✅ View store floorplans and item locations
- ✅ Report missing/moved items
- ✅ Request new stores to be added

### **When to Use:**
- As a customer looking for products
- To test the search and reporting functionality

---

## 🔄 **How They Work Together**

### **Typical Workflow:**
1. **Customer** searches for items and may request a new store
2. **App Admin** reviews and approves the store request  
3. **Store Owner** signs up, creates their store, uploads floorplan
4. **Store Owner** adds items to their floorplan
5. **Customers** can now find items in that store

---

## 🧪 **Testing Different Roles**

### **Test as App Admin:**
```powershell
# Visit admin login
start http://localhost:5174/admin/auth

# Login with: admin@finditfast.com / AdminPassword123!
# You'll see store requests to approve
```

### **Test as Store Owner:**
```powershell
# Visit owner login  
start http://localhost:5174/owner/auth

# Login with: owner1@test.com / TestPassword123!
# You'll see store management dashboard
```

### **Test as Customer:**
```powershell
# Visit main app
start http://localhost:5174/

# No login needed - you can search and request stores
```

---

## 🚨 **Current Issue Resolution**

**The "Owner Profile Not Found" error** happens because:
- You logged in as `test@gmail.com` (not a recognized owner)
- The system expects either owner accounts or admin accounts

**Solutions:**
1. **Use proper test accounts:** owner1@test.com or admin@finditfast.com
2. **Or create new owner account** through registration
3. **For admin tasks:** Use the dedicated admin login

---

## 🔗 **Quick Access Links**

| Role | Login URL | Dashboard URL |
|------|-----------|---------------|
| **App Admin** | `/admin/auth` | `/admin` |
| **Store Owner** | `/owner/auth` | `/owner/dashboard` |  
| **Customer** | `/` (main page) | No dashboard needed |

---

## 💡 **Best Practices**

1. **Use App Admin** for approving store requests
2. **Use Store Owner** for managing individual stores  
3. **Use Customer view** for testing search and user experience
4. **Keep roles separate** for clear permission boundaries

This clear separation ensures security and prevents confusion between different user types! 🎯
