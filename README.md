# Student Interface - Professional README

## Overview

This document provides a clear and professional description of the **Student Interface Module**, including its authentication features such as Login, Registration, and Password Reset.

## Features

### Instructor Account Creation (Similar to Student)

Instructors can create their accounts using a similar verification workflow. Required fields:

* **Name**
* **Email Address**
* **Phone Number**
* **Password**

**OTP Verification Process:**

1. Instructor enters their account details.
2. System sends an **OTP to the provided email address**.
3. Instructor submits the OTP for verification.
4. On successful verification → instructor account is created.
5. If OTP is invalid → error message is displayed and new OTP can be requested.

---

### 0. Account Creation (with Email OTP Verification)

Users can create a new account by providing the following information:

* **Name**
* **Email Address**
* **Phone Number**
* **Password**

**OTP Verification Process:**

1. User enters their details in the account creation form.
2. System sends an **OTP to the provided email address**.
3. User enters the OTP in the verification screen.
4. If OTP is valid → the account is successfully created.
5. If OTP is invalid → user is notified and allowed to request a new OTP.

---

### 1. Login

The login functionality allows existing users to securely access the system using:

* **Email Address**
* **Password**

**Workflow:**

1. User enters their registered email and password.
2. Credentials are validated.
3. On success → redirected to the dashboard.
4. On failure → user receives an error message.

---

### 2. User Registration

New users can create an account using the registration form, which includes the following fields:

* **First Name**
* **Last Name**
* **Phone Number**
* **Email Address**
* **Password**
* Option to **Sign Up using Third‑Party Authentication** (e.g., Google, Facebook)

**Workflow:**

1. User fills in the registration form.
2. System validates email format, phone number, and password strength.
3. User details are securely stored in the database.
4. A confirmation email may be sent depending on configuration.

---

### 3. Password Reset

Users can recover their account using a secure password reset process.

**Functionality:**

* User enters their **registered email address**.
* A **password‑reset link** is sent to the email.
* User opens the link and sets a new password.

**Workflow:**

1. User requests password reset.
2. System generates a secure token.
3. Email sent with token‑based reset link.
4. User sets a new password and regains access.

---

## Technology Recommendations (optional)

Depending on the tech stack, the following components may be used:

* **Frontend:** React.js, Next.js, or plain HTML/CSS
* **Backend:** Node.js with Express.js
* **Database:** MongoDB
* **Auth:** JWT, OAuth (for third‑party login), bcrypt for password hashing

---

## Security Practices

To ensure secure authentication:

* Use **hashed passwords** (bcrypt recommended)
* Implement **JWT-based sessions** or secure cookies
* Rate‑limit login attempts
* Use HTTPS for all requests
* Validate all input on both frontend and backend

---

## User Schema

A structured user schema ensures consistency across the system. Below is the recommended schema for users in the platform:

### User Schema Fields

1. **First Name** – string
2. **Last Name** – string
3. **Email** – unique string
4. **Password** – hashed string
5. **Confirm Password** – virtual field (not stored in DB)
6. **Account Type** – enum toggle: `student` / `instructor`
7. **Additional Details** – reference to **Profile** schema
8. **Courses** – array of course reference objects
9. **User Profile Picture** – string (URL or file path)
10. **Course Progress** – array of references tracking per‑course progress

---

## Profile Schema

Defines additional user details stored separately and referenced from the User schema.

### Profile Fields

1. Gender – string
2. Date of Birth – date
3. About – string
4. Phone Number – string

---

## Course Progress Schema

Tracks a user’s progress within each course.

### Course Progress Fields

1. Course ID – reference to Course
2. Completed Videos – array of video IDs
3. Sub-section References – track user progress at sub-section level

---

## Sub-section Schema

Represents a lesson or learning unit.

### Sub-section Fields

1. Title – string
2. Time Duration – number
3. Description – string
4. Video – string (URL/path)

---

## Course Schema

Main schema representing a full course.

### Course Fields

