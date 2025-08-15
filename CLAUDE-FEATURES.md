# CLAUDE-FEATURES.md

Funzionalità avanzate e sistemi intelligenti del PilotPro Control Center.

**← Torna a [CLAUDE.md](./CLAUDE.md) | Vedi anche: [Architecture](./CLAUDE-ARCHITECTURE.md) | [Development](./CLAUDE-DEVELOPMENT.md) | [Testing](./CLAUDE-TESTING.md) | [Roadmap](./CLAUDE-ROADMAP.md)**

---

## 🔄 Sistema Smart Cache Avanzato

### 1. Backend - Rilevamento Intelligente Cambiamenti
```typescript
// Confronto contenuto workflow per determinare aggiornamenti reali
private async saveWorkflowToDatabase(workflow: NormalizedWorkflow): Promise<boolean> {
  const existingResult = await this.db.query(`
    SELECT raw_data, updated_at FROM tenant_workflows 
    WHERE id = $1 AND tenant_id = $2
  `, [workflow.id, workflow.tenantId]);
  
  const newRawData = JSON.stringify(workflow.rawData);
  const isNewWorkflow = existingResult.rows.length === 0;
  
  let hasChanged = isNewWorkflow;
  if (!isNewWorkflow) {
    const existingRawData = JSON.stringify(existingResult.rows[0].raw_data);
    const existingUpdatedAt = new Date(existingResult.rows[0].updated_at);
    const newUpdatedAt = workflow.updatedAt ? new Date(workflow.updatedAt) : new Date();
    
    hasChanged = existingRawData !== newRawData || newUpdatedAt > existingUpdatedAt;
  }
  
  if (!hasChanged) {
    console.log(`📄 Workflow ${workflow.id} unchanged, skipping update`);
    return false;
  }
  // ... update logic
  return true;
}
```

### 2. Frontend - Cache Aggressiva per Modal Workflow
```typescript
const { data: detailData, isLoading, error, refetch } = useQuery({
  queryKey: ['workflow-details', tenantId, workflow.id],
  queryFn: async () => {
    console.log(`🔄 Fetching fresh workflow details for ${workflow.id}`)
    const response = await api.get(`/api/tenant/${tenantId}/workflows/${workflow.id}/details`)
    return response.data
  },
  refetchInterval: 15000, // Refresh ogni 15 secondi per dati modal critici
  refetchOnMount: true,   // Sempre refresh quando modal si apre
  refetchOnWindowFocus: true, // Refresh quando utente torna alla finestra
  staleTime: 0, // Dati immediatamente considerati stale per massima freschezza
})
```

### 3. API Force Refresh Workflow
```typescript
// Nuovo endpoint per forzare sync specifico workflow
router.post('/refresh-workflow', async (req, res) => {
  try {
    const { tenantId, workflowId } = req.body;
    
    // Forza sync immediato resettando timestamp
    await db.query(`
      UPDATE tenant_workflows 
      SET last_synced_at = '2000-01-01'
      WHERE id = $1 AND tenant_id = $2
    `, [workflowId, tenantId]);
    
    // Triggera sync per questo tenant
    const result = await scheduler.syncSingleTenant({ id: tenantId });
    
    res.json({
      success: true,
      workflow: { id: workflowId, tenantId: tenantId, synced: result.workflowsSynced > 0 },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh workflow' });
  }
});
```

### 4. Flusso Dati con Smart Cache
```
Modal Aperto → React Query fetch immediato (staleTime: 0)
            → Backend verifica se workflow è changed
            → Se unchanged: skip update, return cached
            → Se changed: update DB + return fresh data
            → Frontend auto-refresh ogni 15 secondi
            → Utente clicca Refresh → Force API call + backend sync
```

## 🤖 Analisi Workflow AI Avanzata

### Rilevamento Componenti AI
```typescript
// Identifica AI Agents con dettagli modello e temperatura
if (nodeType.includes('.agent') || nodeName.toLowerCase().includes('agent')) {
  const agentInfo = {
    name: nodeName,
    type: nodeType.split('.').pop() || nodeType,
    model: nodeParameters.model || nodeParameters.modelId || 'unknown',
    temperature: nodeParameters.temperature,
    systemPrompt: nodeParameters.systemPrompt ? 'Configured' : 'Default',
    connectedTools: [] // Popolato analizzando connections
  };
  nodeAnalysis.aiAgents.push(agentInfo);
}

// Identifica AI Tools - INCLUSI VECTOR STORES E RAG
else if (nodeType.includes('toolWorkflow') || 
         (nodeType.includes('tool') && nodeType.includes('langchain')) ||
         nodeType.includes('vectorStore') ||
         nodeType.includes('embedding') ||
         nodeType.includes('retriever')) {
  nodeAnalysis.tools.push({
    name: nodeName,
    type: nodeType.split('.').pop() || nodeType,
    description: nodeParameters.description || nodeParameters.toolDescription || nodeName
  });
}
```

