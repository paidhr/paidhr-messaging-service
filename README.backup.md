# paidhr-messaging-service

# 🧪 Backend Engineering Assessment – Messenger App (NestJS + MongoDB + BullMQ)

This assessment evaluates your **system design**, **database modeling**, and **backend engineering** skills — particularly using **NestJS** and **BullMQ**.

---

## 🔧 Setup Instructions

1. Clone the provided GitHub repository.
2. Work on the `dev` branch (do **not** touch `main`).
3. **Record your screen with Loom** (from start to finish).
4. Submit by creating a **pull request from `dev` to `main`** and include the Loom video link.

**⏱ Time Limit: 2 Hours**

---

## 📌 Task Overview

You're building part of a Messenger App used by an organization. This backend system must support real-time and asynchronous communication (using BullMQ for message queues).

Your work includes:

1. **Designing a database model**
2. **Setting up a NestJS-based backend**
3. **Integrating BullMQ for asynchronous message handling**
4. **Writing up your thought process**
5. **Proposing architecture for future improvements**

---

## ✅ Task 1: Database Model (ERD)

Use a diagramming tool like:

- DrawSQL: [https://drawsql.app](https://drawsql.app)
- dbdiagram.io: [https://dbdiagram.io](https://dbdiagram.io)
- Whimsical / Draw\.io also acceptable.

### **Requirements**

Your implementation must support:

- **Private Conversations** between 2 users
- **Group Chats** with join/leave/kick support (no access to old messages before join)
- **Public Channels** (any user can read; only members can write)
- **Delivery Status** (e.g., SENT, DELIVERED, FAILED)
- **Read Status** (timestamps per user per message)
- **Multimedia / File Sharing**

### 📄 Output:

- Save and upload the ERD as `database-model.png` or `database-model.jpg`.

> ⏰ Suggested time: 60 minutes

---

## ✅ Task 2: Backend System Using NestJS + BullMQ

You’ll implement the **backend API and message queue** system using NestJS and BullMQ.

### 💡 Required Features

1. **Send Message**

   - `POST /messages`
   - Publishes message to BullMQ queue

2. **Mark Message as Read**

   - `POST /messages/:id/read`
   - Update message read status

3. **Fetch Conversation Messages**

   - `GET /messages`
   - Supports search by conversation

4. **Queue Processing**

   - Use **BullMQ** (with Redis) to:

     - Handle message delivery
     - Simulate delays/network conditions
     - Update delivery/read statuses

5. **Basic File Upload Endpoint**

   - For media messages (optional but bonus)

## ✅ Task 3: Thought Process – `notes.md`

In `notes.md`, explain:

- Your reasoning for your entity relationships\*
- Your assumptions
- Trade-offs in your design
- How BullMQ was used
- Weaknesses and mitigations

> ⏰ Suggested time: 30 minutes

---

## ✅ Task 4: Proposal – `proposal.md`

In `proposal.md`, propose how the system could be extended to improve:

| Driver           | Proposal Example                  |
| ---------------- | --------------------------------- |
| **Security**     | JWT Auth, RBAC, Input validation  |
| **Availability** | Redis cluster, horizontal scaling |
| **Reliability**  | Retry queues, Dead-letter queues  |

> ⏰ Suggested time: 30 minutes

---

## 🔚 Submission Instructions

1. Upload your diagram.
2. Ensure your NestJS backend code is committed.
3. Include `notes.md` and `proposal.md`.
4. Open a **pull request** from `dev` → `main`.
5. Add your **Loom video link** in the PR description.
6. Do **not merge** the PR.

# SOLUTION

## ER Diagram

Here is the Entity Relationship Diagram
![ERD](https://github.com/paidhr/paidhr-messaging-service/blob/dev/database-model.png)

[Link To ERD](https://drawsql.app/teams/codedadis/diagrams/paidhr)

https://www.awesomescreenshot.com/video/40486057?key=5c3d541cdb48ec3fcedd75cd5a85f46e