1. Name – string
2. Description – string
3. Instructor – user reference
4. What You Will Learn – string/array
5. Course Content – array of Section references
6. Rating & Review – array of rating/review references
7. Price – number
8. Thumbnail – string
9. Tags – array of tag references
10. Student Enroll – array of user references

---

## Section Schema

Breaks courses into structured learning sections.

### Section Fields

1. Name of Section – string
2. Sub-sections – array of Sub-section references

---

## Rating & Review Schema

Stores student feedback.

### Fields

1. User Reference – reference to User
2. Rating – number (1–5)
3. Review – string

---

## Tag Schema

Categorizes courses.

### Fields

1. Name – string
2. Description – string
3. Course – array of course references

---

## Conclusion

This README provides a structured overview of the Student Interface's core authentication modules. It can be included in documentation, GitHub repositories, or project onboarding materials.

Here is a clear, structured **ER Diagram (Entity Relationship Diagram)** in text format based on all schemas you provided.
If you want a **visual diagram (image or PDF)**, I can generate that too—just tell me.

---

# **📌 ER Diagram (Text-Based)**

```
+------------------+
|      USER        |
+------------------+
| _id (PK)         |
| firstName        |
| lastName         |
| email            |
| password         |
| accountType      |
| profile (FK) ----+-------------------------------+
| courses[] (FK) --+--------+                      |
| profilePicture   |        |                      |
| courseProgress[] (FK)     |                      |
+------------------+        |                      |
                            |                      |
                            |                      |
                    +-------------------+          |
                    |      PROFILE      |          |
                    +-------------------+          |
                    | _id (PK)          |          |
                    | gender            |          |
                    | dateOfBirth       |          |
                    | about             |          |
                    | phoneNumber       |
                    +-------------------+

+-----------------------------------------------------------+
|                       COURSE                              |
+-----------------------------------------------------------+
| _id (PK)                                                  |
| name                                                      |
| description                                               |
| instructor (FK → User) -----------------------------------+
| whatYouWillLearn                                          |
| courseContent[] (FK → Section)                            |
| ratingAndReview[] (FK → RatingReview)                     |
| price                                                     |
| thumbnail                                                 |
| tags[] (FK → Tag)                                         |
| studentEnroll[] (FK → User)                               |
+-----------------------------------------------------------+

+----------------------+
|       SECTION        |
+----------------------+
| _id (PK)             |
| nameOfSection        |
| subSections[] (FK → SubSection) 
+----------------------+

+-----------------------+
|      SUBSECTION       |
+-----------------------+
| _id (PK)              |
| title                 |
| timeDuration          |
| description           |
| video                 |
+-----------------------+

+-----------------------------+
|     COURSE PROGRESS         |
+-----------------------------+
| _id (PK)                    |
| courseId (FK → Course)      |
| completedVideos[]           |
| subSectionRefs[] (FK → SubSection)
+-----------------------------+

+------------------------------+
|     RATING & REVIEW          |
+------------------------------+
| _id (PK)                     |
| user (FK → User)             |
| rating                       |
| review                       |
+------------------------------+

+------------------------------+
|            TAG               |
+------------------------------+
| _id (PK)                     |
| name                         |
| description                  |
| courses[] (FK → Course)      |
+------------------------------+
```

---

# **📌 Relationship Summary**

### **User ↔ Profile**

* **1:1** → One user has one profile.

### **User ↔ Course (Instructor)**

* **1 Instructor → Many Courses**
* Stored as `instructor` field in Course.

### **User ↔ Course (Enrollment)**

* **Many-to-Many**
* Stored as `studentEnroll[]` in Course.

### **Course ↔ Section**

* **1 Course → Many Sections**

### **Section ↔ Sub-section**

* **1 Section → Many Sub-sections**

### **User ↔ Course Progress**

* **1 User → Many Course Progress Entries**
* **1 Course Progress → 1 Course**

### **Course ↔ Rating & Review**

* **1 Course → Many Reviews**

### **User ↔ Rating & Review**

* **1 User → Many Reviews**

### **Course ↔ Tags**

* **Many-to-Many**
* Courses have multiple tags, and tags can belong to multiple courses.

<!-- otp verification -->

1. email
2. create time validation
3. otp