### Estrazione Sticky Notes per Documentazione
```typescript
// Cattura sticky notes come documentazione workflow
if (nodeType === 'n8n-nodes-base.stickyNote') {
  nodeAnalysis.stickyNotes.push({
    content: nodeParameters.content || '',
    height: nodeParameters.height,
    width: nodeParameters.width,
    color: nodeParameters.color
  });
}
```

### Descrizione Automatica Workflow
```typescript
// Genera descrizione automatica basata su componenti
if (!nodeAnalysis.description && (nodeAnalysis.triggers.length > 0 || nodeAnalysis.aiAgents.length > 0)) {
  let autoDescription = 'This workflow ';
  
  if (nodeAnalysis.triggers.length > 0) {
    const triggerTypes = [...new Set(nodeAnalysis.triggers.map((t: any) => t.triggerType))];
    autoDescription += `starts from ${triggerTypes.join(' or ')} triggers`;
  }
  
  if (nodeAnalysis.aiAgents.length > 0) {
    autoDescription += nodeAnalysis.triggers.length > 0 ? ', uses ' : 'uses ';
    autoDescription += `${nodeAnalysis.aiAgents.length} AI agent${nodeAnalysis.aiAgents.length > 1 ? 's' : ''}`;
    if (nodeAnalysis.tools.length > 0) {
      autoDescription += ` with ${nodeAnalysis.tools.length} tool${nodeAnalysis.tools.length > 1 ? 's' : ''}`;
    }
  }
  
  if (nodeAnalysis.outputs.length > 0) {
    const outputTypes = [...new Set(nodeAnalysis.outputs.map((o: any) => o.outputType))];
    autoDescription += `, and sends responses via ${outputTypes.join(', ')}`;
  }
  
  autoDescription += '.';
  nodeAnalysis.description = autoDescription;
}
```

### Workflow Analysis Features ✅
- **AI Agent Detection**: Rileva automaticamente agenti AI LangChain nei workflow
- **Tools Mapping**: Identifica e mappa tools collegati agli agents
- **Sub-Workflow Detection**: Identifica workflow chiamati come sub-processi
- **Sticky Notes Extraction**: Estrae documentazione da sticky notes n8n
- **Auto-Description**: Genera descrizioni automatiche basate su componenti workflow

## 🤖 AI Agent Transparency System ✅

### Funzionalità Complete Implementate

#### 1. Backend API (`src/api/ai-agents-controller.ts`)
```typescript
// Lista workflow con AI agents detection
GET /api/tenant/:tenantId/agents/workflows

// Timeline execution step-by-step con show-N ordering
GET /api/tenant/:tenantId/agents/workflow/:workflowId/timeline

// Force refresh workflow da n8n API + circuit breaker reset
POST /api/tenant/:tenantId/agents/workflow/:workflowId/refresh
```

#### 2. Frontend Modal (`frontend/src/components/agents/AgentDetailModal.tsx`)
- **Workflow Cards**: Dashboard con workflow che contengono AI agents
- **Timeline Modal**: Step-by-step execution con 3 tabs (Timeline, Business Context, Raw Data)
- **Show-N Ordering**: Nodi ordinati per annotazioni show-1, show-2, ..., show-7
- **Smart Parser**: Priorità contenuto email (subject, sender, body) vs dati tecnici
- **Trigger Logic**: Input = "In attesa di nuove email", Output = email ricevuta
- **Force Refresh**: Button per sync immediato da n8n API

#### 3. Funzioni Avanzate
- **Circuit Breaker Recovery**: Reset automatico dopo errori API n8n
- **Smart Cache**: React Query con 60s refresh + force refresh capability
- **Real-time Data**: Solo dati reali da PostgreSQL, zero mock data
- **Email Content Focus**: Parser mostra contenuto email invece di metadata
- **No Emoji Policy**: Solo Lucide React icons, nessuna icona pittografica

### Architettura AI Agent Timeline

```
Workflow Cards → Click → AgentDetailModal
                             ↓
                       Timeline Tab
                             ↓
                   Show-N Ordered Steps
                   (show-1, show-2, ...)
                             ↓
                    Expandable Steps
                             ↓
                  Input/Output Parsed
                  (Email content focus)
```

## 🎯 Principi di Design

### Frontend
- **Control Room Theme**: Background nero, accenti verdi fosforescenti
- **Data-First**: Tutti i componenti mostrano dati reali, zero mock
- **Responsive**: Mobile-first ma ottimizzato per dashboard desktop
- **Performance**: Lazy loading, code splitting, memo components
- **NO EMOJI**: Mai usare icone pittografiche, solo Lucide React icons

