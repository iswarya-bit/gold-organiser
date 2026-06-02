# Database Design

## Overview

The Personal Gold Loan Organizer helps users manage gold loan information, jewel details, reminders, and security-sensitive records.

The system consists of four main entities:

1. User
2. Loan
3. Jewel
4. Reminder

---

# Entity Relationship Diagram

User
│
├── Loan
│      ├── Jewel
│      └── Reminder

Relationships:

* One User can have many Loans.
* One Loan can have many Jewels.
* One Loan can have many Reminders.

---

# User Entity

Stores account information for application users.

Fields:

* id (Primary Key)
* name
* email
* password

Notes:

* Passwords are never stored in plain text.
* Passwords are stored using BCrypt hashing.
* Email must be unique.

---

# Loan Entity

Stores gold loan information.

Fields:

* id (Primary Key)
* user_id (Foreign Key → User.id)
* bank_name
* branch_name
* loan_amount
* interest_rate
* pledge_date
* due_date
* renewal_date
* created_at
* updated_at

Notes:

* Each loan belongs to exactly one user.
* A user can have multiple loans.
* Total loan amount is stored only once in the loan record.

---

# Jewel Entity

Stores details about jewels pledged for a specific loan.

Fields:

* id (Primary Key)
* loan_id (Foreign Key → Loan.id)
* jewel_name
* jewel_weight
* jewel_image_path

Examples:

* Gold Chain
* Gold Ring
* Gold Bracelet

Notes:

* One loan can contain multiple jewels.
* Jewel images are stored in file storage.
* Only the file path is stored in the database.

Example:

uploads/jewels/chain.jpg

---

# Reminder Entity

Stores reminders related to a loan.

Fields:

* id (Primary Key)
* loan_id (Foreign Key → Loan.id)
* reminder_type
* reminder_date
* status

Reminder Types:

* Interest Due Reminder
* Due Date Reminder
* Renewal Reminder
* Auction Warning Reminder

Status Values:

* Pending
* Sent
* Completed

Notes:

* One loan can have multiple reminders.

---

# Security Design

User Authentication:

* Registration
* Login
* JWT Authentication

Password Storage:

* BCrypt Hashing

Sensitive Data Protection:

* Password Re-entry or OTP Verification before viewing sensitive information.

---

# OCR Workflow

User uploads:

* Loan Receipt
* Pawn Ticket
* Sanction Letter

Flow:

Upload Document
↓
OCR Extraction
↓
AI Data Extraction
↓
Pre-filled Form
↓
User Verification
↓
Save Loan

Important:

OCR results are never saved automatically.

The user must review and confirm extracted information before saving.

---

# File Storage Strategy

Files:

* Jewel Images
* Loan Documents

Storage:

* Local Storage (Development)
* Cloud Storage (Future)

Database stores:

* File Name
* File Path

Database does not store actual image or PDF content.

---

# Cascade Delete Rule

If a Loan is deleted:

* Associated Jewels are deleted.
* Associated Reminders are deleted.

Reason:

Jewels and reminders exist only in the context of a loan.
