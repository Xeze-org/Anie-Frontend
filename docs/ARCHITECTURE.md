# Architecture Overview

This document explains the architecture of the Anie AI application, which follows a modern hybrid approach combining functional React components with OOP services.

## Table of Contents

- [Architecture Pattern](#architecture-pattern)
- [Layer Breakdown](#layer-breakdown)
- [Data Flow](#data-flow)
- [Design Principles](#design-principles)

## Architecture Pattern

We use a **Hybrid Architecture** that combines:
- **Functional Programming** for UI components (React hooks)
- **Object-Oriented Programming** for services and data access

```mermaid
graph TB
    subgraph "UI Layer (Functional)"
        A[React Components]
        B[Custom Hooks]
    end
    
    subgraph "Business Logic Layer (OOP)"
        C[Services]
        D[Managers]
    end
    
    subgraph "Data Access Layer (OOP)"
        E[Repositories]
        F[IndexedDB/LocalStorage]
    end
    
    subgraph "External Services"
        G[Gemini AI API]
        H[Backend API]
    end
    
    A --> B
    B --> C
    B --> D
    C --> E
    D --> F
    C --> G
    C --> H
    E --> F
    
    style A fill:#22d3ee,stroke:#0891b2,stroke-width:2px,color:#042f2e
    style B fill:#22d3ee,stroke:#0891b2,stroke-width:2px,color:#042f2e
    style C fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#1f1300
    style D fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#1f1300
    style E fill:#ef4444,stroke:#991b1b,stroke-width:2px,color:#ffffff
    style F fill:#94a3b8,stroke:#475569,stroke-width:2px,color:#0f172a
    style G fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#eff6ff
    style H fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#eff6ff
    linkStyle default stroke:#cbd5e1,stroke-width:2px
```

## Layer Breakdown

### 1. UI Layer (Functional)

**Components**: React functional components with hooks
- `Chat.tsx` - Main chat interface
- `Settings.tsx` - Settings page
- `AnalyzerHome.tsx` - Job analyzer home
- `AgreementPage.tsx` - Agreement analysis
- `Resume.tsx` - Resume analysis

**Why Functional?**
- Modern React best practices
- Hooks provide clean state management
- Better performance with React optimizations
- Less boilerplate code

### 2. Custom Hooks Layer (Functional)

Hooks bridge the gap between UI and services:

```mermaid
graph LR
    A[useMessages] --> B[MessageRepository]
    C[useSettings] --> D[SettingsManager]
    E[useGemini] --> F[GeminiService]
    G[useJobAnalyzer] --> H[JobAnalyzerService]
    
    style A fill:#22d3ee,stroke:#0891b2,stroke-width:2px,color:#042f2e
    style C fill:#22d3ee,stroke:#0891b2,stroke-width:2px,color:#042f2e
    style E fill:#22d3ee,stroke:#0891b2,stroke-width:2px,color:#042f2e
    style G fill:#22d3ee,stroke:#0891b2,stroke-width:2px,color:#042f2e
    style B fill:#ef4444,stroke:#991b1b,stroke-width:2px,color:#ffffff
    style D fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#1f1300
    style F fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#1f1300
    style H fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#1f1300
    linkStyle default stroke:#cbd5e1,stroke-width:2px
```

**Available Hooks**:
- `useMessages()` - Chat message operations
- `useSettings()` - App settings management
- `useGemini()` - AI interactions
- `useJobAnalyzer()` - Document analysis
- `useJobAnalyzerSettings()` - Analyzer settings
- `useAnalysisHistory()` - History management

### 3. Services Layer (OOP)

Services encapsulate business logic and external API interactions:

```mermaid
classDiagram
    class ApiService {
        -baseUrl: string
        +get(endpoint): Promise
        +post(endpoint, data): Promise
    }
    
    class GeminiService {
        -apiKey: string
        -model: string
        -systemInstructions: string
        +sendMessage(history): Promise~string~
        +testConnection(): Promise~boolean~
    }
    
    class JobAnalyzerService {
        +checkHealth(): Promise~boolean~
        +analyzeDocument(request): Promise
        +analyzeResume(request): Promise
        +fileToBase64(file): Promise~string~
    }
    
    class SettingsManager {
        -instance: SettingsManager
        +getInstance(): SettingsManager
        +getSettings(): AppSettings
        +saveSettings(settings): void
    }
    
    ApiService <|-- JobAnalyzerService
    ApiService <|-- ChatApiService
```

**Why OOP for Services?**
- Encapsulation of API logic
- Reusable across components
- Easy to mock for testing
- State management (API keys, config)
- Inheritance for shared functionality

### 4. Repository Layer (OOP)

Repositories handle data persistence:

```mermaid
classDiagram
    class MessageRepository {
        +getAll(): Promise~ChatMessage[]~
        +add(message): Promise~void~
        +clear(): Promise~void~
        +search(query): Promise~ChatMessage[]~
    }
    
    class AnalysisHistoryRepository {
        -db: IDBDatabase
        +saveAgreementAnalysis(): Promise~number~
        +getAgreementHistory(): Promise~AgreementHistoryItem[]~
        +saveResumeAnalysis(): Promise~number~
        +getResumeHistory(): Promise~ResumeHistoryItem[]~
    }
```

**Why OOP for Repositories?**
- Abstraction over storage mechanisms
- Consistent interface for data operations
- Easy to swap storage implementations
- Centralized error handling

## Data Flow

### Chat Message Flow

```mermaid
sequenceDiagram
    participant User
    participant Chat Component
    participant useMessages Hook
    participant MessageRepository
    participant IndexedDB
    participant GeminiService
    participant Gemini API
    
    User->>Chat Component: Type message
    Chat Component->>useMessages Hook: addMessage()
    useMessages Hook->>MessageRepository: add(message)
    MessageRepository->>IndexedDB: Store message
    
    Chat Component->>GeminiService: sendMessage(history)
    GeminiService->>Gemini API: POST request
    Gemini API-->>GeminiService: AI response
    GeminiService-->>Chat Component: Response text
    
    Chat Component->>useMessages Hook: addMessage(response)
    useMessages Hook->>MessageRepository: add(response)
    MessageRepository->>IndexedDB: Store response
    IndexedDB-->>Chat Component: Update UI
```

### Settings Management Flow

```mermaid
sequenceDiagram
    participant User
    participant Settings Component
    participant useSettings Hook
    participant SettingsManager
    participant LocalStorage
    
    User->>Settings Component: Open settings
    Settings Component->>useSettings Hook: Get current settings
    useSettings Hook->>SettingsManager: getSettings()
    SettingsManager->>LocalStorage: Read settings
    LocalStorage-->>SettingsManager: Settings data
    SettingsManager-->>Settings Component: Display settings
    
    User->>Settings Component: Update API key
    Settings Component->>useSettings Hook: saveSettings()
    useSettings Hook->>SettingsManager: saveSettings(newSettings)
    SettingsManager->>LocalStorage: Write settings
    LocalStorage-->>Settings Component: Confirm saved
```

### Document Analysis Flow

```mermaid
sequenceDiagram
    participant User
    participant Agreement Component
    participant useJobAnalyzer Hook
    participant JobAnalyzerService
    participant Backend API
    participant useAnalysisHistory Hook
    participant AnalysisHistoryRepository
    participant IndexedDB
    
    User->>Agreement Component: Upload document
    Agreement Component->>useJobAnalyzer Hook: fileToBase64(file)
    useJobAnalyzer Hook->>JobAnalyzerService: fileToBase64()
    JobAnalyzerService-->>Agreement Component: Base64 string
    
    Agreement Component->>useJobAnalyzer Hook: analyzeDocument()
    useJobAnalyzer Hook->>JobAnalyzerService: analyzeDocument(request)
    JobAnalyzerService->>Backend API: POST /api/analyze
    Backend API-->>JobAnalyzerService: Analysis result
    JobAnalyzerService-->>Agreement Component: Display result
    
    Agreement Component->>useAnalysisHistory Hook: saveAgreementAnalysis()
    useAnalysisHistory Hook->>AnalysisHistoryRepository: saveAgreementAnalysis()
    AnalysisHistoryRepository->>IndexedDB: Store analysis
    IndexedDB-->>Agreement Component: Confirm saved
```

## Design Principles

### 1. Separation of Concerns

Each layer has a specific responsibility:
- **UI**: Rendering and user interactions
- **Hooks**: State management and side effects
- **Services**: Business logic and API calls
- **Repositories**: Data persistence

### 2. Single Responsibility

Each class/function does one thing well:
- `GeminiService` only handles Gemini AI interactions
- `MessageRepository` only handles message storage
- `SettingsManager` only manages settings

### 3. Dependency Injection

Services are created in hooks and passed to components:

```typescript
// Hook creates the service
const service = useMemo(() => new GeminiService(apiKey, model), [apiKey, model]);

// Component uses the hook
const { sendMessage } = useGemini(apiKey, model);
```

### 4. Singleton Pattern

Managers use singleton pattern for shared state:

```typescript
const manager = SettingsManager.getInstance();
```

### 5. Repository Pattern

Data access is abstracted behind repositories:

```typescript
// Component doesn't know about IndexedDB
const { messages, addMessage } = useMessages();

// Repository handles the details
class MessageRepository {
  async add(message: ChatMessage) {
    await db.messages.add(message);
  }
}
```

## Benefits of This Architecture

✅ **Maintainability**: Changes to business logic don't affect UI
✅ **Testability**: Easy to mock services and repositories
✅ **Reusability**: Services can be used across multiple components
✅ **Scalability**: Easy to add new features without breaking existing code
✅ **Type Safety**: Full TypeScript support throughout
✅ **Performance**: React optimizations work naturally with functional components
✅ **Developer Experience**: Clear structure makes onboarding easier

## Next Steps

- [Services Documentation](./SERVICES.md)
- [Repositories Documentation](./REPOSITORIES.md)
- [Hooks Documentation](./HOOKS.md)
- [Component Guidelines](./COMPONENTS.md)
