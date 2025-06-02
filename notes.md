# Development Notes - Messenger App Backend

## Entity Relationship Reasoning

### 1. **Flexible Conversation Model**

**Decision**: Use a single `conversations` table with a `type` field instead of separate tables for private chats, groups, and channels.

**Reasoning**:

- Reduces code duplication across similar operations
- Easier to implement features that work across all conversation types
- Simpler query patterns and API design
- MongoDB's document structure naturally supports this polymorphic approach

**Trade-off**: Some type-specific optimizations are harder to implement, but the flexibility outweighs this concern.

### 2. **Separate Message Status and Read Receipts**

**Decision**: Split delivery status and read receipts into separate concerns.

**Reasoning**:

- **Performance**: Read receipts are queried more frequently and need different indexing strategies
- **Scalability**: In large group chats, read receipts can grow exponentially while delivery status remains constant
- **Privacy**: Some users might want to disable read receipts but still need delivery confirmation

### 3. **Conversation Membership Tracking**

**Decision**: Dedicated `conversation_members` collection with temporal tracking.

**Reasoning**:

- **Access Control**: Track when users joined to prevent access to historical messages
- **Role Management**: Support different permission levels (admin, moderator, member)
- **Audit Trail**: Historical membership data for compliance and debugging

## Key Assumptions

1. **Message History Access**: Users can only see messages sent after they joined a conversation
2. **File Storage**: Files are stored externally (cloud storage) with URLs referenced in messages
3. **Real-time Updates**: WebSocket integration will be added later for live updates
4. **User Authentication**: JWT-based auth system exists but not implemented in this assessment
5. **Message Size**: Content field supports reasonable message sizes (MongoDB 16MB document limit)

## Design Trade-offs

### ✅ **Chosen Approach Benefits**

- **MongoDB Flexibility**: Document structure handles varying message types well
- **BullMQ Reliability**: Redis-backed queues provide persistent job processing
- **Separation of Concerns**: Clear boundaries between immediate API response and async processing
- **Horizontal Scaling**: Stateless design supports multiple instance deployment

### ⚠️ **Trade-offs Made**

- **Eventually Consistent**: Message status updates are asynchronous
- **Storage Overhead**: Separate status tracking increases storage requirements
- **Query Complexity**: Some operations require multiple collection queries
- **Memory Usage**: BullMQ jobs consume Redis memory

## BullMQ Integration Strategy

### **Why BullMQ?**

1. **Reliability**: Redis persistence ensures jobs survive server restarts
2. **Retry Logic**: Built-in exponential backoff for failed deliveries
3. **Monitoring**: Built-in dashboard for queue health monitoring
4. **Scalability**: Multiple workers can process jobs concurrently

### **Implementation Details**

```typescript
// Job Processing Flow
1. API receives message → immediate response
2. Message queued → BullMQ job created
3. Background processor → updates delivery status
4. Retry mechanism → handles failures gracefully
```

### **Queue Design Decisions**

- **Delay**: Small random delays simulate real network conditions
- **Priority**: System messages get higher priority than user messages
- **Concurrency**: Limited concurrent jobs prevent MongoDB overload
- **Dead Letter Queue**: Failed messages move to manual intervention queue

## Identified Weaknesses & Mitigations

### 🚨 **Current Weaknesses**

1. **No Authentication/Authorization**

   - **Risk**: API endpoints are completely open
   - **Mitigation**: Implement JWT middleware + role-based access control

2. **File Upload Security**

   - **Risk**: Unlimited file uploads, no virus scanning
   - **Mitigation**: File size limits, type validation, external virus scanning

3. **Rate Limiting Missing**

   - **Risk**: Spam attacks, DoS vulnerability
   - **Mitigation**: Implement Redis-based rate limiting per user/IP

4. **Database Indexing Incomplete**

   - **Risk**: Poor query performance at scale
   - **Mitigation**: Add compound indexes based on query patterns

5. **No Input Sanitization**
   - **Risk**: XSS attacks through message content
   - **Mitigation**: Content sanitization and CSP headers

### 🛡️ **Planned Mitigations**

```typescript
// Example: Rate limiting middleware
@UseGuards(RateLimitGuard)
@Post()
async sendMessage(@Body() dto: SendMessageDto) {
  // Implementation
}

// Example: Input sanitization
@Transform(({ value }) => sanitizeHtml(value))
@IsString()
content: string;
```

## Performance Considerations

### **Database Optimization**

- **Read-heavy workload**: Implement read replicas for message fetching
- **Hot data**: Cache recent messages in Redis
- **Archive strategy**: Move old messages to cold storage

### **Queue Optimization**

- **Batch processing**: Group similar operations for efficiency
- **Circuit breaker**: Prevent cascade failures
- **Monitoring**: Alert on queue depth and processing times

## Production Readiness Gaps

1. **Logging**: Structured logging with correlation IDs
2. **Metrics**: Prometheus metrics for monitoring
3. **Health Checks**: Kubernetes-ready health endpoints
4. **Configuration**: Environment-based config management
5. **Testing**: Unit tests, integration tests, load tests
6. **Documentation**: OpenAPI/Swagger documentation

## Alternative Approaches Considered

### **Database Alternatives**

- **PostgreSQL + JSONB**: Better ACID guarantees but less flexible schema
- **Cassandra**: Better for massive scale but higher operational complexity
- **Redis Streams**: Real-time focus but limited querying capabilities

### **Queue Alternatives**

- **AWS SQS**: Managed service but vendor lock-in
- **Apache Kafka**: Better for event streaming but overkill for this use case
- **Database-based queues**: Simpler setup but less reliable

## Conclusion

This implementation prioritizes **developer experience** and **rapid iteration** while maintaining a clear path to production scaling. The architecture supports the core requirements while remaining flexible for future enhancements.

---
