# 📡 Altruist AI API Documentation

All API endpoints enforce a standardized JSON response envelope shape:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

On validation or execution error:
```json
{
  "success": false,
  "data": null,
  "error": "Detailed error message"
}
```

---

## 1. Health Status Check
- **Method**: `GET`
- **Path**: `/api/health`
- **Authentication**: None
- **Request Payload**: None
- **Response Data**:
  ```json
  {
    "status": "ok",
    "app": "Altruist AI",
    "timestamp": "2026-07-25T14:00:00.000Z",
    "groqConfigured": true,
    "supabaseConfigured": true,
    "model": "llama-3.1-8b-instant"
  }
  ```

---

## 2. Supabase Auth Registration
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Request Schema (Zod)**:
  ```json
  {
    "email": "user@domain.com",
    "password": "minimum_6_chars"
  }
  ```
- **Response Data**: `{ "user": { "id": "uuid", "email": "..." }, "session": { ... } }`

---

## 3. Supabase Auth Login
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Request Schema (Zod)**:
  ```json
  {
    "email": "user@domain.com",
    "password": "password"
  }
  ```
- **Response Data**: `{ "user": { "id": "uuid", "email": "..." }, "session": { ... } }`

---

## 4. Evaluator Demo Login
- **Method**: `POST`
- **Path**: `/api/auth/demo-login`
- **Authentication**: None
- **Request Payload**: `{}`
- **Response Data**: Real Supabase Auth user session for `demo@altruist.ai`.

---

## 5. Voice Onboarding Profile Save
- **Method**: `POST`
- **Path**: `/api/onboarding`
- **Request Schema (Zod)**:
  ```json
  {
    "userId": "string (required)",
    "email": "string (optional)",
    "triggers": "string (optional)",
    "copingStrategies": "string (optional)",
    "personaTone": "string (optional)",
    "emergencyContact": "string (optional)"
  }
  ```
- **Response Data**: `{ "profile": { "user_id": "...", "triggers": "..." } }`

---

## 6. Crisis Mode Grounding Support
- **Method**: `POST`
- **Path**: `/api/crisis`
- **Groq Model**: `llama-3.1-8b-instant` *(sub-500ms emergency crisis response latency)*
- **Request Schema (Zod)**:
  ```json
  {
    "userId": "string (required)",
    "text": "string (optional voice/text transcript)",
    "type": "string (optional)"
  }
  ```
- **Response Data**:
  ```json
  {
    "mode": "crisis",
    "response": "• Recovery script bullet 1\n• Recovery script bullet 2\n\nSafety Anchor: Network reminder",
    "eventId": "uuid",
    "timestamp": "2026-07-25T14:00:00.000Z"
  }
  ```

---

## 7. Daily Recovery Pulse Check
- **Method**: `POST`
- **Path**: `/api/pulse`
- **Request Schema (Zod)**:
  ```json
  {
    "userId": "string (required)",
    "score": "integer 1 to 5 (required)",
    "voiceNote": "string (optional)"
  }
  ```
- **Response Data**: `{ "pulse": { "id": "...", "score": 4 } }`

---

## 8. Caregiver Invite Code Generation
- **Method**: `POST`
- **Path**: `/api/caregiver/invite`
- **Request Schema (Zod)**:
  ```json
  {
    "userId": "string (required)"
  }
  ```
- **Response Data**: `{ "invite": { "invite_code": "ABC123" } }`

---

## 9. Caregiver AI Coaching Tip
- **Method**: `POST`
- **Path**: `/api/caregiver-tip`
- **Groq Model**: `llama-3.3-70b-versatile` *(clinical reasoning across patient history trends)*
- **Request Schema (Zod)**:
  ```json
  {
    "userId": "string (required)",
    "query": "string (optional)"
  }
  ```
- **Response Data**: `{ "guidance": "De-escalation tip text..." }`

---

## 10. Caregiver Patient Trends Query
- **Method**: `GET`
- **Path**: `/api/caregiver/patient-trends?userId=<uuid>`
- **Query Params**: `userId` (required string)
- **Response Data**: `{ "profile": { ... }, "crisisCount": 2, "recentCrises": [ ... ], "pulseChecks": [ ... ] }`

---

## 11. Recovery Knowledge Hub Educational Q&A
- **Method**: `POST`
- **Path**: `/api/learn/query`
- **Groq Model**: `llama-3.3-70b-versatile` *(SAMHSA framework synthesis)*
- **Request Schema (Zod)**:
  ```json
  {
    "query": "string (optional)"
  }
  ```
- **Response Data**: `{ "content": "Educational guide answer..." }`
