# 🔐 **Role-Based Access Control & Permissions**

## **🎯 Overview**
The FindITFast system implements strict role separation to ensure data security and proper workflow management.

---

## **👤 Store Owner Role**

### **✅ What Store Owners CAN Do:**
1. **Account Management:**
   - Register their own store owner account
   - Login to their owner dashboard
   - Update their profile information

2. **Store Requests:**
   - Submit new store requests from their dashboard
   - View status of THEIR OWN store requests only
   - Track pending/approved/rejected status of their requests

3. **Store Management (for approved stores):**
   - Manage stores that belong to them
   - Upload floorplans for their stores
   - Add/edit items in their stores
   - View analytics for their stores

### **❌ What Store Owners CANNOT Do:**
1. **Admin Functions:**
   - ❌ Access admin dashboard (`/admin`)
   - ❌ Approve or reject ANY store requests (including their own)
   - ❌ View store requests from other store owners
   - ❌ Access system-wide settings

2. **Cross-Owner Access:**
   - ❌ See other owners' stores
   - ❌ View other owners' store requests
   - ❌ Edit stores owned by other store owners
   - ❌ Access data that doesn't belong to them

---

## **👨‍💼 Admin Role**

### **✅ What Admins CAN Do:**
1. **Store Request Management:**
   - View ALL store requests from ALL store owners
   - Approve store requests (creates actual store records)
   - Reject store requests with feedback
   - Delete inappropriate requests

2. **System Management:**
   - Access admin dashboard (`/admin`)
   - Manage system-wide settings
   - Monitor all store activity
   - Handle escalated issues

### **🔒 Admin Access Control:**
- Only users with email `admin@finditfast.com` have admin access
- Admin login: `/admin/auth`
- Protected by Firebase security rules

---

## **🛡️ Security Implementation**

### **Frontend Protection:**
1. **Route Protection:**
   - `ProtectedRoute` component enforces role-based access
   - Owner routes require owner profile
   - Admin routes require admin email

2. **UI Restrictions:**
   - Store owners don't see admin buttons
   - Data displays filtered by ownership
   - No cross-owner data visibility

### **Backend Security (Firestore Rules):**
1. **Store Requests Collection:**
   ```javascript
   // Store owners can read only THEIR requests
   allow read: if resource.data.requestedBy == request.auth.uid || 
                  request.auth.email == 'admin@finditfast.com';
   
   // Only store owners can create requests for themselves
   allow create: if isStoreOwner() && 
                    request.auth.uid == resource.data.requestedBy;
   
   // Only admins can approve/reject
   allow update: if request.auth.email == 'admin@finditfast.com';
   ```

2. **Stores Collection:**
   ```javascript
   // Only store owner can manage their stores
   allow update: if request.auth.uid == resource.data.ownerId;
   ```

3. **Store Owners Collection:**
   ```javascript
   // Owners can only read/edit their own profile
   allow read: if request.auth.uid == resource.id;
   ```

---

## **🔄 Workflow Enforcement**

### **Store Request Process:**
1. **Store Owner:** Submits request (can only see their own)
2. **Admin:** Reviews ALL requests (has full visibility)
3. **Admin:** Approves/rejects (creates actual store on approval)
4. **Store Owner:** Gets notification, manages approved store

### **Data Isolation:**
- Each store owner sees only their data
- No cross-contamination between owners
- Admin has oversight of all data
- Strict permission enforcement at database level

---

## **🚨 Key Security Principles**

1. **Principle of Least Privilege:**
   - Users get minimal permissions needed for their role
   - No unnecessary access granted

2. **Data Segregation:**
   - Store owners isolated from each other
   - Admin oversight without compromising owner privacy

3. **Role-Based Authorization:**
   - Actions restricted based on user role
   - Multiple layers of permission checks

4. **Audit Trail:**
   - All store requests tracked with owner identification
   - Admin actions logged and attributable

---

## **✅ Testing Role Separation**

### **As Store Owner:**
1. Login to `/owner/dashboard`
2. Try to access `/admin` → Should be blocked
3. View "My Stores" → See only own stores
4. Request store → Can submit, cannot approve

### **As Admin:**
1. Login to `/admin/auth`
2. Access admin dashboard → Full access
3. View store requests → See ALL requests
4. Approve requests → Creates actual stores

---

**🎯 Result:** Complete role separation with no unauthorized access between store owners and proper admin control! 🔒**
