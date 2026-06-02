Backend Development Roadmap
---------------------------

Step 1:

Create Spring Boot Project

Dependencies:

Spring Web
Spring Data JPA
MySQL Driver
Spring Security
Lombok
Validation
JWT


Step 2:

Configure MySQL

application.properties


Step 3:

Create Packages

controller
service
repository
entity
dto
security
config
exception


Step 4:

Create Entities

User
Loan
Jewel
Reminder


Step 5:

Create Database Relationships

User 1 → Many Loans

Loan 1 → Many Jewels

Loan 1 → Many Reminders


Step 6:

Build Authentication

Register
Login
JWT
Protected Routes


Step 7:

Build Loan Creation

Create Loan
Save Jewels
Generate Reminders


Step 8:

Build OCR Module

Upload PDF
Extract Text
Return Structured Data