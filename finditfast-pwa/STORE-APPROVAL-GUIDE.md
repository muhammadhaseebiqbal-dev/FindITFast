# Store Request Approval System 🏪

## 🎯 **Where to Approve Store Requests**

Your store requests can be approved through the **Admin Dashboard**:

### **Admin Dashboard URL:** 
**http://localhost:5174/admin**

### **How to Access:**
1. **From Owner Dashboard:** Click the "Admin Panel" button in Quick Actions
2. **Direct URL:** Navigate to `/admin` while logged in as a store owner
3. **Login Required:** Use any store owner account (like owner1@test.com)

---

## 📋 **Complete Workflow**

### **1. Users Submit Store Requests**
- Users visit `/request-store` page  
- Fill out store name, address, and optional notes
- Request gets saved to `storeRequests` collection with `status: 'pending'`

### **2. Store Owners Review Requests** 
- Login to Owner Dashboard
- Click "Admin Panel" or visit `/admin`
- See all pending requests with full details
- Approve or reject with optional notes

### **3. Request Status Updates**
- **Approved:** Status changes to `approved` 
- **Rejected:** Status changes to `rejected` with reason
- Users can check their request status (future feature)

---

## 🧪 **Testing the System**

### **Create Test Store Request:**
```powershell
npm run test:store-request
```

### **Login as Admin:**
- **URL:** http://localhost:5174/admin/auth
- **Email:** admin@finditfast.com  
- **Password:** AdminPassword123!

**OR** (Store Owner with Admin Access):
- **URL:** http://localhost:5174/owner/auth  
- **Email:** owner1@test.com  
- **Password:** TestPassword123!

### **Admin Dashboard Features:**
- ✅ View all pending requests
- ✅ Approve/reject with one click  
- ✅ Add rejection reasons
- ✅ See request history
- ✅ Real-time counts and statistics

---

## 🔧 **Current Implementation**

### **Components:**
- `StoreRequestManager` - Main admin interface
- `AdminDashboard` - Admin page wrapper
- `StoreRequestForm` - User submission form
- `StoreRequestService` - Database operations

### **Routes:**
- `/admin` - Store approval dashboard (owner login required)
- `/request-store` - User store request form (public)
- `/owner/dashboard` - Owner dashboard with admin access

### **Database Collections:**
- `storeRequests` - All store requests with status tracking
- `stores` - Approved and active stores
- `storeOwners` - Store owner accounts

---

## 💡 **Usage Examples**

### **Test a Complete Workflow:**

1. **Create a test request:**
   ```powershell
   npm run test:store-request
   ```

2. **Start your app:**
   ```powershell
   npm run dev
   ```

3. **Login and approve:**
   - **Admin Login:** Visit http://localhost:5174/admin/auth
   - Use: admin@finditfast.com / AdminPassword123!
   - **OR Store Owner:** Visit http://localhost:5174/owner/auth  
   - Use: owner1@test.com / TestPassword123! (need owner profile)
   - Navigate to Admin Dashboard
   - Review and approve the "Downtown Electronics" request

4. **Check the result:**
   - Request status changes to "approved"
   - Appears in processed requests history

---

## 🚀 **Next Steps**

Once you approve a store request, you could:

1. **Automatically create store records** in the `stores` collection
2. **Send email notifications** to the requestor  
3. **Create owner accounts** for approved stores
4. **Add user notification system** to show request status

The foundation is all set up - you can now manage store requests efficiently through the admin dashboard!

---

## 🔗 **Quick Links**

- **Admin Dashboard:** http://localhost:5174/admin
- **Owner Dashboard:** http://localhost:5174/owner/dashboard  
- **Store Request Form:** http://localhost:5174/request-store
- **Owner Login:** http://localhost:5174/owner/auth

**Happy store managing! 🎉**