### Backend
- **Multi-Tenant First**: Ogni query filtra per tenant_id
- **Stateless**: JWT per autenticazione, no sessioni server
- **Resilient**: Retry logic, error handling, graceful degradation
- **Scalable**: Connection pooling, query optimization, caching ready

### Security
- **Zero Trust**: Verifica JWT su ogni richiesta
- **Tenant Isolation**: Impossibile accedere a dati di altri tenant
- **Rate Limiting**: Protezione da abusi
- **Audit Trail**: Logging completo di tutte le operazioni

## 🏭 TIER 2: Production Stability Features

### ✅ Componenti Implementati e Testati:

#### **🔍 Production Monitor**
- ✅ Health monitoring avanzato (memory, CPU, DB, scheduler)
- ✅ Metriche real-time sistema, performance e business  
- ✅ Dashboard aggregato multi-component
- ✅ Rilevamento degraded/unhealthy states

#### **🏊‍♂️ Production Pool**
- ✅ Connection pooling ottimizzato con health monitoring
- ✅ Retry logic con exponential backoff
- ✅ Performance tracking (query time, slow queries, utilization)
- ✅ Pool refresh operations e configuration management

#### **🚨 Alert System**
- ✅ Sistema alerting enterprise con escalation rules
- ✅ Multi-channel notifications e deduplicazione
- ✅ Rate limiting (50 alerts/hour) e statistics tracking
- ✅ Alert acknowledgment e resolution workflow

#### **💾 Backup Manager**
- ✅ Sistema backup automatico full/incremental
- ✅ Retention policies e scheduled backups
- ✅ Backup job tracking e statistics
- ✅ Health monitoring sistema backup (pending pg_dump setup)

#### **🛑 Graceful Shutdown**
- ✅ Shutdown orchestrato con priorità component
- ✅ Timeout management e state persistence  
- ✅ Signal handling (SIGTERM, SIGINT, SIGUSR2)
- ✅ Test simulation capabilities

## Advanced Caching Strategy

### React Query Configuration
```typescript
// Global defaults per maximum performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,     // 30 secondi per dati standard
      cacheTime: 300000,    // 5 minuti in cache
      refetchOnWindowFocus: true,
      refetchOnMount: false,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  }
})

// Configurazioni specifiche per tipo dato
const dashboardQuery = useQuery({
  queryKey: ['dashboard', tenantId],
  queryFn: () => api.getDashboard(tenantId),
  refetchInterval: 15000, // 15s per dashboard critico
  staleTime: 10000       // 10s stale time per freshness
})

const workflowsQuery = useQuery({
  queryKey: ['workflows', tenantId],
  queryFn: () => api.getWorkflows(tenantId),
  refetchInterval: 30000, // 30s per liste workflow
  staleTime: 20000       // 20s stale time
})
```

### Smart Invalidation
```typescript
// Invalidazione intelligente dopo modifiche
const mutation = useMutation({
  mutationFn: updateWorkflow,
  onSuccess: (data, variables) => {
    // Invalida cache specifica
    queryClient.invalidateQueries(['workflow-details', variables.id])
    
    // Aggiorna cache workflows list
    queryClient.setQueryData(['workflows', tenantId], (old) => 
      old?.map(w => w.id === variables.id ? { ...w, ...data } : w)
    )
    
    // Background refetch per consistenza
    queryClient.refetchQueries(['dashboard', tenantId])
  }
})
```

## Real-time Features

### WebSocket Integration (Future)
```typescript
// Preparazione per real-time updates
class WebSocketManager {
  private ws: WebSocket
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  
  connect(tenantId: string) {
    this.ws = new WebSocket(`ws://localhost:3001/ws/${tenantId}`)
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.handleRealtimeUpdate(data)
    }
    
    this.ws.onclose = () => this.handleReconnect()
  }
  
  private handleRealtimeUpdate(data: any) {
    switch(data.type) {
      case 'EXECUTION_COMPLETE':
        queryClient.invalidateQueries(['executions'])
        break
      case 'WORKFLOW_UPDATED':
        queryClient.invalidateQueries(['workflows'])
        break
      case 'ALERT_TRIGGERED':
        queryClient.invalidateQueries(['alerts'])
        break
    }
  }
}
```

### Polling Intelligente
```typescript
// Polling che si adatta al focus della finestra
const useSmartPolling = (queryKey: string[], interval: number) => {
  const [isWindowFocused, setIsWindowFocused] = useState(true)
  
  useEffect(() => {
    const handleFocus = () => setIsWindowFocused(true)
    const handleBlur = () => setIsWindowFocused(false)
    
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])
  
  return useQuery({
    queryKey,
    refetchInterval: isWindowFocused ? interval : interval * 4, // Slower quando non in focus
    refetchOnWindowFocus: true
  })
}
```

---

**← Torna a [CLAUDE.md](./CLAUDE.md) | Continua con: [Testing](./CLAUDE-TESTING.md) →**