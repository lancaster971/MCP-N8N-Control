# 🔬 Analisi Profonda API N8N - TUTTI I CAMPI

Data: 2025-08-12T12:21:01.986Z

## Statistiche

- **Campi totali trovati:** 3722
- **Categorie:** workflows, executions, tags, users

## Dettaglio Campi per Categoria

### workflows

| Path | Type | Examples | Occurrences |
|------|------|----------|-------------|
| workflows.list | object | 15 | 72 |
| workflows.list.createdAt | string | 2025-06-20T13:50:12.556Z, 2025-06-13T19:13:11.999Z | 72 |
| workflows.list.updatedAt | string | 2025-06-28T14:35:35.000Z, 2025-06-13T21:41:59.000Z | 72 |
| workflows.list.id | string | 053vrF50XdC1ciOA, 0BHv8Kqy4TxBfoud | 72 |
| workflows.list.name | string | RETURN VALIDATION & INTAKE, My workflow 4 | 72 |
| workflows.list.active | boolean | true, false | 72 |
| workflows.list.isArchived | boolean | false, true | 72 |
| workflows.list.nodes | array | 32, 8 | 72 |
| workflows.list.nodes[].parameters | object | 1, 2 | 191 |
| workflows.list.nodes[].parameters.jsCode | string | // Mappa i dati del form
const motivoMap = {
  'prodotto_errato': 'GOMMEGO',
  'ordine_sbagliato': ', // n8n node: Code (JavaScript)

const results = [];

for (const item of items) {
  const data = item | 13 |
| workflows.list.nodes[].parameters.values | object | 1 | 3 |
| workflows.list.nodes[].parameters.values.string | array | 2, 1 | 3 |
| workflows.list.nodes[].parameters.values.string[].name | string | rma, Tipo Reso | 5 |
| workflows.list.nodes[].parameters.values.string[].value | string | RMA-2024-{{ Math.floor(Math.random() * 10000) }}, RESO CON ADDEBITO FORNITORE | 5 |
| workflows.list.nodes[].parameters.options | object | 0, 1 | 104 |
| workflows.list.nodes[].id | string | 38eac349-913b-4304-91f6-77e2762aa33e, ae8650ec-95c3-4161-a288-924c07aeb748 | 191 |
| workflows.list.nodes[].name | string | Prepara Dati, Genera RMA | 191 |
| workflows.list.nodes[].type | string | n8n-nodes-base.code, n8n-nodes-base.set | 191 |
| workflows.list.nodes[].typeVersion | number | 1, 3.4 | 191 |
| workflows.list.nodes[].position | array | 2 | 191 |
| workflows.list.nodes[].webhookId | string | 2c77a0da-6beb-48b1-acc8-bc20b702449e, 519b8f23-e21c-430e-a1ee-45e8570596f8 | 80 |
| workflows.list.nodes[].credentials | object | 1, 0 | 139 |
| workflows.list.nodes[].credentials.googleDriveOAuth2Api | object | 2 | 6 |
| workflows.list.nodes[].credentials.googleDriveOAuth2Api.id | string | WBhAeqmWykJUM02S | 6 |
| workflows.list.nodes[].credentials.googleDriveOAuth2Api.name | string | Google Drive account | 6 |
| workflows.list.nodes[].credentials.openAiApi | object | 2 | 55 |
| workflows.list.nodes[].credentials.openAiApi.id | string | PWlkktuNL3ZIywBy | 54 |
| workflows.list.nodes[].credentials.openAiApi.name | string | OpenAi account, YOUR_OPENAI_CREDENTIAL_ID | 55 |
| workflows.list.nodes[].credentials.googlePalmApi | object | 2 | 2 |
| workflows.list.nodes[].credentials.googlePalmApi.id | string | owVOESxC0E1TNLDF | 2 |
| workflows.list.nodes[].credentials.googlePalmApi.name | string | Google Gemini(PaLM) GommeGo | 2 |
| workflows.list.nodes[].alwaysOutputData | boolean | true, false | 36 |
| workflows.list.nodes[].notes | string | Valida il file caricato: controlla formato, dimensione e prepara per upload. Converte da base64 a bi, 🔹 Agente AI per diagnosi embedding | 73 |
| workflows.list.nodes[].notesInFlow | boolean | true | 9 |
| workflows.list.connections | object | 24, 6 | 72 |
| workflows.list.connections.Genera RMA | object | 1 | 1 |
| workflows.list.connections.Genera RMA.main | array | 1 | 1 |
| workflows.list.connections.Prepara Email | object | 1 | 1 |
| workflows.list.connections.Prepara Email.main | array | 1 | 1 |
| workflows.list.connections.On form submission | object | 1 | 3 |
| workflows.list.connections.On form submission.main | array | 1 | 3 |
| workflows.list.connections.On form submission.main[].0 | object | 3 | 3 |
| workflows.list.connections.On form submission.main[].0.node | string | Mappa Dati, Leggi Email Non Lette | 3 |
| workflows.list.connections.On form submission.main[].0.type | string | main | 3 |
| workflows.list.connections.On form submission.main[].0.index | number | 0 | 3 |
| workflows.list.connections.On form submission.main[].1 | object | 3 | 1 |
| workflows.list.connections.On form submission.main[].1.node | string | Estrai Testo | 1 |
| workflows.list.connections.On form submission.main[].1.type | string | main | 1 |
| workflows.list.connections.On form submission.main[].1.index | number | 0 | 1 |
| workflows.list.connections.On form submission.main[].2 | object | 3 | 1 |
| workflows.list.connections.On form submission.main[].2.node | string | Carica immagini Merce | 1 |
| workflows.list.connections.On form submission.main[].2.type | string | main | 1 |
| workflows.list.connections.On form submission.main[].2.index | number | 0 | 1 |
| workflows.list.connections.Prepara Dati | object | 1 | 1 |
| workflows.list.connections.Prepara Dati.main | array | 1 | 1 |
| workflows.list.connections.Genera RMA1 | object | 1 | 1 |
| workflows.list.connections.Genera RMA1.main | array | 1 | 1 |
| workflows.list.connections.Convert to File1 | object | 1 | 1 |
| workflows.list.connections.Convert to File1.main | array | 1 | 1 |
| workflows.list.connections.Estrai Testo | object | 1 | 2 |
| workflows.list.connections.Estrai Testo.main | array | 1 | 2 |
| workflows.list.connections.Estrai Testo.main[].0 | object | 3 | 2 |
| workflows.list.connections.Estrai Testo.main[].0.node | string | Formatta Dati | 2 |
| workflows.list.connections.Estrai Testo.main[].0.type | string | main | 2 |
| workflows.list.connections.Estrai Testo.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Validazione File | object | 1 | 2 |
| workflows.list.connections.Validazione File.main | array | 1 | 2 |
| workflows.list.connections.Mappa Dati | object | 1 | 1 |
| workflows.list.connections.Mappa Dati.main | array | 1 | 1 |
| workflows.list.connections.Mappa Dati.main[].0 | object | 3 | 1 |
| workflows.list.connections.Mappa Dati.main[].0.node | string | Merge | 1 |
| workflows.list.connections.Mappa Dati.main[].0.type | string | main | 1 |
| workflows.list.connections.Mappa Dati.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Formatta Dati | object | 1 | 1 |
| workflows.list.connections.Formatta Dati.main | array | 1 | 1 |
| workflows.list.connections.Formatta Dati.main[].0 | object | 3 | 1 |
| workflows.list.connections.Formatta Dati.main[].0.node | string | Merge | 1 |
| workflows.list.connections.Formatta Dati.main[].0.type | string | main | 1 |
| workflows.list.connections.Formatta Dati.main[].0.index | number | 1 | 1 |
| workflows.list.connections.Merge | object | 1 | 17 |
| workflows.list.connections.Merge.main | array | 1 | 17 |
| workflows.list.connections.Merge.main[].0 | object | 3 | 16 |
| workflows.list.connections.Merge.main[].0.node | string | Merge1, Aggregate Report | 16 |
| workflows.list.connections.Merge.main[].0.type | string | main | 16 |
| workflows.list.connections.Merge.main[].0.index | number | 0 | 16 |
| workflows.list.connections.Merge.main[].1 | object | 3 | 2 |
| workflows.list.connections.Merge.main[].1.node | string | MAPPA NUMERO ORDINE, Merge1 | 2 |
| workflows.list.connections.Merge.main[].1.type | string | main | 2 |
| workflows.list.connections.Merge.main[].1.index | number | 0, 1 | 2 |
| workflows.list.connections.Google Gemini Chat Model | object | 1 | 3 |
| workflows.list.connections.Google Gemini Chat Model.ai_languageModel | array | 1 | 3 |
| workflows.list.connections.Google Gemini Chat Model.ai_languageModel[].0 | object | 3 | 3 |
| workflows.list.connections.Google Gemini Chat Model.ai_languageModel[].0.node | string | VALIDAZIONE E INTAKE, Conversation Analyzer | 3 |
| workflows.list.connections.Google Gemini Chat Model.ai_languageModel[].0.type | string | ai_languageModel | 3 |
| workflows.list.connections.Google Gemini Chat Model.ai_languageModel[].0.index | number | 0 | 3 |
| workflows.list.connections.Call n8n Workflow Tool | object | 1 | 1 |
| workflows.list.connections.Call n8n Workflow Tool.ai_tool | array | 1 | 1 |
| workflows.list.connections.Call n8n Workflow Tool.ai_tool[].0 | object | 3 | 1 |
| workflows.list.connections.Call n8n Workflow Tool.ai_tool[].0.node | string | VALIDAZIONE E INTAKE | 1 |
| workflows.list.connections.Call n8n Workflow Tool.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.list.connections.Call n8n Workflow Tool.ai_tool[].0.index | number | 0 | 1 |
| workflows.list.connections.Supabase | object | 1 | 5 |
| workflows.list.connections.Supabase.ai_tool | array | 1 | 4 |
| workflows.list.connections.Supabase.ai_tool[].0 | object | 3 | 2 |
| workflows.list.connections.Supabase.ai_tool[].0.node | string | VALIDAZIONE E INTAKE, RAG AI Agent | 2 |
| workflows.list.connections.Supabase.ai_tool[].0.type | string | ai_tool | 2 |
| workflows.list.connections.Supabase.ai_tool[].0.index | number | 0 | 2 |
| workflows.list.connections.Carica immagini Merce | object | 1 | 1 |
| workflows.list.connections.Carica immagini Merce.main | array | 1 | 1 |
| workflows.list.connections.Carica immagini Merce.main[].0 | object | 3 | 1 |
| workflows.list.connections.Carica immagini Merce.main[].0.node | string | Mappa nome File | 1 |
| workflows.list.connections.Carica immagini Merce.main[].0.type | string | main | 1 |
| workflows.list.connections.Carica immagini Merce.main[].0.index | number | 0 | 1 |
| workflows.list.connections.If | object | 1 | 9 |
| workflows.list.connections.If.main | array | 2, 1 | 9 |
| workflows.list.connections.If.main[].0 | object | 3 | 16 |
| workflows.list.connections.If.main[].0.node | string | Genera RMA, Genera RMA1 | 16 |
| workflows.list.connections.If.main[].0.type | string | main | 16 |
| workflows.list.connections.If.main[].0.index | number | 0 | 16 |
| workflows.list.connections.Mappa nome File | object | 1 | 1 |
| workflows.list.connections.Mappa nome File.main | array | 1 | 1 |
| workflows.list.connections.Mappa nome File.main[].0 | object | 3 | 1 |
| workflows.list.connections.Mappa nome File.main[].0.node | string | Merge | 1 |
| workflows.list.connections.Mappa nome File.main[].0.type | string | main | 1 |
| workflows.list.connections.Mappa nome File.main[].0.index | number | 2 | 1 |
| workflows.list.connections.MAPPA NUMERO ORDINE | object | 1 | 1 |
| workflows.list.connections.MAPPA NUMERO ORDINE.main | array | 1 | 1 |
| workflows.list.connections.MAPPA NUMERO ORDINE.main[].0 | object | 3 | 1 |
| workflows.list.connections.MAPPA NUMERO ORDINE.main[].0.node | string | Execute Workflow | 1 |
| workflows.list.connections.MAPPA NUMERO ORDINE.main[].0.type | string | main | 1 |
| workflows.list.connections.MAPPA NUMERO ORDINE.main[].0.index | number | 0 | 1 |
| workflows.list.connections.INSERT CAMPI RMA | object | 1 | 1 |
| workflows.list.connections.INSERT CAMPI RMA.main | array | 1 | 1 |
| workflows.list.connections.Execute Workflow | object | 1 | 1 |
| workflows.list.connections.Execute Workflow.main | array | 1 | 1 |
| workflows.list.connections.Execute Workflow.main[].0 | object | 3 | 1 |
| workflows.list.connections.Execute Workflow.main[].0.node | string | Merge1 | 1 |
| workflows.list.connections.Execute Workflow.main[].0.type | string | main | 1 |
| workflows.list.connections.Execute Workflow.main[].0.index | number | 1 | 1 |
| workflows.list.connections.Merge1 | object | 1 | 6 |
| workflows.list.connections.Merge1.main | array | 1 | 6 |
| workflows.list.connections.Merge1.main[].0 | object | 3 | 5 |
| workflows.list.connections.Merge1.main[].0.node | string | numero ordine esiste?, Final response | 5 |
| workflows.list.connections.Merge1.main[].0.type | string | main | 5 |
| workflows.list.connections.Merge1.main[].0.index | number | 0 | 5 |
| workflows.list.connections.numero ordine esiste? | object | 1 | 1 |
| workflows.list.connections.numero ordine esiste?.main | array | 2 | 1 |
| workflows.list.connections.numero ordine esiste?.main[].0 | object | 3 | 2 |
| workflows.list.connections.numero ordine esiste?.main[].0.node | string | Validazione ed RMA, Form | 2 |
| workflows.list.connections.numero ordine esiste?.main[].0.type | string | main | 2 |
| workflows.list.connections.numero ordine esiste?.main[].0.index | number | 0 | 2 |
| workflows.list.connections.If1 | object | 1 | 5 |
| workflows.list.connections.If1.main | array | 2 | 5 |
| workflows.list.connections.If1.main[].0 | object | 3 | 10 |
| workflows.list.connections.If1.main[].0.node | string | UPSERT CAMPI RMA, Form1 | 10 |
| workflows.list.connections.If1.main[].0.type | string | main | 10 |
| workflows.list.connections.If1.main[].0.index | number | 0 | 10 |
| workflows.list.connections.Validazione ed RMA | object | 1 | 1 |
| workflows.list.connections.Validazione ed RMA.main | array | 1 | 1 |
| workflows.list.connections.Validazione ed RMA.main[].0 | object | 3 | 1 |
| workflows.list.connections.Validazione ed RMA.main[].0.node | string | If1 | 1 |
| workflows.list.connections.Validazione ed RMA.main[].0.type | string | main | 1 |
| workflows.list.connections.Validazione ed RMA.main[].0.index | number | 0 | 1 |
| workflows.list.settings | object | 1, 3 | 72 |
| workflows.list.settings.executionOrder | string | v1 | 63 |
| workflows.list.meta | object | 1 | 40 |
| workflows.list.meta.templateCredsSetupCompleted | boolean | true | 40 |
| workflows.list.pinData | object | 1, 0 | 63 |
| workflows.list.pinData.Form1 | array | 1 | 1 |
| workflows.list.pinData.Form1[].json | object | 57 | 1 |
| workflows.list.pinData.Form1[].json.Nome e Cognome cliente | string | Carlo martino | 1 |
| workflows.list.pinData.Form1[].json.Email di conferma ordine | string | supplires@tecsolutions.app | 1 |
| workflows.list.pinData.Form1[].json.Nr Ordine | string | WHQTNRXIZ | 1 |
| workflows.list.pinData.Form1[].json.Data ricezione merce | string | 2025-06-13 | 1 |
| workflows.list.pinData.Form1[].json.Motivo della restituzione  | string | Ho ricevuto merce sbagliata | 1 |
| workflows.list.pinData.Form1[].json.Descrizione del problema  | string | merce completamente sbagliata | 1 |
| workflows.list.pinData.Form1[].json.Foto allegate? | string | false | 1 |
| workflows.list.pinData.Form1[].json.data inoltro richiesta | string | 2025-06-22 | 1 |
| workflows.list.pinData.Form1[].json.testo_estratto | string | 1. 

```
NANKANG 
WINTER ACTIVA
N-607+
215/55 R16
97V XL

E
C
72 dB

C

EU
```

2. | 1 |
| workflows.list.pinData.Form1[].json.descrizione_immagine | string | L'immagine mostra un pacco di quattro pneumatici sovrapposti e avvolti in pellicola trasparente da i | 1 |
| workflows.list.pinData.Form1[].json.Nome Foto Allegata | string | WHQTNRXIZ - Carlo martino - 2025-06-13 | 1 |
| workflows.list.pinData.Form1[].json.orderFound | boolean | true | 1 |
| workflows.list.pinData.Form1[].json.order_reference | string | WHQTNRXIZ | 1 |
| workflows.list.pinData.Form1[].json.order_status | string | Consegnato | 1 |
| workflows.list.pinData.Form1[].json.order_shipping_number | string | 1ZR1J1466800230797 | 1 |
| workflows.list.pinData.Form1[].json.order_payment_method | string | PayPal | 1 |
| workflows.list.pinData.Form1[].json.order_date_created | string | 2025-06-09 12:22:57 | 1 |
| workflows.list.pinData.Form1[].json.order_date_updated | string | 2025-06-20 21:33:22 | 1 |
| workflows.list.pinData.Form1[].json.order_total_paid | string | € 211.00 | 1 |
| workflows.list.pinData.Form1[].json.order_total_products | string | € 161.36 | 1 |
| workflows.list.pinData.Form1[].json.order_total_products_with_tax | string | € 196.84 | 1 |
| workflows.list.pinData.Form1[].json.order_products_0_name | string | NEXEN N BLUE HD PLUS 155/65 R14 75T | 1 |
| workflows.list.pinData.Form1[].json.order_products_0_reference | string | 981110000163006 | 1 |
| workflows.list.pinData.Form1[].json.order_products_0_ean | string | 8807622509902 | 1 |
| workflows.list.pinData.Form1[].json.order_products_0_quantity | number | 4 | 1 |
| workflows.list.pinData.Form1[].json.order_products_0_unit_price | string | € 49.21 | 1 |
| workflows.list.pinData.Form1[].json.order_products_0_total_price | string | € 196.84 | 1 |
| workflows.list.pinData.Form1[].json.customer_full_name | string | Carlo Martino | 1 |
| workflows.list.pinData.Form1[].json.customer_email | string | carlo.martino@martino.it | 1 |
| workflows.list.pinData.Form1[].json.customer_phone | string | 0805618333 | 1 |
| workflows.list.pinData.Form1[].json.customer_is_active | boolean | true | 1 |
| workflows.list.pinData.Form1[].json.customer_customer_since | string | 2019-04-30 18:53:35 | 1 |
| workflows.list.pinData.Form1[].json.delivery_recipient | string | Carlo Martino | 1 |
| workflows.list.pinData.Form1[].json.delivery_street | string | Via Delle Murge 80 | 1 |
| workflows.list.pinData.Form1[].json.delivery_city | string | BARI | 1 |
| workflows.list.pinData.Form1[].json.delivery_postcode | string | 70124 | 1 |
| workflows.list.pinData.Form1[].json.delivery_country | string | Italia | 1 |
| workflows.list.pinData.Form1[].json.delivery_phone | string | 0805618333 | 1 |
| workflows.list.pinData.Form1[].json.shipment_tracking_number | string | 1ZR1J1466800230797 | 1 |
| workflows.list.pinData.Form1[].json.shipment_tracking_url | string | https://www.ups.com/track?loc=it_IT&tracknum=1ZR1J1466800230797&requester=WT/trackdetails | 1 |
| workflows.list.pinData.Form1[].json.shipment_latest_status | string | Consegnato | 1 |
| workflows.list.pinData.Form1[].json.shipment_latest_status_date | string | 2025-06-13T11:04:00+00:00 | 1 |
| workflows.list.pinData.Form1[].json.shipment_departure_date | string | 2025-06-11T13:33:00+00:00 | 1 |
| workflows.list.pinData.Form1[].json.shipment_arrival_date | string | 2025-06-13T11:04:00+00:00 | 1 |
| workflows.list.pinData.Form1[].json.shipment_delivery_history_0 | string | 2025-06-13: Consegnato | 1 |
| workflows.list.pinData.Form1[].json.shipment_delivery_history_1 | string | 2025-06-13: In consegna oggi | 1 |
| workflows.list.pinData.Form1[].json.shipment_delivery_history_2 | string | 2025-06-13: In elaborazione presso la struttura UPS | 1 |
| workflows.list.pinData.Form1[].json.shipment_delivery_history_3 | string | 2025-06-12: Partito dal centro | 1 |
| workflows.list.pinData.Form1[].json.shipment_delivery_history_4 | string | 2025-06-12: Arrivato al centro | 1 |
| workflows.list.pinData.Form1[].json.shipment_delivery_history_5 | string | 2025-06-12: Partito dal centro | 1 |
| workflows.list.pinData.Form1[].json.shipment_delivery_history_6 | string | 2025-06-12: Arrivato al centro | 1 |
| workflows.list.pinData.Form1[].json.shipment_delivery_history_7 | string | 2025-06-11: Il mittente ha creato un'etichetta, UPS non ha ancora ricevuto il pacco | 1 |
| workflows.list.pinData.Form1[].json.Response | string | ✅ Ordine trovato: WHQTNRXIZ | 1 |
| workflows.list.pinData.Form1[].json.shipment_arrival_date_normalizzata | string | 2025-06-13 | 1 |
| workflows.list.pinData.Form1[].json.data_inoltro_richiesta_normalizzata | string | 2025-06-22 | 1 |
| workflows.list.pinData.Form1[].json.reso richiesto entro 14 giorni | boolean | true | 1 |
| workflows.list.pinData.Form1[].json.giorni passati | number | 9 | 1 |
| workflows.list.versionId | string | f696720d-965e-4727-823e-a38652a9db49, b8e147e8-5a04-4079-ac62-b5c2ccd9d0b8 | 72 |
| workflows.list.triggerCount | number | 1, 0 | 72 |
| workflows.list.tags | array | 0, 2 | 72 |
| workflows.list.nodes[].parameters.triggerTimes | object | 1 | 2 |
| workflows.list.nodes[].parameters.triggerTimes.item | array | 1 | 2 |
| workflows.list.nodes[].parameters.triggerTimes.item[].mode | string | custom | 2 |
| workflows.list.nodes[].parameters.triggerTimes.item[].cronExpression | string | 0 8,21 * * * | 2 |
| workflows.list.nodes[].parameters.functionCode | string | // 📊 REPORT AGGREGATOR 
// Con metriche complete e task urgenti

const tasks = $items("TASK").map(i, // Estrae numero e testo
return [{
  json: {
    phone: $json.entry[0].changes[0].value.messages[0]. | 8 |
| workflows.list.nodes[].parameters.operation | string | getAll, move | 19 |
| workflows.list.nodes[].parameters.tableId | string | smart_tasks, errors | 6 |
| workflows.list.nodes[].parameters.filters | object | 1, 0 | 5 |
| workflows.list.nodes[].parameters.filters.conditions | array | 1, 2 | 4 |
| workflows.list.nodes[].parameters.filters.conditions[].keyName | string | created_at, check_order_vs_invoice | 7 |
| workflows.list.nodes[].parameters.filters.conditions[].condition | string | gt, eq | 7 |
| workflows.list.nodes[].parameters.filters.conditions[].keyValue | string | ={{ new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }}, false | 7 |
| workflows.list.nodes[].retryOnFail | boolean | true, false | 44 |
| workflows.list.nodes[].credentials.supabaseApi | object | 2 | 18 |
| workflows.list.nodes[].credentials.supabaseApi.id | string | U18uJwD80Uq036TV, jJWkqm9L91vHyDLJ | 18 |
| workflows.list.nodes[].credentials.supabaseApi.name | string | Supabase tiziano.annicchiarico@gmail.com, Supabase  ERROR_HANDLING | 18 |
| workflows.list.nodes[].credentials.telegramApi | object | 2 | 5 |
| workflows.list.nodes[].credentials.telegramApi.id | string | dbGXwcFAw4mNHLio | 3 |
| workflows.list.nodes[].credentials.telegramApi.name | string | GommeGoBot, YOUR_TELEGRAM_API | 5 |
| workflows.list.nodes[].onError | string | continueRegularOutput | 11 |
| workflows.list.connections.Schedule | object | 1 | 2 |
| workflows.list.connections.Schedule.main | array | 1 | 2 |
| workflows.list.connections.Schedule.main[].0 | object | 3 | 2 |
| workflows.list.connections.Schedule.main[].0.node | string | MAIL | 2 |
| workflows.list.connections.Schedule.main[].0.type | string | main | 2 |
| workflows.list.connections.Schedule.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Schedule.main[].1 | object | 3 | 2 |
| workflows.list.connections.Schedule.main[].1.node | string | TASK | 2 |
| workflows.list.connections.Schedule.main[].1.type | string | main | 2 |
| workflows.list.connections.Schedule.main[].1.index | number | 0 | 2 |
| workflows.list.connections.Aggregate Report | object | 1 | 2 |
| workflows.list.connections.Aggregate Report.main | array | 1 | 2 |
| workflows.list.connections.Aggregate Report.main[].0 | object | 3 | 2 |
| workflows.list.connections.Aggregate Report.main[].0.node | string | Send Report | 2 |
| workflows.list.connections.Aggregate Report.main[].0.type | string | main | 2 |
| workflows.list.connections.Aggregate Report.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Aggregate Report.main[].1 | object | 3 | 2 |
| workflows.list.connections.Aggregate Report.main[].1.node | string | 📱 Telegram Report | 2 |
| workflows.list.connections.Aggregate Report.main[].1.type | string | main | 2 |
| workflows.list.connections.Aggregate Report.main[].1.index | number | 0 | 2 |
| workflows.list.connections.TASK | object | 1 | 2 |
| workflows.list.connections.TASK.main | array | 1 | 2 |
| workflows.list.connections.TASK.main[].0 | object | 3 | 2 |
| workflows.list.connections.TASK.main[].0.node | string | Merge | 2 |
| workflows.list.connections.TASK.main[].0.type | string | main | 2 |
| workflows.list.connections.TASK.main[].0.index | number | 1 | 2 |
| workflows.list.connections.MAIL | object | 1 | 2 |
| workflows.list.connections.MAIL.main | array | 1 | 2 |
| workflows.list.connections.MAIL.main[].0 | object | 3 | 2 |
| workflows.list.connections.MAIL.main[].0.node | string | Merge | 2 |
| workflows.list.connections.MAIL.main[].0.type | string | main | 2 |
| workflows.list.connections.MAIL.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Send Report | object | 1 | 1 |
| workflows.list.connections.Send Report.main | array | 2 | 1 |
| workflows.list.settings.callerPolicy | string | workflowsFromSameOwner | 8 |
| workflows.list.settings.errorWorkflow | string | 1LreJWx0H8iEqkgn, mL8bvBkd0QpaVDxx | 6 |
| workflows.list.nodes[].parameters.assignments | object | 1 | 6 |
| workflows.list.nodes[].parameters.assignments.assignments | array | 13, 5 | 6 |
| workflows.list.nodes[].parameters.assignments.assignments[].id | string | db0cb791-2bee-4cbd-8779-7f86c821273a, 9777ff8e-d790-453e-9c79-96d10f49bceb | 17 |
| workflows.list.nodes[].parameters.assignments.assignments[].name | string | timestamp, =notified | 17 |
| workflows.list.nodes[].parameters.assignments.assignments[].value | string | ={{ $now }}, false | 17 |
| workflows.list.nodes[].parameters.assignments.assignments[].type | string | string | 17 |
| workflows.list.nodes[].parameters.fieldsUi | object | 1 | 3 |
| workflows.list.nodes[].parameters.fieldsUi.fieldValues | array | 11, 13 | 3 |
| workflows.list.nodes[].parameters.fieldsUi.fieldValues[].fieldId | string | workflow_name, workflow_id | 9 |
| workflows.list.nodes[].parameters.fieldsUi.fieldValues[].fieldValue | string | ={{ $json.workflow.name }}, ={{ $json.workflow.id }} | 9 |
| workflows.list.connections.Mappa Campi | object | 1 | 3 |
| workflows.list.connections.Mappa Campi.main | array | 1 | 3 |
| workflows.list.connections.Mappa Campi.main[].0 | object | 3 | 3 |
| workflows.list.connections.Mappa Campi.main[].0.node | string | Scrive In DB , Conversation Analyzer | 3 |
| workflows.list.connections.Mappa Campi.main[].0.type | string | main | 3 |
| workflows.list.connections.Mappa Campi.main[].0.index | number | 0 | 3 |
| workflows.list.connections.Error Trigger | object | 1 | 2 |
| workflows.list.connections.Error Trigger.main | array | 1 | 2 |
| workflows.list.connections.Error Trigger.main[].0 | object | 3 | 2 |
| workflows.list.connections.Error Trigger.main[].0.node | string | Mappa Campi | 2 |
| workflows.list.connections.Error Trigger.main[].0.type | string | main | 2 |
| workflows.list.connections.Error Trigger.main[].0.index | number | 0 | 2 |
| workflows.list.nodes[].parameters.rule | object | 1 | 3 |
| workflows.list.nodes[].parameters.rule.interval | array | 1 | 3 |
| workflows.list.nodes[].parameters.rule.interval[].field | string | minutes, seconds | 3 |
| workflows.list.nodes[].parameters.rule.interval[].minutesInterval | number | 1 | 2 |
| workflows.list.nodes[].parameters.resource | string | folderMessage, fileFolder | 6 |
| workflows.list.nodes[].parameters.folderId | object | 4, 5 | 4 |
| workflows.list.nodes[].parameters.folderId.__rl | boolean | true | 4 |
| workflows.list.nodes[].parameters.folderId.value | string | AAMkADY5YTU5ODIzLTM5M2MtNGU4Zi04YzNmLTBlYmYxNDNhODNjMAAuAAAAAAAty8lTOVoeRrTqgTQml0B1AQAYYLMeDvsGSqoD, AQMkADY5YTU5ODIzLTM5M2MtNGU4Zi04YzNmLTBlYmYxNDNhODNjMAAuAAADLcvJUzlaHka06oE0JpdAdQEAGGCzHg77BkqqA0a8 | 4 |
| workflows.list.nodes[].parameters.folderId.mode | string | list | 4 |
| workflows.list.nodes[].parameters.folderId.cachedResultName | string | FATTURE, Template | 4 |
| workflows.list.nodes[].parameters.limit | number | 1, 2 | 4 |
| workflows.list.nodes[].parameters.output | string | fields | 3 |
| workflows.list.nodes[].parameters.fields | array | 3 | 3 |
| workflows.list.nodes[].parameters.filtersUI | object | 1 | 2 |
| workflows.list.nodes[].parameters.filtersUI.values | object | 1 | 2 |
| workflows.list.nodes[].parameters.filtersUI.values.filters | object | 1, 2 | 2 |
| workflows.list.nodes[].parameters.options.downloadAttachments | boolean | true | 2 |
| workflows.list.nodes[].parameters.messageId | object | 3 | 2 |
| workflows.list.nodes[].parameters.messageId.__rl | boolean | true | 2 |
| workflows.list.nodes[].parameters.messageId.value | string | ={{ $json.id }}, ={{ $('GRAB MAIL FROM ORDINI').first().json.id }}
 | 2 |
| workflows.list.nodes[].parameters.messageId.mode | string | id | 2 |
| workflows.list.nodes[].credentials.microsoftOutlookOAuth2Api | object | 2 | 10 |
| workflows.list.nodes[].credentials.microsoftOutlookOAuth2Api.id | string | gvsjOBgXBwH8vLH8 | 10 |
| workflows.list.nodes[].credentials.microsoftOutlookOAuth2Api.name | string | Outlook Supplies | 10 |
| workflows.list.connections.Schedule Trigger | object | 1 | 10 |
| workflows.list.connections.Schedule Trigger.main | array | 1 | 10 |
| workflows.list.connections.Schedule Trigger.main[].0 | object | 3 | 9 |
| workflows.list.connections.Schedule Trigger.main[].0.node | string | Leggi Email Non Lette, Acquisice Ordini da Prestashop | 9 |
| workflows.list.connections.Schedule Trigger.main[].0.type | string | main | 9 |
| workflows.list.connections.Schedule Trigger.main[].0.index | number | 0 | 9 |
| workflows.list.connections.Leggi Email Non Lette | object | 1 | 1 |
| workflows.list.connections.Leggi Email Non Lette.main | array | 1 | 1 |
| workflows.list.connections.Leggi Email Non Lette.main[].0 | object | 3 | 1 |
| workflows.list.connections.Leggi Email Non Lette.main[].0.node | string | Estrai Testo da PDF | 1 |
| workflows.list.connections.Leggi Email Non Lette.main[].0.type | string | main | 1 |
| workflows.list.connections.Leggi Email Non Lette.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Leggi Email Non Lette.main[].1 | object | 3 | 1 |
| workflows.list.connections.Leggi Email Non Lette.main[].1.node | string | Carica Fattura PDF | 1 |
| workflows.list.connections.Leggi Email Non Lette.main[].1.type | string | main | 1 |
| workflows.list.connections.Leggi Email Non Lette.main[].1.index | number | 0 | 1 |
| workflows.list.connections.Leggi Email Non Lette.main[].2 | object | 3 | 1 |
| workflows.list.connections.Leggi Email Non Lette.main[].2.node | string | Sposta Email in Template | 1 |
| workflows.list.connections.Leggi Email Non Lette.main[].2.type | string | main | 1 |
| workflows.list.connections.Leggi Email Non Lette.main[].2.index | number | 0 | 1 |
| workflows.list.connections.Sposta Email in Template | object | 1 | 1 |
| workflows.list.connections.Sposta Email in Template.main | array | 1 | 1 |
| workflows.list.connections.Estrai Testo da PDF | object | 1 | 1 |
| workflows.list.connections.Estrai Testo da PDF.main | array | 1 | 1 |
| workflows.list.connections.Estrai Testo da PDF.main[].0 | object | 3 | 1 |
| workflows.list.connections.Estrai Testo da PDF.main[].0.node | string | OpenAI Estrazione Dati | 1 |
| workflows.list.connections.Estrai Testo da PDF.main[].0.type | string | main | 1 |
| workflows.list.connections.Estrai Testo da PDF.main[].0.index | number | 0 | 1 |
| workflows.list.connections.OpenAI Estrazione Dati | object | 1 | 1 |
| workflows.list.connections.OpenAI Estrazione Dati.main | array | 1 | 1 |
| workflows.list.connections.OpenAI Estrazione Dati.main[].0 | object | 3 | 1 |
| workflows.list.connections.OpenAI Estrazione Dati.main[].0.node | string | Data Processor & Validator | 1 |
| workflows.list.connections.OpenAI Estrazione Dati.main[].0.type | string | main | 1 |
| workflows.list.connections.OpenAI Estrazione Dati.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Data Processor & Validator | object | 1 | 2 |
| workflows.list.connections.Data Processor & Validator.main | array | 1 | 2 |
| workflows.list.connections.Data Processor & Validator.main[].0 | object | 3 | 2 |
| workflows.list.connections.Data Processor & Validator.main[].0.node | string | Merge, Postgres | 2 |
| workflows.list.connections.Data Processor & Validator.main[].0.type | string | main | 2 |
| workflows.list.connections.Data Processor & Validator.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Carica Fattura PDF | object | 1 | 3 |
| workflows.list.connections.Carica Fattura PDF.main | array | 1 | 3 |
| workflows.list.connections.Carica Fattura PDF.main[].0 | object | 3 | 3 |
| workflows.list.connections.Carica Fattura PDF.main[].0.node | string | Edit Fields | 3 |
| workflows.list.connections.Carica Fattura PDF.main[].0.type | string | main | 3 |
| workflows.list.connections.Carica Fattura PDF.main[].0.index | number | 0 | 3 |
| workflows.list.connections.Se ITA cancella | object | 1 | 3 |
| workflows.list.connections.Se ITA cancella.main | array | 2 | 3 |
| workflows.list.connections.Se ITA cancella.main[].0 | object | 3 | 6 |
| workflows.list.connections.Se ITA cancella.main[].0.node | string | Cancella by ID, Cambia Nome | 6 |
| workflows.list.connections.Se ITA cancella.main[].0.type | string | main | 6 |
| workflows.list.connections.Se ITA cancella.main[].0.index | number | 0 | 6 |
| workflows.list.connections.Edit Fields | object | 1 | 10 |
| workflows.list.connections.Edit Fields.main | array | 1 | 10 |
| workflows.list.connections.Edit Fields.main[].0 | object | 3 | 10 |
| workflows.list.connections.Edit Fields.main[].0.node | string | Merge, Input Email Data1 | 10 |
| workflows.list.connections.Edit Fields.main[].0.type | string | main | 10 |
| workflows.list.connections.Edit Fields.main[].0.index | number | 1, 0 | 10 |
| workflows.list.connections.JSON Flat2 | object | 1 | 3 |
| workflows.list.connections.JSON Flat2.main | array | 1 | 3 |
| workflows.list.connections.JSON Flat2.main[].0 | object | 3 | 3 |
| workflows.list.connections.JSON Flat2.main[].0.node | string | Se ITA cancella | 3 |
| workflows.list.connections.JSON Flat2.main[].0.type | string | main | 3 |
| workflows.list.connections.JSON Flat2.main[].0.index | number | 0 | 3 |
| workflows.list.connections.Cambia Nome | object | 1 | 3 |
| workflows.list.connections.Cambia Nome.main | array | 1 | 3 |
| workflows.list.connections.Cambia Nome.main[].0 | object | 3 | 3 |
| workflows.list.connections.Cambia Nome.main[].0.node | string | Genera Mail  | 3 |
| workflows.list.connections.Cambia Nome.main[].0.type | string | main | 3 |
| workflows.list.connections.Cambia Nome.main[].0.index | number | 0 | 3 |
| workflows.list.nodes[].parameters.url | string | https://www.gommego.com/api/orders?filter[reference]=[XXXXXX]&output_format=JSON, https://parcelsapp.com/api/v3/shipments/tracking | 14 |
| workflows.list.nodes[].parameters.authentication | string | genericCredentialType, headerAuth | 11 |
| workflows.list.nodes[].parameters.genericAuthType | string | httpBasicAuth, httpHeaderAuth | 8 |
| workflows.list.nodes[].parameters.options.customEmailConfig | string | ["UNSEEN"] | 2 |
| workflows.list.nodes[].parameters.html | string | ={{ $json.textHtml }}, ={{ $json.text }} | 3 |
| workflows.list.nodes[].waitBetweenTries | number | 5000 | 12 |
| workflows.list.nodes[].credentials.httpBasicAuth | object | 2 | 16 |
| workflows.list.nodes[].credentials.httpBasicAuth.id | string | CDYbffajBgDWgdXn | 16 |
| workflows.list.nodes[].credentials.httpBasicAuth.name | string | Prestashop-API | 16 |
| workflows.list.nodes[].credentials.imap | object | 2 | 2 |
| workflows.list.nodes[].credentials.imap.id | string | VoojIkqtfMuLmw81 | 2 |
| workflows.list.nodes[].credentials.imap.name | string | IMAP account | 2 |
| workflows.list.nodes[].credentials.smtp | object | 2 | 1 |
| workflows.list.nodes[].credentials.smtp.id | string | ognxP8WoHebaMOsi | 1 |
| workflows.list.nodes[].credentials.smtp.name | string | SMTP INVIO GommeGo | 1 |
| workflows.list.connections.Email Trigger (IMAP) | object | 1 | 2 |
| workflows.list.connections.Email Trigger (IMAP).main | array | 1 | 2 |
| workflows.list.connections.Email Trigger (IMAP).main[].0 | object | 3 | 2 |
| workflows.list.connections.Email Trigger (IMAP).main[].0.node | string | Limit, Email Summarization Chain | 2 |
| workflows.list.connections.Email Trigger (IMAP).main[].0.type | string | main | 2 |
| workflows.list.connections.Email Trigger (IMAP).main[].0.index | number | 0 | 2 |
| workflows.list.connections.Email Classifier | object | 1 | 3 |
| workflows.list.connections.Email Classifier.main | array | 5, 2 | 3 |
| workflows.list.connections.Email Classifier.main[].0 | object | 3 | 8 |
| workflows.list.connections.Email Classifier.main[].0.node | string | Write email, Do nothing | 8 |
| workflows.list.connections.Email Classifier.main[].0.type | string | main | 8 |
| workflows.list.connections.Email Classifier.main[].0.index | number | 0 | 8 |
| workflows.list.connections.Email Classifier.main[].1 | object | 3 | 1 |
| workflows.list.connections.Email Classifier.main[].1.node | string | Write email | 1 |
| workflows.list.connections.Email Classifier.main[].1.type | string | main | 1 |
| workflows.list.connections.Email Classifier.main[].1.index | number | 0 | 1 |
| workflows.list.connections.Email Summarization Chain | object | 1 | 2 |
| workflows.list.connections.Email Summarization Chain.main | array | 1 | 2 |
| workflows.list.connections.Write email | object | 1 | 2 |
| workflows.list.connections.Write email.main | array | 1 | 2 |
| workflows.list.connections.Write email.main[].0 | object | 3 | 2 |
| workflows.list.connections.Write email.main[].0.node | string | Review email | 2 |
| workflows.list.connections.Write email.main[].0.type | string | main | 2 |
| workflows.list.connections.Write email.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Review email | object | 1 | 3 |
| workflows.list.connections.Review email.main | array | 1 | 3 |
| workflows.list.connections.Review email.main[].0 | object | 3 | 3 |
| workflows.list.connections.Review email.main[].0.node | string | Merge, Send Email | 3 |
| workflows.list.connections.Review email.main[].0.type | string | main | 3 |
| workflows.list.connections.Review email.main[].0.index | number | 1, 0 | 3 |
| workflows.list.connections.OpenAI 4-o-mini | object | 1 | 3 |
| workflows.list.connections.OpenAI 4-o-mini.ai_languageModel | array | 1 | 3 |
| workflows.list.connections.OpenAI 4-o-mini.ai_languageModel[].0 | object | 3 | 3 |
| workflows.list.connections.OpenAI 4-o-mini.ai_languageModel[].0.node | string | Email Classifier | 3 |
| workflows.list.connections.OpenAI 4-o-mini.ai_languageModel[].0.type | string | ai_languageModel | 3 |
| workflows.list.connections.OpenAI 4-o-mini.ai_languageModel[].0.index | number | 0 | 3 |
| workflows.list.connections.OpenAI Chat Model2 | object | 1 | 9 |
| workflows.list.connections.OpenAI Chat Model2.ai_languageModel | array | 1 | 9 |
| workflows.list.connections.OpenAI Chat Model2.ai_languageModel[].0 | object | 3 | 9 |
| workflows.list.connections.OpenAI Chat Model2.ai_languageModel[].0.node | string | Email Summarization Chain, Answer questions with a vector store1 | 9 |
| workflows.list.connections.OpenAI Chat Model2.ai_languageModel[].0.type | string | ai_languageModel | 9 |
| workflows.list.connections.OpenAI Chat Model2.ai_languageModel[].0.index | number | 0 | 9 |
| workflows.list.connections.OpenAI Chat Model3 | object | 1 | 6 |
| workflows.list.connections.OpenAI Chat Model3.ai_languageModel | array | 1 | 6 |
| workflows.list.connections.OpenAI Chat Model3.ai_languageModel[].0 | object | 3 | 6 |
| workflows.list.connections.OpenAI Chat Model3.ai_languageModel[].0.node | string | Review email, Commerciale | 6 |
| workflows.list.connections.OpenAI Chat Model3.ai_languageModel[].0.type | string | ai_languageModel | 6 |
| workflows.list.connections.OpenAI Chat Model3.ai_languageModel[].0.index | number | 0 | 6 |
| workflows.list.connections.GET_ID1 | object | 1 | 3 |
| workflows.list.connections.GET_ID1.ai_tool | array | 1 | 3 |
| workflows.list.connections.GET_ID1.ai_tool[].0 | object | 3 | 3 |
| workflows.list.connections.GET_ID1.ai_tool[].0.node | string | Write email, Commerciale | 3 |
| workflows.list.connections.GET_ID1.ai_tool[].0.type | string | ai_tool | 3 |
| workflows.list.connections.GET_ID1.ai_tool[].0.index | number | 0 | 3 |
| workflows.list.connections.OpenAI Chat Model4 | object | 1 | 6 |
| workflows.list.connections.OpenAI Chat Model4.ai_languageModel | array | 1 | 6 |
| workflows.list.connections.OpenAI Chat Model4.ai_languageModel[].0 | object | 3 | 6 |
| workflows.list.connections.OpenAI Chat Model4.ai_languageModel[].0.node | string | Write email, Answer questions with a vector store1 | 6 |
| workflows.list.connections.OpenAI Chat Model4.ai_languageModel[].0.type | string | ai_languageModel | 6 |
| workflows.list.connections.OpenAI Chat Model4.ai_languageModel[].0.index | number | 0 | 6 |
| workflows.list.connections.GET_DETAIL1 | object | 1 | 1 |
| workflows.list.connections.GET_DETAIL1.ai_tool | array | 1 | 1 |
| workflows.list.connections.GET_DETAIL1.ai_tool[].0 | object | 3 | 1 |
| workflows.list.connections.GET_DETAIL1.ai_tool[].0.node | string | Write email | 1 |
| workflows.list.connections.GET_DETAIL1.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.list.connections.GET_DETAIL1.ai_tool[].0.index | number | 0 | 1 |
| workflows.list.connections.GET_CUSTOMER1 | object | 1 | 4 |
| workflows.list.connections.GET_CUSTOMER1.ai_tool | array | 1 | 4 |
| workflows.list.connections.GET_DELIVERY ADDRESS1 | object | 1 | 2 |
| workflows.list.connections.GET_DELIVERY ADDRESS1.ai_tool | array | 1 | 2 |
| workflows.list.connections.Embeddings OpenAI3 | object | 1 | 3 |
| workflows.list.connections.Embeddings OpenAI3.ai_embedding | array | 1 | 3 |
| workflows.list.connections.Embeddings OpenAI3.ai_embedding[].0 | object | 3 | 3 |
| workflows.list.connections.Embeddings OpenAI3.ai_embedding[].0.node | string | Qdrant Vector Store | 3 |
| workflows.list.connections.Embeddings OpenAI3.ai_embedding[].0.type | string | ai_embedding | 3 |
| workflows.list.connections.Embeddings OpenAI3.ai_embedding[].0.index | number | 0 | 3 |
| workflows.list.connections.Limit | object | 1 | 1 |
| workflows.list.connections.Limit.main | array | 1 | 1 |
| workflows.list.connections.Limit.main[].0 | object | 3 | 1 |
| workflows.list.connections.Limit.main[].0.node | string | Formatta mail | 1 |
| workflows.list.connections.Limit.main[].0.type | string | main | 1 |
| workflows.list.connections.Limit.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Markdown | object | 1 | 1 |
| workflows.list.connections.Markdown.main | array | 1 | 1 |
| workflows.list.connections.Qdrant Vector Store | object | 1 | 14 |
| workflows.list.connections.Qdrant Vector Store.ai_tool | array | 1 | 4 |
| workflows.list.connections.Qdrant Vector Store.ai_tool[].0 | object | 3 | 4 |
| workflows.list.connections.Qdrant Vector Store.ai_tool[].0.node | string | Write email, Milena - Assistente GommeGo | 4 |
| workflows.list.connections.Qdrant Vector Store.ai_tool[].0.type | string | ai_tool | 4 |
| workflows.list.connections.Qdrant Vector Store.ai_tool[].0.index | number | 0 | 4 |
| workflows.list.connections.Formatta mail | object | 1 | 1 |
| workflows.list.connections.Formatta mail.main | array | 1 | 1 |
| workflows.list.connections.Formatta mail.main[].0 | object | 3 | 1 |
| workflows.list.connections.Formatta mail.main[].0.node | string | Email Classifier | 1 |
| workflows.list.connections.Formatta mail.main[].0.type | string | main | 1 |
| workflows.list.connections.Formatta mail.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Formatta mail.main[].1 | object | 3 | 1 |
| workflows.list.connections.Formatta mail.main[].1.node | string | Merge | 1 |
| workflows.list.connections.Formatta mail.main[].1.type | string | main | 1 |
| workflows.list.connections.Formatta mail.main[].1.index | number | 0 | 1 |
| workflows.list.connections.Input Email Data1 | object | 1 | 1 |
| workflows.list.connections.Input Email Data1.main | array | 1 | 1 |
| workflows.list.connections.Input Email Data1.main[].0 | object | 3 | 1 |
| workflows.list.connections.Input Email Data1.main[].0.node | string | Download Signature1 | 1 |
| workflows.list.connections.Input Email Data1.main[].0.type | string | main | 1 |
| workflows.list.connections.Input Email Data1.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Download Signature1 | object | 1 | 1 |
| workflows.list.connections.Download Signature1.main | array | 1 | 1 |
| workflows.list.connections.Download Signature1.main[].0 | object | 3 | 1 |
| workflows.list.connections.Download Signature1.main[].0.node | string | Send Email2 | 1 |
| workflows.list.connections.Download Signature1.main[].0.type | string | main | 1 |
| workflows.list.connections.Download Signature1.main[].0.index | number | 0 | 1 |
| workflows.list.tags[].createdAt | string | 2025-05-09T12:54:15.672Z, 2025-05-08T22:21:18.131Z | 61 |
| workflows.list.tags[].updatedAt | string | 2025-05-09T12:54:15.672Z, 2025-05-08T22:21:18.131Z | 61 |
| workflows.list.tags[].id | string | Vh2Oww2GTJVNG58l, jubCCEoeIKClOxYP | 61 |
| workflows.list.tags[].name | string | Vector, GommeGo | 61 |
| workflows.list.nodes[].parameters.model | string | gpt-4o, gpt-4.1-mini | 18 |
| workflows.list.nodes[].parameters.public | boolean | true | 8 |
| workflows.list.nodes[].parameters.promptType | string | define | 10 |
| workflows.list.nodes[].parameters.text | string | ={{ $('When chat message received').item.json.chatInput }}
, ={{ $json.query }}
 | 11 |
| workflows.list.nodes[].parameters.options.systemMessage | string | Agisci come Milena, operatrice dell’assistenza clienti GommeGo.

🎯 Il tuo obiettivo è rassicurare s, ## Identità e comportamento
- Sei Milena, assistente clienti GommeGo per supporto post-vendita
- Usa | 9 |
| workflows.list.nodes[].credentials.pineconeApi | object | 2 | 4 |
| workflows.list.nodes[].credentials.pineconeApi.id | string | PoIjlOLU2iBjw5qV | 4 |
| workflows.list.nodes[].credentials.pineconeApi.name | string | PineconeApi account | 4 |
| workflows.list.connections.OpenAI Chat Model | object | 1, 2 | 16 |
| workflows.list.connections.OpenAI Chat Model.ai_languageModel | array | 1 | 16 |
| workflows.list.connections.OpenAI Chat Model.ai_languageModel[].0 | object | 3 | 16 |
| workflows.list.connections.OpenAI Chat Model.ai_languageModel[].0.node | string | RAG AI Agent, DiagChunk AI Agent | 16 |
| workflows.list.connections.OpenAI Chat Model.ai_languageModel[].0.type | string | ai_languageModel | 16 |
| workflows.list.connections.OpenAI Chat Model.ai_languageModel[].0.index | number | 0 | 16 |
| workflows.list.connections.When chat message received | object | 1 | 11 |
| workflows.list.connections.When chat message received.main | array | 1 | 11 |
| workflows.list.connections.When chat message received.main[].0 | object | 3 | 10 |
| workflows.list.connections.When chat message received.main[].0.node | string | Chat ID persisente, Set Chat Input2 | 10 |
| workflows.list.connections.When chat message received.main[].0.type | string | main | 10 |
| workflows.list.connections.When chat message received.main[].0.index | number | 0 | 10 |
| workflows.list.connections.Simple Memory | object | 1 | 6 |
| workflows.list.connections.Simple Memory.ai_memory | array | 1 | 6 |
| workflows.list.connections.Pinecone Vector Store | object | 1, 2 | 6 |
| workflows.list.connections.Pinecone Vector Store.ai_vectorStore | array | 1 | 5 |
| workflows.list.connections.OpenAI Chat Model1 | object | 1 | 13 |
| workflows.list.connections.OpenAI Chat Model1.ai_languageModel | array | 1 | 13 |
| workflows.list.connections.OpenAI Chat Model1.ai_languageModel[].0 | object | 3 | 13 |
| workflows.list.connections.OpenAI Chat Model1.ai_languageModel[].0.node | string | Answer questions with a vector store, Generate Follow Up Message | 13 |
| workflows.list.connections.OpenAI Chat Model1.ai_languageModel[].0.type | string | ai_languageModel | 13 |
| workflows.list.connections.OpenAI Chat Model1.ai_languageModel[].0.index | number | 0 | 13 |
| workflows.list.connections.Embeddings OpenAI | object | 1 | 10 |
| workflows.list.connections.Embeddings OpenAI.ai_embedding | array | 1 | 10 |
| workflows.list.connections.Embeddings OpenAI.ai_embedding[].0 | object | 3 | 10 |
| workflows.list.connections.Embeddings OpenAI.ai_embedding[].0.node | string | Pinecone Vector Store, Qdrant Vector Store1 | 10 |
| workflows.list.connections.Embeddings OpenAI.ai_embedding[].0.type | string | ai_embedding | 10 |
| workflows.list.connections.Embeddings OpenAI.ai_embedding[].0.index | number | 0 | 10 |
| workflows.list.connections.Answer questions with a vector store | object | 1 | 10 |
| workflows.list.connections.Answer questions with a vector store.ai_tool | array | 1 | 10 |
| workflows.list.connections.Answer questions with a vector store.ai_tool[].0 | object | 3 | 9 |
| workflows.list.connections.Answer questions with a vector store.ai_tool[].0.node | string | RAG AI Agent, DiagChunk | 9 |
| workflows.list.connections.Answer questions with a vector store.ai_tool[].0.type | string | ai_tool | 9 |
| workflows.list.connections.Answer questions with a vector store.ai_tool[].0.index | number | 0 | 9 |
| workflows.list.connections.Embeddings OpenAI1 | object | 1 | 8 |
| workflows.list.connections.Embeddings OpenAI1.ai_embedding | array | 1 | 8 |
| workflows.list.connections.Embeddings OpenAI1.ai_embedding[].0 | object | 3 | 8 |
| workflows.list.connections.Embeddings OpenAI1.ai_embedding[].0.node | string | Supabase Vector Store1, Qdrant Vector Store1 | 8 |
| workflows.list.connections.Embeddings OpenAI1.ai_embedding[].0.type | string | ai_embedding | 8 |
| workflows.list.connections.Embeddings OpenAI1.ai_embedding[].0.index | number | 0 | 8 |
| workflows.list.connections.Supabase Vector Store1 | object | 1 | 4 |
| workflows.list.connections.Supabase Vector Store1.ai_vectorStore | array | 1 | 4 |
| workflows.list.connections.Supabase Vector Store1.ai_vectorStore[].0 | object | 3 | 4 |
| workflows.list.connections.Supabase Vector Store1.ai_vectorStore[].0.node | string | Answer questions with a vector store1 | 4 |
| workflows.list.connections.Supabase Vector Store1.ai_vectorStore[].0.type | string | ai_vectorStore | 4 |
| workflows.list.connections.Supabase Vector Store1.ai_vectorStore[].0.index | number | 0 | 4 |
| workflows.list.connections.Qdrant Vector Store.ai_vectorStore | array | 1 | 10 |
| workflows.list.connections.Qdrant Vector Store.ai_vectorStore[].0 | object | 3 | 10 |
| workflows.list.connections.Qdrant Vector Store.ai_vectorStore[].0.node | string | Answer questions with a vector store, Answer questions with a vector store2 | 10 |
| workflows.list.connections.Qdrant Vector Store.ai_vectorStore[].0.type | string | ai_vectorStore | 10 |
| workflows.list.connections.Qdrant Vector Store.ai_vectorStore[].0.index | number | 0 | 10 |
| workflows.list.connections.Embeddings OpenAI2 | object | 1 | 9 |
| workflows.list.connections.Embeddings OpenAI2.ai_embedding | array | 1 | 9 |
| workflows.list.connections.Embeddings OpenAI2.ai_embedding[].0 | object | 3 | 9 |
| workflows.list.connections.Embeddings OpenAI2.ai_embedding[].0.node | string | Qdrant Vector Store | 9 |
| workflows.list.connections.Embeddings OpenAI2.ai_embedding[].0.type | string | ai_embedding | 9 |
| workflows.list.connections.Embeddings OpenAI2.ai_embedding[].0.index | number | 0 | 9 |
| workflows.list.connections.GET_ID | object | 1 | 5 |
| workflows.list.connections.GET_ID.ai_tool | array | 1 | 5 |
| workflows.list.connections.GET_ID.ai_tool[].0 | object | 3 | 5 |
| workflows.list.connections.GET_ID.ai_tool[].0.node | string | RAG AI Agent | 5 |
| workflows.list.connections.GET_ID.ai_tool[].0.type | string | ai_tool | 5 |
| workflows.list.connections.GET_ID.ai_tool[].0.index | number | 0 | 5 |
| workflows.list.connections.GET_DETAIL | object | 1 | 4 |
| workflows.list.connections.GET_DETAIL.ai_tool | array | 1 | 4 |
| workflows.list.connections.GET_DETAIL.ai_tool[].0 | object | 3 | 4 |
| workflows.list.connections.GET_DETAIL.ai_tool[].0.node | string | RAG AI Agent | 4 |
| workflows.list.connections.GET_DETAIL.ai_tool[].0.type | string | ai_tool | 4 |
| workflows.list.connections.GET_DETAIL.ai_tool[].0.index | number | 0 | 4 |
| workflows.list.connections.Postgres Chat Memory | object | 1 | 7 |
| workflows.list.connections.Postgres Chat Memory.ai_memory | array | 1 | 7 |
| workflows.list.connections.Postgres Chat Memory.ai_memory[].0 | object | 3 | 6 |
| workflows.list.connections.Postgres Chat Memory.ai_memory[].0.node | string | RAG AI Agent, MILENA DISPATCHER | 6 |
| workflows.list.connections.Postgres Chat Memory.ai_memory[].0.type | string | ai_memory | 6 |
| workflows.list.connections.Postgres Chat Memory.ai_memory[].0.index | number | 0 | 6 |
| workflows.list.connections.Chat ID persisente | object | 1 | 6 |
| workflows.list.connections.Chat ID persisente.main | array | 1 | 6 |
| workflows.list.connections.Chat ID persisente.main[].0 | object | 3 | 6 |
| workflows.list.connections.Chat ID persisente.main[].0.node | string | RAG AI Agent, Chat Logger | 6 |
| workflows.list.connections.Chat ID persisente.main[].0.type | string | main | 6 |
| workflows.list.connections.Chat ID persisente.main[].0.index | number | 0 | 6 |
| workflows.list.connections.Loop Over Items | object | 1 | 4 |
| workflows.list.connections.Loop Over Items.main | array | 2 | 4 |
| workflows.list.connections.Loop Over Items.main[].0 | object | 3 | 5 |
| workflows.list.connections.Loop Over Items.main[].0.node | string | Merge JSON + Elaborato, Replace Me | 5 |
| workflows.list.connections.Loop Over Items.main[].0.type | string | main | 5 |
| workflows.list.connections.Loop Over Items.main[].0.index | number | 0 | 5 |
| workflows.list.connections.Loop Over Items.main[].1 | object | 3 | 2 |
| workflows.list.connections.Loop Over Items.main[].1.node | string | Supabase1 | 2 |
| workflows.list.connections.Loop Over Items.main[].1.type | string | main | 2 |
| workflows.list.connections.Loop Over Items.main[].1.index | number | 0 | 2 |
| workflows.list.connections.Replace Me | object | 1 | 3 |
| workflows.list.connections.Replace Me.main | array | 1 | 3 |
| workflows.list.connections.Replace Me.main[].0 | object | 3 | 3 |
| workflows.list.connections.Replace Me.main[].0.node | string | Loop Over Items | 3 |
| workflows.list.connections.Replace Me.main[].0.type | string | main | 3 |
| workflows.list.connections.Replace Me.main[].0.index | number | 0 | 3 |
| workflows.list.connections.Merge JSON + Elaborato | object | 1 | 2 |
| workflows.list.connections.Merge JSON + Elaborato.main | array | 1 | 2 |
| workflows.list.connections.Merge JSON + Elaborato.main[].0 | object | 3 | 2 |
| workflows.list.connections.Merge JSON + Elaborato.main[].0.node | string | Controlla se ordine già elaborato | 2 |
| workflows.list.connections.Merge JSON + Elaborato.main[].0.type | string | main | 2 |
| workflows.list.connections.Merge JSON + Elaborato.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Acquisice Ordini da Prestashop | object | 1 | 2 |
| workflows.list.connections.Acquisice Ordini da Prestashop.main | array | 1 | 2 |
| workflows.list.connections.Acquisice Ordini da Prestashop.main[].0 | object | 3 | 2 |
| workflows.list.connections.Acquisice Ordini da Prestashop.main[].0.node | string | Pulisce JSON | 2 |
| workflows.list.connections.Acquisice Ordini da Prestashop.main[].0.type | string | main | 2 |
| workflows.list.connections.Acquisice Ordini da Prestashop.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Pulisce JSON | object | 1 | 2 |
| workflows.list.connections.Pulisce JSON.main | array | 1 | 2 |
| workflows.list.connections.Pulisce JSON.main[].0 | object | 3 | 2 |
| workflows.list.connections.Pulisce JSON.main[].0.node | string | Loop Over Items | 2 |
| workflows.list.connections.Pulisce JSON.main[].0.type | string | main | 2 |
| workflows.list.connections.Pulisce JSON.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Imposta Valore "Elaborato" | object | 1 | 2 |
| workflows.list.connections.Imposta Valore "Elaborato".main | array | 1 | 2 |
| workflows.list.connections.Imposta Valore "Elaborato".main[].0 | object | 3 | 2 |
| workflows.list.connections.Imposta Valore "Elaborato".main[].0.node | string | Merge JSON + Elaborato | 2 |
| workflows.list.connections.Imposta Valore "Elaborato".main[].0.type | string | main | 2 |
| workflows.list.connections.Imposta Valore "Elaborato".main[].0.index | number | 1 | 2 |
| workflows.list.connections.Controlla se ordine già elaborato | object | 1 | 2 |
| workflows.list.connections.Controlla se ordine già elaborato.main | array | 1 | 2 |
| workflows.list.connections.Controlla se ordine già elaborato.main[].0 | object | 3 | 2 |
| workflows.list.connections.Controlla se ordine già elaborato.main[].0.node | string | Controlla se ordine non elaborato | 2 |
| workflows.list.connections.Controlla se ordine già elaborato.main[].0.type | string | main | 2 |
| workflows.list.connections.Controlla se ordine già elaborato.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Controlla se ordine non elaborato | object | 1 | 2 |
| workflows.list.connections.Controlla se ordine non elaborato.main | array | 2 | 2 |
| workflows.list.connections.Controlla se ordine non elaborato.main[].0 | object | 3 | 4 |
| workflows.list.connections.Controlla se ordine non elaborato.main[].0.node | string | Merge, Replace Me | 4 |
| workflows.list.connections.Controlla se ordine non elaborato.main[].0.type | string | main | 4 |
| workflows.list.connections.Controlla se ordine non elaborato.main[].0.index | number | 0 | 4 |
| workflows.list.connections.Controlla se ordine non elaborato.main[].1 | object | 3 | 2 |
| workflows.list.connections.Controlla se ordine non elaborato.main[].1.node | string | Acquisice Ordini da Prestashop1 | 2 |
| workflows.list.connections.Controlla se ordine non elaborato.main[].1.type | string | main | 2 |
| workflows.list.connections.Controlla se ordine non elaborato.main[].1.index | number | 0 | 2 |
| workflows.list.connections.Acquisice Ordini da Prestashop1 | object | 1 | 2 |
| workflows.list.connections.Acquisice Ordini da Prestashop1.main | array | 1 | 2 |
| workflows.list.connections.Acquisice Ordini da Prestashop1.main[].0 | object | 3 | 2 |
| workflows.list.connections.Acquisice Ordini da Prestashop1.main[].0.node | string | Merge | 2 |
| workflows.list.connections.Acquisice Ordini da Prestashop1.main[].0.type | string | main | 2 |
| workflows.list.connections.Acquisice Ordini da Prestashop1.main[].0.index | number | 1 | 2 |
| workflows.list.connections.Code | object | 1 | 7 |
| workflows.list.connections.Code.main | array | 1 | 7 |
| workflows.list.connections.Code.main[].0 | object | 3 | 7 |
| workflows.list.connections.Code.main[].0.node | string | Supabase, If | 7 |
| workflows.list.connections.Code.main[].0.type | string | main | 7 |
| workflows.list.connections.Code.main[].0.index | number | 0 | 7 |
| workflows.list.connections.Supabase1 | object | 1 | 3 |
| workflows.list.connections.Supabase1.main | array | 1 | 3 |
| workflows.list.connections.Supabase1.main[].0 | object | 3 | 3 |
| workflows.list.connections.Supabase1.main[].0.node | string | Imposta Valore "Elaborato", Merge3 | 3 |
| workflows.list.connections.Supabase1.main[].0.type | string | main | 3 |
| workflows.list.connections.Supabase1.main[].0.index | number | 0, 1 | 3 |
| workflows.list.staticData | object | 1, 2 | 9 |
| workflows.list.staticData.node:Schedule Trigger | object | 1 | 7 |
| workflows.list.staticData.node:Schedule Trigger.recurrenceRules | array | 0 | 7 |
| workflows.list.nodes[].parameters.httpMethod | string | POST | 3 |
| workflows.list.nodes[].parameters.path | string | whatsapp, 137ca002-b213-449c-9d68-e1be141ea04c | 8 |
| workflows.list.connections.Webhook WhatsApp | object | 1 | 1 |
| workflows.list.connections.Webhook WhatsApp.main | array | 1 | 1 |
| workflows.list.connections.Webhook WhatsApp.main[].0 | object | 3 | 1 |
| workflows.list.connections.Webhook WhatsApp.main[].0.node | string | Estrai Payload | 1 |
| workflows.list.connections.Webhook WhatsApp.main[].0.type | string | main | 1 |
| workflows.list.connections.Webhook WhatsApp.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Estrai Payload | object | 1 | 1 |
| workflows.list.connections.Estrai Payload.main | array | 1 | 1 |
| workflows.list.connections.Estrai Payload.main[].0 | object | 3 | 1 |
| workflows.list.connections.Estrai Payload.main[].0.node | string | Recupera Tenant | 1 |
| workflows.list.connections.Estrai Payload.main[].0.type | string | main | 1 |
| workflows.list.connections.Estrai Payload.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Recupera Tenant | object | 1 | 1 |
| workflows.list.connections.Recupera Tenant.main | array | 1 | 1 |
| workflows.list.connections.Recupera Tenant.main[].0 | object | 3 | 1 |
| workflows.list.connections.Recupera Tenant.main[].0.node | string | Verifica Disponibilità | 1 |
| workflows.list.connections.Recupera Tenant.main[].0.type | string | main | 1 |
| workflows.list.connections.Recupera Tenant.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Scrivi Prenotazione | object | 1 | 1 |
| workflows.list.connections.Scrivi Prenotazione.main | array | 1 | 1 |
| workflows.list.connections.Scrivi Prenotazione.main[].0 | object | 3 | 1 |
| workflows.list.connections.Scrivi Prenotazione.main[].0.node | string | Invia Messaggio | 1 |
| workflows.list.connections.Scrivi Prenotazione.main[].0.type | string | main | 1 |
| workflows.list.connections.Scrivi Prenotazione.main[].0.index | number | 0 | 1 |
| workflows.list.nodes[].credentials.qdrantApi | object | 2 | 10 |
| workflows.list.nodes[].credentials.qdrantApi.id | string | VEHIg9nC5Y5VeHPX | 10 |
| workflows.list.nodes[].credentials.qdrantApi.name | string | QdrantApi account | 10 |
| workflows.list.connections.GET_DELIVERY ADDRESS | object | 1 | 4 |
| workflows.list.connections.GET_DELIVERY ADDRESS.ai_tool | array | 1 | 4 |
| workflows.list.connections.GET_DELIVERY ADDRESS.ai_tool[].0 | object | 3 | 4 |
| workflows.list.connections.GET_DELIVERY ADDRESS.ai_tool[].0.node | string | RAG AI Agent, TRACKING | 4 |
| workflows.list.connections.GET_DELIVERY ADDRESS.ai_tool[].0.type | string | ai_tool | 4 |
| workflows.list.connections.GET_DELIVERY ADDRESS.ai_tool[].0.index | number | 0 | 4 |
| workflows.list.connections.RAG AI Agent | object | 1 | 2 |
| workflows.list.connections.RAG AI Agent.main | array | 1 | 2 |
| workflows.list.connections.GET_DETAIL2 | object | 1 | 3 |
| workflows.list.connections.GET_DETAIL2.ai_tool | array | 1 | 3 |
| workflows.list.connections.GET_CUSTOMER1.ai_tool[].0 | object | 3 | 3 |
| workflows.list.connections.GET_CUSTOMER1.ai_tool[].0.node | string | RAG AI Agent, TRACKING | 3 |
| workflows.list.connections.GET_CUSTOMER1.ai_tool[].0.type | string | ai_tool | 3 |
| workflows.list.connections.GET_CUSTOMER1.ai_tool[].0.index | number | 0 | 3 |
| workflows.list.connections.Parcelsapp | object | 1 | 2 |
| workflows.list.connections.Parcelsapp.ai_tool | array | 1 | 2 |
| workflows.list.connections.Wait | object | 1 | 3 |
| workflows.list.connections.Wait.main | array | 1 | 3 |
| workflows.list.connections.ParcelApp | object | 1 | 6 |
| workflows.list.connections.ParcelApp.ai_tool | array | 1 | 6 |
| workflows.list.connections.ParcelApp.ai_tool[].0 | object | 3 | 4 |
| workflows.list.connections.ParcelApp.ai_tool[].0.node | string | RAG AI Agent, MILENA DISPATCHER | 4 |
| workflows.list.connections.ParcelApp.ai_tool[].0.type | string | ai_tool | 4 |
| workflows.list.connections.ParcelApp.ai_tool[].0.index | number | 0 | 4 |
| workflows.list.connections.Text Classifier | object | 1 | 1 |
| workflows.list.connections.Text Classifier.main | array | 3 | 1 |
| workflows.list.connections.Date & Time | object | 1 | 6 |
| workflows.list.connections.Date & Time.ai_tool | array | 1 | 6 |
| workflows.list.connections.Date & Time.ai_tool[].0 | object | 3 | 6 |
| workflows.list.connections.Date & Time.ai_tool[].0.node | string | RAG AI Agent, Milena - Assistente GommeGo | 6 |
| workflows.list.connections.Date & Time.ai_tool[].0.type | string | ai_tool | 6 |
| workflows.list.connections.Date & Time.ai_tool[].0.index | number | 0 | 6 |
| workflows.list.connections.Answer questions with a vector store1 | object | 1 | 3 |
| workflows.list.connections.Answer questions with a vector store1.ai_tool | array | 1 | 3 |
| workflows.list.connections.Answer questions with a vector store1.ai_tool[].0 | object | 3 | 3 |
| workflows.list.connections.Answer questions with a vector store1.ai_tool[].0.node | string | Commerciale, DiagChunk AI Agent | 3 |
| workflows.list.connections.Answer questions with a vector store1.ai_tool[].0.type | string | ai_tool | 3 |
| workflows.list.connections.Answer questions with a vector store1.ai_tool[].0.index | number | 0 | 3 |
| workflows.list.connections.Qdrant Vector Store1 | object | 1 | 2 |
| workflows.list.connections.Qdrant Vector Store1.ai_vectorStore | array | 1 | 2 |
| workflows.list.connections.Qdrant Vector Store1.ai_vectorStore[].0 | object | 3 | 2 |
| workflows.list.connections.Qdrant Vector Store1.ai_vectorStore[].0.node | string | Answer questions with a vector store1 | 2 |
| workflows.list.connections.Qdrant Vector Store1.ai_vectorStore[].0.type | string | ai_vectorStore | 2 |
| workflows.list.connections.Qdrant Vector Store1.ai_vectorStore[].0.index | number | 0 | 2 |
| workflows.list.connections.Postgres Chat Memory1 | object | 1 | 2 |
| workflows.list.connections.Postgres Chat Memory1.ai_memory | array | 1 | 2 |
| workflows.list.connections.Postgres Chat Memory1.ai_memory[].0 | object | 3 | 2 |
| workflows.list.connections.Postgres Chat Memory1.ai_memory[].0.node | string | Commerciale | 2 |
| workflows.list.connections.Postgres Chat Memory1.ai_memory[].0.type | string | ai_memory | 2 |
| workflows.list.connections.Postgres Chat Memory1.ai_memory[].0.index | number | 0 | 2 |
| workflows.list.connections.GET_CUSTOMER | object | 1 | 2 |
| workflows.list.connections.GET_CUSTOMER.ai_tool | array | 1 | 2 |
| workflows.list.connections.ParcelApp1 | object | 1 | 1 |
| workflows.list.connections.ParcelApp1.ai_tool | array | 1 | 1 |
| workflows.list.connections.Date & Time1 | object | 1 | 2 |
| workflows.list.connections.Date & Time1.ai_tool | array | 1 | 2 |
| workflows.list.connections.Date & Time1.ai_tool[].0 | object | 3 | 2 |
| workflows.list.connections.Date & Time1.ai_tool[].0.node | string | Commerciale | 2 |
| workflows.list.connections.Date & Time1.ai_tool[].0.type | string | ai_tool | 2 |
| workflows.list.connections.Date & Time1.ai_tool[].0.index | number | 0 | 2 |
| workflows.list.connections.SerpAPI | object | 1 | 4 |
| workflows.list.connections.SerpAPI.ai_tool | array | 1 | 4 |
| workflows.list.connections.SerpAPI.ai_tool[].0 | object | 3 | 4 |
| workflows.list.connections.SerpAPI.ai_tool[].0.node | string | Commerciale, MILENA DISPATCHER | 4 |
| workflows.list.connections.SerpAPI.ai_tool[].0.type | string | ai_tool | 4 |
| workflows.list.connections.SerpAPI.ai_tool[].0.index | number | 0 | 4 |
| workflows.list.nodes[].parameters.content | string | ## 🎯 SISTEMA MULTI-TENANT BARBERSHOP

### Funzionalità principali:
- **Gestione messaggi vocali e t, ## 🎯 Form Assistenza GommeGo

### Vantaggi:
1. **Dati strutturati** - Niente più parsing email
2. * | 3 |
| workflows.list.nodes[].parameters.height | number | 400, 268.57633472293617 | 3 |
| workflows.list.nodes[].parameters.width | number | 500, 373.1430891196571 | 3 |
| workflows.list.nodes[].parameters.color | number | 7, 4 | 3 |
| workflows.list.connections.🔗 Unificazione Testo | object | 1 | 1 |
| workflows.list.connections.🔗 Unificazione Testo.main | array | 1 | 1 |
| workflows.list.connections.🔗 Unificazione Testo.main[].0 | object | 3 | 1 |
| workflows.list.connections.🔗 Unificazione Testo.main[].0.node | string | 🏪 Lookup Tenant | 1 |
| workflows.list.connections.🔗 Unificazione Testo.main[].0.type | string | main | 1 |
| workflows.list.connections.🔗 Unificazione Testo.main[].0.index | number | 0 | 1 |
| workflows.list.connections.🏪 Lookup Tenant | object | 1 | 1 |
| workflows.list.connections.🏪 Lookup Tenant.main | array | 1 | 1 |
| workflows.list.connections.🏪 Lookup Tenant.main[].0 | object | 3 | 1 |
| workflows.list.connections.🏪 Lookup Tenant.main[].0.node | string | ✅ Validazione Tenant | 1 |
| workflows.list.connections.🏪 Lookup Tenant.main[].0.type | string | main | 1 |
| workflows.list.connections.🏪 Lookup Tenant.main[].0.index | number | 0 | 1 |
| workflows.list.connections.✅ Validazione Tenant | object | 1 | 1 |
| workflows.list.connections.✅ Validazione Tenant.main | array | 2 | 1 |
| workflows.list.connections.✅ Validazione Tenant.main[].0 | object | 3 | 2 |
| workflows.list.connections.✅ Validazione Tenant.main[].0.node | string | 📝 Log Messaggio, ❌ Risposta Tenant Non Trovato | 2 |
| workflows.list.connections.✅ Validazione Tenant.main[].0.type | string | main | 2 |
| workflows.list.connections.✅ Validazione Tenant.main[].0.index | number | 0 | 2 |
| workflows.list.connections.📝 Log Messaggio | object | 1 | 1 |
| workflows.list.connections.📝 Log Messaggio.main | array | 1 | 1 |
| workflows.list.connections.📝 Log Messaggio.main[].0 | object | 3 | 1 |
| workflows.list.connections.📝 Log Messaggio.main[].0.node | string | 💾 Salvataggio Log DB | 1 |
| workflows.list.connections.📝 Log Messaggio.main[].0.type | string | main | 1 |
| workflows.list.connections.📝 Log Messaggio.main[].0.index | number | 0 | 1 |
| workflows.list.connections.🔍 Analisi Risposta AI | object | 1 | 1 |
| workflows.list.connections.🔍 Analisi Risposta AI.main | array | 1 | 1 |
| workflows.list.connections.🔍 Analisi Risposta AI.main[].0 | object | 3 | 1 |
| workflows.list.connections.🔍 Analisi Risposta AI.main[].0.node | string | 📅 Necessaria Verifica Calendario? | 1 |
| workflows.list.connections.🔍 Analisi Risposta AI.main[].0.type | string | main | 1 |
| workflows.list.connections.🔍 Analisi Risposta AI.main[].0.index | number | 0 | 1 |
| workflows.list.connections.📅 Necessaria Verifica Calendario? | object | 1 | 1 |
| workflows.list.connections.📅 Necessaria Verifica Calendario?.main | array | 2 | 1 |
| workflows.list.connections.📅 Necessaria Verifica Calendario?.main[].0 | object | 3 | 2 |
| workflows.list.connections.📅 Necessaria Verifica Calendario?.main[].0.node | string | 📅 Verifica Calendario Google, 📱 Invio Risposta Telegram | 2 |
| workflows.list.connections.📅 Necessaria Verifica Calendario?.main[].0.type | string | main | 2 |
| workflows.list.connections.📅 Necessaria Verifica Calendario?.main[].0.index | number | 0 | 2 |
| workflows.list.connections.📅 Verifica Calendario Google | object | 1 | 1 |
| workflows.list.connections.📅 Verifica Calendario Google.main | array | 1 | 1 |
| workflows.list.connections.📅 Verifica Calendario Google.main[].0 | object | 3 | 1 |
| workflows.list.connections.📅 Verifica Calendario Google.main[].0.node | string | ⚡ Analisi Disponibilità | 1 |
| workflows.list.connections.📅 Verifica Calendario Google.main[].0.type | string | main | 1 |
| workflows.list.connections.📅 Verifica Calendario Google.main[].0.index | number | 0 | 1 |
| workflows.list.connections.🤖 AI Booking Agent | object | 1 | 1 |
| workflows.list.connections.🤖 AI Booking Agent.ai_languageModel | array | 1 | 1 |
| workflows.list.connections.🤖 AI Booking Agent.ai_languageModel[].0 | object | 3 | 1 |
| workflows.list.connections.🤖 AI Booking Agent.ai_languageModel[].0.node | string | AI Agent | 1 |
| workflows.list.connections.🤖 AI Booking Agent.ai_languageModel[].0.type | string | ai_languageModel | 1 |
| workflows.list.connections.🤖 AI Booking Agent.ai_languageModel[].0.index | number | 0 | 1 |
| workflows.list.connections.AI Agent | object | 1 | 3 |
| workflows.list.connections.AI Agent.main | array | 1 | 3 |
| workflows.list.connections.AI Agent.main[].0 | object | 3 | 2 |
| workflows.list.connections.AI Agent.main[].0.node | string | 🔍 Analisi Risposta AI, If | 2 |
| workflows.list.connections.AI Agent.main[].0.type | string | main | 2 |
| workflows.list.connections.AI Agent.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Telegram Trigger | object | 1 | 3 |
| workflows.list.connections.Telegram Trigger.main | array | 1 | 3 |
| workflows.list.connections.Telegram Trigger.main[].0 | object | 3 | 3 |
| workflows.list.connections.Telegram Trigger.main[].0.node | string | Verify Message Type, Tag Telegram | 3 |
| workflows.list.connections.Telegram Trigger.main[].0.type | string | main | 3 |
| workflows.list.connections.Telegram Trigger.main[].0.index | number | 0 | 3 |
| workflows.list.connections.Verify Message Type | object | 1 | 1 |
| workflows.list.connections.Verify Message Type.main | array | 4 | 1 |
| workflows.list.connections.Verify Message Type.main[].0 | object | 3 | 3 |
| workflows.list.connections.Verify Message Type.main[].0.node | string | Edit Fields, Telegram1 | 3 |
| workflows.list.connections.Verify Message Type.main[].0.type | string | main | 3 |
| workflows.list.connections.Verify Message Type.main[].0.index | number | 0 | 3 |
| workflows.list.connections.Telegram1 | object | 1 | 1 |
| workflows.list.connections.Telegram1.main | array | 1 | 1 |
| workflows.list.connections.Telegram1.main[].0 | object | 3 | 1 |
| workflows.list.connections.Telegram1.main[].0.node | string | OpenAI | 1 |
| workflows.list.connections.Telegram1.main[].0.type | string | main | 1 |
| workflows.list.connections.Telegram1.main[].0.index | number | 0 | 1 |
| workflows.list.connections.OpenAI | object | 1 | 3 |
| workflows.list.connections.OpenAI.main | array | 1 | 2 |
| workflows.list.connections.OpenAI.main[].0 | object | 3 | 2 |
| workflows.list.connections.OpenAI.main[].0.node | string | 🔗 Unificazione Testo, Update Prestashop | 2 |
| workflows.list.connections.OpenAI.main[].0.type | string | main | 2 |
| workflows.list.connections.OpenAI.main[].0.index | number | 0 | 2 |
| workflows.list.connections.WhatsApp Trigger | object | 1 | 4 |
| workflows.list.connections.WhatsApp Trigger.main | array | 1 | 4 |
| workflows.list.connections.WhatsApp Trigger.main[].0 | object | 3 | 4 |
| workflows.list.connections.WhatsApp Trigger.main[].0.node | string | Verify Message Type, Verify Type | 4 |
| workflows.list.connections.WhatsApp Trigger.main[].0.type | string | main | 4 |
| workflows.list.connections.WhatsApp Trigger.main[].0.index | number | 0 | 4 |
| workflows.list.connections.Simple Memory.ai_memory[].0 | object | 3 | 4 |
| workflows.list.connections.Simple Memory.ai_memory[].0.node | string | RAG AI Agent, AI Agent | 4 |
| workflows.list.connections.Simple Memory.ai_memory[].0.type | string | ai_memory | 4 |
| workflows.list.connections.Simple Memory.ai_memory[].0.index | number | 0 | 4 |
| workflows.list.nodes[].parameters.folderId.cachedResultUrl | string | https://outlook.office365.com/mail/AAMkADY5YTU5ODIzLTM5M2MtNGU4Zi04YzNmLTBlYmYxNDNhODNjMAAuAAAAAAAty, https://outlook.office365.com/mail/AQMkADY5YTU5ODIzLTM5M2MtNGU4Zi04YzNmLTBlYmYxNDNhODNjMAAuAAADLcvJU | 2 |
| workflows.list.nodes[].parameters.binaryPropertyName | string | attachment_0 | 3 |
| workflows.list.nodes[].credentials.httpHeaderAuth | object | 2 | 4 |
| workflows.list.nodes[].credentials.httpHeaderAuth.id | string | np24ApXHsWsh6wZK, BYFWsB3xpyV8tLJG | 4 |
| workflows.list.nodes[].credentials.httpHeaderAuth.name | string | Google Token Manuale, MISTRAL_API | 4 |
| workflows.list.nodes[].credentials.googleApi | object | 2 | 1 |
| workflows.list.nodes[].credentials.googleApi.id | string | UhvvNDN92DqmqIOw | 1 |
| workflows.list.nodes[].credentials.googleApi.name | string | Google Service Account  | 1 |
| workflows.list.connections.When clicking ‘Execute workflow’ | object | 1 | 4 |
| workflows.list.connections.When clicking ‘Execute workflow’.main | array | 1 | 4 |
| workflows.list.connections.When clicking ‘Execute workflow’.main[].0 | object | 3 | 3 |
| workflows.list.connections.When clicking ‘Execute workflow’.main[].0.node | string | Execute Command, Loop Over Items | 3 |
| workflows.list.connections.When clicking ‘Execute workflow’.main[].0.type | string | main | 3 |
| workflows.list.connections.When clicking ‘Execute workflow’.main[].0.index | number | 0 | 3 |
| workflows.list.connections.Microsoft Outlook | object | 1 | 5 |
| workflows.list.connections.Microsoft Outlook.main | array | 1 | 5 |
| workflows.list.connections.Call Gemini 1.5 Flash (Batch) | object | 1 | 1 |
| workflows.list.connections.Call Gemini 1.5 Flash (Batch).main | array | 1 | 1 |
| workflows.list.nodes[].parameters.additionalFields | object | 0 | 2 |
| workflows.list.nodes[].parameters.pollTimes | object | 1 | 1 |
| workflows.list.nodes[].parameters.pollTimes.item | array | 1 | 1 |
| workflows.list.nodes[].parameters.pollTimes.item[].mode | string | everyMinute | 1 |
| workflows.list.connections.When clicking ‘Test workflow’ | object | 1 | 10 |
| workflows.list.connections.When clicking ‘Test workflow’.main | array | 1 | 10 |
| workflows.list.connections.Gmail Trigger | object | 1 | 1 |
| workflows.list.connections.Gmail Trigger.main | array | 1 | 1 |
| workflows.list.connections.Gmail Trigger.main[].0 | object | 3 | 1 |
| workflows.list.connections.Gmail Trigger.main[].0.node | string | Tag Gmail | 1 |
| workflows.list.connections.Gmail Trigger.main[].0.type | string | main | 1 |
| workflows.list.connections.Gmail Trigger.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Webhook Trigger | object | 1 | 3 |
| workflows.list.connections.Webhook Trigger.main | array | 1 | 3 |
| workflows.list.connections.Webhook Trigger.main[].0 | object | 3 | 3 |
| workflows.list.connections.Webhook Trigger.main[].0.node | string | Tag Webhook, Session Manager | 3 |
| workflows.list.connections.Webhook Trigger.main[].0.type | string | main | 3 |
| workflows.list.connections.Webhook Trigger.main[].0.index | number | 0 | 3 |
| workflows.list.connections.Tag Telegram | object | 1 | 1 |
| workflows.list.connections.Tag Telegram.main | array | 1 | 1 |
| workflows.list.connections.Tag Telegram.main[].0 | object | 3 | 1 |
| workflows.list.connections.Tag Telegram.main[].0.node | string | Classifica tipo | 1 |
| workflows.list.connections.Tag Telegram.main[].0.type | string | main | 1 |
| workflows.list.connections.Tag Telegram.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Tag Gmail | object | 1 | 1 |
| workflows.list.connections.Tag Gmail.main | array | 1 | 1 |
| workflows.list.connections.Tag Gmail.main[].0 | object | 3 | 1 |
| workflows.list.connections.Tag Gmail.main[].0.node | string | Classifica tipo | 1 |
| workflows.list.connections.Tag Gmail.main[].0.type | string | main | 1 |
| workflows.list.connections.Tag Gmail.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Tag Webhook | object | 1 | 1 |
| workflows.list.connections.Tag Webhook.main | array | 1 | 1 |
| workflows.list.connections.Tag Webhook.main[].0 | object | 3 | 1 |
| workflows.list.connections.Tag Webhook.main[].0.node | string | Classifica tipo | 1 |
| workflows.list.connections.Tag Webhook.main[].0.type | string | main | 1 |
| workflows.list.connections.Tag Webhook.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Verify Type | object | 1 | 1 |
| workflows.list.connections.Verify Type.main | array | 2 | 1 |
| workflows.list.connections.Verify Type.main[].0 | object | 3 | 2 |
| workflows.list.connections.Verify Type.main[].0.node | string | Text → messaggio_convertito, Download Audio | 2 |
| workflows.list.connections.Verify Type.main[].0.type | string | main | 2 |
| workflows.list.connections.Verify Type.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Text → messaggio_convertito | object | 1 | 1 |
| workflows.list.connections.Text → messaggio_convertito.main | array | 1 | 1 |
| workflows.list.connections.Text → messaggio_convertito.main[].0 | object | 3 | 1 |
| workflows.list.connections.Text → messaggio_convertito.main[].0.node | string | Milena AI Agent | 1 |
| workflows.list.connections.Text → messaggio_convertito.main[].0.type | string | main | 1 |
| workflows.list.connections.Text → messaggio_convertito.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Download Audio | object | 1 | 2 |
| workflows.list.connections.Download Audio.main | array | 1 | 2 |
| workflows.list.connections.Download Audio.main[].0 | object | 3 | 2 |
| workflows.list.connections.Download Audio.main[].0.node | string | Transcribe Whisper, Transcribe Audio | 2 |
| workflows.list.connections.Download Audio.main[].0.type | string | main | 2 |
| workflows.list.connections.Download Audio.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Transcribe Whisper | object | 1 | 1 |
| workflows.list.connections.Transcribe Whisper.main | array | 1 | 1 |
| workflows.list.connections.Transcribe Whisper.main[].0 | object | 3 | 1 |
| workflows.list.connections.Transcribe Whisper.main[].0.node | string | Set messaggio_convertito (audio) | 1 |
| workflows.list.connections.Transcribe Whisper.main[].0.type | string | main | 1 |
| workflows.list.connections.Transcribe Whisper.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Set messaggio_convertito (audio) | object | 1 | 1 |
| workflows.list.connections.Set messaggio_convertito (audio).main | array | 1 | 1 |
| workflows.list.connections.Set messaggio_convertito (audio).main[].0 | object | 3 | 1 |
| workflows.list.connections.Set messaggio_convertito (audio).main[].0.node | string | Milena AI Agent | 1 |
| workflows.list.connections.Set messaggio_convertito (audio).main[].0.type | string | main | 1 |
| workflows.list.connections.Set messaggio_convertito (audio).main[].0.index | number | 0 | 1 |
| workflows.list.connections.Milena AI Agent | object | 1 | 1 |
| workflows.list.connections.Milena AI Agent.main | array | 1 | 1 |
| workflows.list.connections.Milena AI Agent.main[].0 | object | 3 | 1 |
| workflows.list.connections.Milena AI Agent.main[].0.node | string | Invia Risposta | 1 |
| workflows.list.connections.Milena AI Agent.main[].0.type | string | main | 1 |
| workflows.list.connections.Milena AI Agent.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Telegram Trigger1 | object | 1 | 1 |
| workflows.list.connections.Telegram Trigger1.main | array | 1 | 1 |
| workflows.list.connections.Telegram Trigger1.main[].0 | object | 3 | 1 |
| workflows.list.connections.Telegram Trigger1.main[].0.node | string | Verify Type | 1 |
| workflows.list.connections.Telegram Trigger1.main[].0.type | string | main | 1 |
| workflows.list.connections.Telegram Trigger1.main[].0.index | number | 0 | 1 |
| workflows.list.nodes[].parameters.dataType | string | binary | 1 |
| workflows.list.nodes[].parameters.options.metadata | object | 1 | 1 |
| workflows.list.nodes[].parameters.options.metadata.metadataValues | array | 2 | 1 |
| workflows.list.nodes[].parameters.chunkOverlap | number | 200 | 1 |
| workflows.list.connections.When clicking ‘Test workflow’.main[].0 | object | 3 | 5 |
| workflows.list.connections.When clicking ‘Test workflow’.main[].0.node | string | Lista File1, Google Drive | 5 |
| workflows.list.connections.When clicking ‘Test workflow’.main[].0.type | string | main | 5 |
| workflows.list.connections.When clicking ‘Test workflow’.main[].0.index | number | 0 | 5 |
| workflows.list.connections.Default Data Loader | object | 1 | 4 |
| workflows.list.connections.Default Data Loader.ai_document | array | 1 | 4 |
| workflows.list.connections.Default Data Loader.ai_document[].0 | object | 3 | 4 |
| workflows.list.connections.Default Data Loader.ai_document[].0.node | string | Qdrant Vector Store1, Pinecone Vector Store | 4 |
| workflows.list.connections.Default Data Loader.ai_document[].0.type | string | ai_document | 4 |
| workflows.list.connections.Default Data Loader.ai_document[].0.index | number | 0 | 4 |
| workflows.list.connections.Token Splitter | object | 1 | 3 |
| workflows.list.connections.Token Splitter.ai_textSplitter | array | 1 | 3 |
| workflows.list.connections.Token Splitter.ai_textSplitter[].0 | object | 3 | 3 |
| workflows.list.connections.Token Splitter.ai_textSplitter[].0.node | string | Default Data Loader | 3 |
| workflows.list.connections.Token Splitter.ai_textSplitter[].0.type | string | ai_textSplitter | 3 |
| workflows.list.connections.Token Splitter.ai_textSplitter[].0.index | number | 0 | 3 |
| workflows.list.connections.Extract from File | object | 1 | 4 |
| workflows.list.connections.Extract from File.main | array | 1 | 4 |
| workflows.list.connections.Extract from File.main[].0 | object | 3 | 4 |
| workflows.list.connections.Extract from File.main[].0.node | string | Merge, 🔀 Chunking | 4 |
| workflows.list.connections.Extract from File.main[].0.type | string | main | 4 |
| workflows.list.connections.Extract from File.main[].0.index | number | 1, 0 | 4 |
| workflows.list.connections.Lista File1 | object | 1 | 2 |
| workflows.list.connections.Lista File1.main | array | 1 | 2 |
| workflows.list.connections.Lista File1.main[].0 | object | 3 | 2 |
| workflows.list.connections.Lista File1.main[].0.node | string | Download file1 | 2 |
| workflows.list.connections.Lista File1.main[].0.type | string | main | 2 |
| workflows.list.connections.Lista File1.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Download file1 | object | 1 | 2 |
| workflows.list.connections.Download file1.main | array | 1 | 2 |
| workflows.list.connections.Download file1.main[].0 | object | 3 | 2 |
| workflows.list.connections.Download file1.main[].0.node | string | Edit Fields | 2 |
| workflows.list.connections.Download file1.main[].0.type | string | main | 2 |
| workflows.list.connections.Download file1.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Download file1.main[].1 | object | 3 | 2 |
| workflows.list.connections.Download file1.main[].1.node | string | Extract from File | 2 |
| workflows.list.connections.Download file1.main[].1.type | string | main | 2 |
| workflows.list.connections.Download file1.main[].1.index | number | 0 | 2 |
| workflows.list.nodes[].parameters.matchType | string | allFilters | 1 |
| workflows.list.nodes[].credentials.googleSheetsOAuth2Api | object | 2 | 3 |
| workflows.list.nodes[].credentials.googleSheetsOAuth2Api.id | string | FdPMod5ivW8IWoD5 | 3 |
| workflows.list.nodes[].credentials.googleSheetsOAuth2Api.name | string | Google Sheets account | 3 |
| workflows.list.connections.Seleziona Dati da Controllare da DB | object | 1 | 1 |
| workflows.list.connections.Seleziona Dati da Controllare da DB.main | array | 1 | 1 |
| workflows.list.connections.Seleziona Dati da Controllare da DB.main[].0 | object | 3 | 1 |
| workflows.list.connections.Seleziona Dati da Controllare da DB.main[].0.node | string | Code | 1 |
| workflows.list.connections.Seleziona Dati da Controllare da DB.main[].0.type | string | main | 1 |
| workflows.list.connections.Seleziona Dati da Controllare da DB.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Code1 | object | 1 | 2 |
| workflows.list.connections.Code1.main | array | 1 | 2 |
| workflows.list.connections.Code1.main[].0 | object | 3 | 1 |
| workflows.list.connections.Code1.main[].0.node | string | Google Sheets | 1 |
| workflows.list.connections.Code1.main[].0.type | string | main | 1 |
| workflows.list.connections.Code1.main[].0.index | number | 0 | 1 |
| workflows.list.nodes[].parameters.model.__rl | boolean | true | 8 |
| workflows.list.nodes[].parameters.model.value | string | gpt-4.1-2025-04-14, gpt-4.1-mini-2025-04-14 | 8 |
| workflows.list.nodes[].parameters.model.mode | string | list | 8 |
| workflows.list.nodes[].parameters.model.cachedResultName | string | gpt-4.1-2025-04-14, gpt-4.1-mini-2025-04-14 | 6 |
| workflows.list.nodes[].parameters.options.temperature | number | 0.1 | 2 |
| workflows.list.nodes[].parameters.conditions | object | 3, 1 | 4 |
| workflows.list.nodes[].parameters.conditions.options | object | 4 | 2 |
| workflows.list.nodes[].parameters.conditions.options.caseSensitive | boolean | true | 2 |
| workflows.list.nodes[].parameters.conditions.options.leftValue | string | N/A | 2 |
| workflows.list.nodes[].parameters.conditions.options.typeValidation | string | strict | 2 |
| workflows.list.nodes[].parameters.conditions.options.version | number | 2 | 2 |
| workflows.list.nodes[].parameters.conditions.conditions | array | 2, 1 | 2 |
| workflows.list.nodes[].parameters.conditions.conditions[].id | string | gap-detected, confidence-check | 3 |
| workflows.list.nodes[].parameters.conditions.conditions[].leftValue | string | ={{ $json.output.gap_identified }}, ={{ $json.output.confidence }} | 3 |
| workflows.list.nodes[].parameters.conditions.conditions[].rightValue | string | true, 50 | 3 |
| workflows.list.nodes[].parameters.conditions.conditions[].operator | object | 3, 2 | 3 |
| workflows.list.nodes[].parameters.conditions.combinator | string | and | 2 |
| workflows.list.connections.🧠 Conversation Analyzer LLM | object | 1 | 2 |
| workflows.list.connections.🧠 Conversation Analyzer LLM.ai_languageModel | array | 1 | 2 |
| workflows.list.connections.🔧 JSON Extractor & Validator | object | 1 | 2 |
| workflows.list.connections.🔧 JSON Extractor & Validator.main | array | 1 | 2 |
| workflows.list.connections.❓ Should Create Task? | object | 1 | 2 |
| workflows.list.connections.❓ Should Create Task?.main | array | 2 | 2 |
| workflows.list.connections.❓ Should Create Task?.main[].0 | object | 3 | 4 |
| workflows.list.connections.❓ Should Create Task?.main[].0.node | string | Task Generator, No Task Logging | 4 |
| workflows.list.connections.❓ Should Create Task?.main[].0.type | string | main | 4 |
| workflows.list.connections.❓ Should Create Task?.main[].0.index | number | 0 | 4 |
| workflows.list.connections.⚙️ Enhanced Task Generator LLM | object | 1 | 2 |
| workflows.list.connections.⚙️ Enhanced Task Generator LLM.ai_languageModel | array | 1 | 2 |
| workflows.list.connections.🏗️ Task Enricher | object | 1 | 2 |
| workflows.list.connections.🏗️ Task Enricher.main | array | 1 | 2 |
| workflows.list.connections.🏗️ Task Enricher.main[].0 | object | 3 | 2 |
| workflows.list.connections.🏗️ Task Enricher.main[].0.node | string | Supabase Task Insert, 💾 Supabase Task Insert | 2 |
| workflows.list.connections.🏗️ Task Enricher.main[].0.type | string | main | 2 |
| workflows.list.connections.🏗️ Task Enricher.main[].0.index | number | 0 | 2 |
| workflows.list.connections.📱 Telegram Critical Alert | object | 1 | 2 |
| workflows.list.connections.📱 Telegram Critical Alert.main | array | 1 | 2 |
| workflows.list.connections.📱 Telegram Critical Alert.main[].0 | object | 3 | 2 |
| workflows.list.connections.📱 Telegram Critical Alert.main[].0.node | string | Event Logger Prep, 📈 Metrics Data Prep | 2 |
| workflows.list.connections.📱 Telegram Critical Alert.main[].0.type | string | main | 2 |
| workflows.list.connections.📱 Telegram Critical Alert.main[].0.index | number | 0 | 2 |
| workflows.list.connections.DATA NODE COLLECTOR | object | 1 | 2 |
| workflows.list.connections.DATA NODE COLLECTOR.main | array | 1 | 2 |
| workflows.list.connections.DATA NODE COLLECTOR.main[].0 | object | 3 | 2 |
| workflows.list.connections.DATA NODE COLLECTOR.main[].0.node | string | 🏗️ Task Enricher | 2 |
| workflows.list.connections.DATA NODE COLLECTOR.main[].0.type | string | main | 2 |
| workflows.list.connections.DATA NODE COLLECTOR.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Normalize Supabase data | object | 1 | 1 |
| workflows.list.connections.Normalize Supabase data.main | array | 1 | 1 |
| workflows.list.connections.Normalize Supabase data.main[].0 | object | 3 | 1 |
| workflows.list.connections.Normalize Supabase data.main[].0.node | string | Record Exists? | 1 |
| workflows.list.connections.Normalize Supabase data.main[].0.type | string | main | 1 |
| workflows.list.connections.Normalize Supabase data.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Workflow Trigger | object | 1 | 1 |
| workflows.list.connections.Workflow Trigger.main | array | 1 | 1 |
| workflows.list.connections.Workflow Trigger.main[].0 | object | 3 | 1 |
| workflows.list.connections.Workflow Trigger.main[].0.node | string | Data Mapper | 1 |
| workflows.list.connections.Workflow Trigger.main[].0.type | string | main | 1 |
| workflows.list.connections.Workflow Trigger.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Google Gemini Chat Model1 | object | 1 | 1 |
| workflows.list.connections.Google Gemini Chat Model1.ai_languageModel | array | 1 | 1 |
| workflows.list.connections.Google Gemini Chat Model1.ai_languageModel[].0 | object | 3 | 1 |
| workflows.list.connections.Google Gemini Chat Model1.ai_languageModel[].0.node | string | Task Generator | 1 |
| workflows.list.connections.Google Gemini Chat Model1.ai_languageModel[].0.type | string | ai_languageModel | 1 |
| workflows.list.connections.Google Gemini Chat Model1.ai_languageModel[].0.index | number | 0 | 1 |
| workflows.list.connections.Structured Output Parser | object | 1 | 3 |
| workflows.list.connections.Structured Output Parser.ai_outputParser | array | 1 | 3 |
| workflows.list.connections.Structured Output Parser.ai_outputParser[].0 | object | 3 | 3 |
| workflows.list.connections.Structured Output Parser.ai_outputParser[].0.node | string | Conversation Analyzer, Invoice data extractor1 | 3 |
| workflows.list.connections.Structured Output Parser.ai_outputParser[].0.type | string | ai_outputParser | 3 |
| workflows.list.connections.Structured Output Parser.ai_outputParser[].0.index | number | 0 | 3 |
| workflows.list.connections.Conversation Analyzer | object | 1 | 2 |
| workflows.list.connections.Conversation Analyzer.main | array | 1 | 2 |
| workflows.list.connections.Conversation Analyzer.main[].0 | object | 3 | 2 |
| workflows.list.connections.Conversation Analyzer.main[].0.node | string | ❓ Should Create Task?, Trasforma in Json | 2 |
| workflows.list.connections.Conversation Analyzer.main[].0.type | string | main | 2 |
| workflows.list.connections.Conversation Analyzer.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Structured Output Parser1 | object | 1 | 1 |
| workflows.list.connections.Structured Output Parser1.ai_outputParser | array | 1 | 1 |
| workflows.list.connections.Structured Output Parser1.ai_outputParser[].0 | object | 3 | 1 |
| workflows.list.connections.Structured Output Parser1.ai_outputParser[].0.node | string | Task Generator | 1 |
| workflows.list.connections.Structured Output Parser1.ai_outputParser[].0.type | string | ai_outputParser | 1 |
| workflows.list.connections.Structured Output Parser1.ai_outputParser[].0.index | number | 0 | 1 |
| workflows.list.connections.Task Generator | object | 1 | 1 |
| workflows.list.connections.Task Generator.main | array | 1 | 1 |
| workflows.list.connections.Task Generator.main[].0 | object | 3 | 1 |
| workflows.list.connections.Task Generator.main[].0.node | string | DATA NODE COLLECTOR | 1 |
| workflows.list.connections.Task Generator.main[].0.type | string | main | 1 |
| workflows.list.connections.Task Generator.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Supabase Task Insert | object | 1 | 1 |
| workflows.list.connections.Supabase Task Insert.main | array | 1 | 1 |
| workflows.list.connections.Supabase Task Insert.main[].0 | object | 3 | 1 |
| workflows.list.connections.Supabase Task Insert.main[].0.node | string | Urgency Check | 1 |
| workflows.list.connections.Supabase Task Insert.main[].0.type | string | main | 1 |
| workflows.list.connections.Supabase Task Insert.main[].0.index | number | 0 | 1 |
| workflows.list.connections.No Task Logging | object | 1 | 1 |
| workflows.list.connections.No Task Logging.main | array | 1 | 1 |
| workflows.list.connections.No Task Logging.main[].0 | object | 3 | 1 |
| workflows.list.connections.No Task Logging.main[].0.node | string | Event Logger Prep | 1 |
| workflows.list.connections.No Task Logging.main[].0.type | string | main | 1 |
| workflows.list.connections.No Task Logging.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Check Today Record | object | 1 | 1 |
| workflows.list.connections.Check Today Record.main | array | 1 | 1 |
| workflows.list.connections.Check Today Record.main[].0 | object | 3 | 1 |
| workflows.list.connections.Check Today Record.main[].0.node | string | Normalize Supabase data | 1 |
| workflows.list.connections.Check Today Record.main[].0.type | string | main | 1 |
| workflows.list.connections.Check Today Record.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Record Exists? | object | 1 | 1 |
| workflows.list.connections.Record Exists?.main | array | 2 | 1 |
| workflows.list.connections.Record Exists?.main[].0 | object | 3 | 1 |
| workflows.list.connections.Record Exists?.main[].0.node | string | Update Existing | 1 |
| workflows.list.connections.Record Exists?.main[].0.type | string | main | 1 |
| workflows.list.connections.Record Exists?.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Update Existing | object | 1 | 1 |
| workflows.list.connections.Update Existing.main | array | 1 | 1 |
| workflows.list.connections.Supabase Update | object | 1 | 1 |
| workflows.list.connections.Supabase Update.main | array | 1 | 1 |
| workflows.list.connections.Supabase Insert | object | 1 | 1 |
| workflows.list.connections.Supabase Insert.main | array | 1 | 1 |
| workflows.list.connections.Data Mapper | object | 1 | 1 |
| workflows.list.connections.Data Mapper.main | array | 1 | 1 |
| workflows.list.connections.Data Mapper.main[].0 | object | 3 | 1 |
| workflows.list.connections.Data Mapper.main[].0.node | string | Conversation Analyzer | 1 |
| workflows.list.connections.Data Mapper.main[].0.type | string | main | 1 |
| workflows.list.connections.Data Mapper.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Urgency Check | object | 1 | 1 |
| workflows.list.connections.Urgency Check.main | array | 1 | 1 |
| workflows.list.connections.Urgency Check.main[].0 | object | 3 | 1 |
| workflows.list.connections.Urgency Check.main[].0.node | string | 📱 Telegram Critical Alert | 1 |
| workflows.list.connections.Urgency Check.main[].0.type | string | main | 1 |
| workflows.list.connections.Urgency Check.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Event Logger Prep | object | 1 | 1 |
| workflows.list.connections.Event Logger Prep.main | array | 1 | 1 |
| workflows.list.connections.Event Logger Prep.main[].0 | object | 3 | 1 |
| workflows.list.connections.Event Logger Prep.main[].0.node | string | Supabase Insert | 1 |
| workflows.list.connections.Event Logger Prep.main[].0.type | string | main | 1 |
| workflows.list.connections.Event Logger Prep.main[].0.index | number | 0 | 1 |
| workflows.list.nodes[].parameters.formTitle | string | Estrazione dati fatture internazionali, Richiesta Assistenza GommeGo | 4 |
| workflows.list.nodes[].parameters.formDescription | string | Carica la fattura, Compila il form per ricevere assistenza rapida e precisa | 4 |
| workflows.list.nodes[].parameters.formFields | object | 1 | 4 |
| workflows.list.nodes[].parameters.formFields.values | array | 1, 8 | 4 |
| workflows.list.nodes[].parameters.formFields.values[].fieldLabel | string | fattura, Email | 6 |
| workflows.list.nodes[].parameters.formFields.values[].fieldType | string | file, email | 6 |
| workflows.list.nodes[].parameters.formFields.values[].requiredField | boolean | true | 6 |
| workflows.list.nodes[].parameters.options.appendAttribution | boolean | false | 3 |
| workflows.list.nodes[].parameters.options.ignoreBots | boolean | true | 2 |
| workflows.list.nodes[].parameters.modelName | string | models/gemini-1.5-flash | 1 |
| workflows.list.nodes[].parameters.jsonSchemaExample | string | {
  "numero_ordine_prestashop": "FZISHUXBL",
  "numero_ordine_t24": "PTY201022640225",
  "nome_file_ | 1 |
| workflows.list.connections.Form prova fatture | object | 1 | 2 |
| workflows.list.connections.Form prova fatture.main | array | 1 | 2 |
| workflows.list.connections.Form prova fatture.main[].0 | object | 3 | 2 |
| workflows.list.connections.Form prova fatture.main[].0.node | string | Move file to Binary, UPLOAD MISTRAL OCR | 2 |
| workflows.list.connections.Form prova fatture.main[].0.type | string | main | 2 |
| workflows.list.connections.Form prova fatture.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Move file to Binary | object | 1 | 1 |
| workflows.list.connections.Move file to Binary.main | array | 1 | 1 |
| workflows.list.connections.Move file to Binary.main[].0 | object | 3 | 1 |
| workflows.list.connections.Move file to Binary.main[].0.node | string | Invoice data extractor1 | 1 |
| workflows.list.connections.Move file to Binary.main[].0.type | string | main | 1 |
| workflows.list.connections.Move file to Binary.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Invoice data extractor1 | object | 1 | 1 |
| workflows.list.connections.Invoice data extractor1.main | array | 1 | 1 |
| workflows.list.nodes[].parameters.returnAll | boolean | true | 1 |
| workflows.list.nodes[].parameters.filter | object | 1, 3 | 2 |
| workflows.list.nodes[].parameters.filter.folderId | object | 5 | 2 |
| workflows.list.nodes[].parameters.filter.folderId.__rl | boolean | true | 2 |
| workflows.list.nodes[].parameters.filter.folderId.value | string | 13KHjBRdK3CLcoo7OGRXyFq6_T83sYeHH | 2 |
| workflows.list.nodes[].parameters.filter.folderId.mode | string | list | 2 |
| workflows.list.nodes[].parameters.filter.folderId.cachedResultName | string | N8N TEST | 2 |
| workflows.list.nodes[].parameters.filter.folderId.cachedResultUrl | string | https://drive.google.com/drive/folders/13KHjBRdK3CLcoo7OGRXyFq6_T83sYeHH | 2 |
| workflows.list.nodes[].parameters.fileId | object | 3 | 2 |
| workflows.list.nodes[].parameters.fileId.__rl | boolean | true | 2 |
| workflows.list.nodes[].parameters.fileId.value | string | ={{ $json.id }} | 2 |
| workflows.list.nodes[].parameters.fileId.mode | string | id | 2 |
| workflows.list.connections.Google Drive | object | 1 | 1 |
| workflows.list.connections.Google Drive.main | array | 1 | 1 |
| workflows.list.connections.Google Drive.main[].0 | object | 3 | 1 |
| workflows.list.connections.Google Drive.main[].0.node | string | Get Content | 1 |
| workflows.list.connections.Google Drive.main[].0.type | string | main | 1 |
| workflows.list.connections.Google Drive.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Get Content | object | 1 | 1 |
| workflows.list.connections.Get Content.main | array | 1 | 1 |
| workflows.list.connections.Get Content.main[].0 | object | 3 | 1 |
| workflows.list.connections.Get Content.main[].0.node | string | Extract from File | 1 |
| workflows.list.connections.Get Content.main[].0.type | string | main | 1 |
| workflows.list.connections.Get Content.main[].0.index | number | 0 | 1 |
| workflows.list.connections.🔀 Chunking | object | 1 | 1 |
| workflows.list.connections.🔀 Chunking.main | array | 1 | 1 |
| workflows.list.connections.🔀 Chunking.main[].0 | object | 3 | 1 |
| workflows.list.connections.🔀 Chunking.main[].0.node | string | 🧠 OpenAI HTTP Embedding | 1 |
| workflows.list.connections.🔀 Chunking.main[].0.type | string | main | 1 |
| workflows.list.connections.🔀 Chunking.main[].0.index | number | 0 | 1 |
| workflows.list.connections.🔀 Chunking.main[].1 | object | 3 | 1 |
| workflows.list.connections.🔀 Chunking.main[].1.node | string | Merge | 1 |
| workflows.list.connections.🔀 Chunking.main[].1.type | string | main | 1 |
| workflows.list.connections.🔀 Chunking.main[].1.index | number | 0 | 1 |
| workflows.list.connections.🧠 OpenAI HTTP Embedding | object | 1 | 1 |
| workflows.list.connections.🧠 OpenAI HTTP Embedding.main | array | 1 | 1 |
| workflows.list.connections.🧠 OpenAI HTTP Embedding.main[].0 | object | 3 | 1 |
| workflows.list.connections.🧠 OpenAI HTTP Embedding.main[].0.node | string | Merge | 1 |
| workflows.list.connections.🧠 OpenAI HTTP Embedding.main[].0.type | string | main | 1 |
| workflows.list.connections.🧠 OpenAI HTTP Embedding.main[].0.index | number | 1 | 1 |
| workflows.list.pinData.When clicking ‘Test workflow’ | array | 1 | 1 |
| workflows.list.pinData.When clicking ‘Test workflow’[].json | object | 0 | 1 |
| workflows.list.nodes[].parameters.updates | array | 1 | 2 |
| workflows.list.nodes[].parameters.base | object | 5 | 1 |
| workflows.list.nodes[].parameters.base.__rl | boolean | true | 1 |
| workflows.list.nodes[].parameters.base.mode | string | list | 1 |
| workflows.list.nodes[].parameters.base.value | string | appO2nHiT9XPuGrjN | 1 |
| workflows.list.nodes[].parameters.base.cachedResultUrl | string | https://airtable.com/appO2nHiT9XPuGrjN | 1 |
| workflows.list.nodes[].parameters.base.cachedResultName | string | Twilio-Scheduling-Agent | 1 |
| workflows.list.nodes[].parameters.table | object | 5 | 1 |
| workflows.list.nodes[].parameters.table.__rl | boolean | true | 1 |
| workflows.list.nodes[].parameters.table.mode | string | list | 1 |
| workflows.list.nodes[].parameters.table.value | string | tblokH7uw63RpIlQ0 | 1 |
| workflows.list.nodes[].parameters.table.cachedResultUrl | string | https://airtable.com/appO2nHiT9XPuGrjN/tblokH7uw63RpIlQ0 | 1 |
| workflows.list.nodes[].parameters.table.cachedResultName | string | Lead Tracker | 1 |
| workflows.list.nodes[].parameters.filterByFormula | string | =AND(
 {appointment_id} = '',
 {status} != 'STOP',
 {followup_count} < 3,
 DATETIME_DIFF(TODAY(), {l | 1 |
| workflows.list.connections.Every 24hrs | object | 1 | 1 |
| workflows.list.connections.Every 24hrs.main | array | 1 | 1 |
| workflows.list.connections.Every 24hrs.main[].0 | object | 3 | 1 |
| workflows.list.connections.Every 24hrs.main[].0.node | string | Find Follow-Up Candidates | 1 |
| workflows.list.connections.Every 24hrs.main[].0.type | string | main | 1 |
| workflows.list.connections.Every 24hrs.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Cancel Booking | object | 1 | 1 |
| workflows.list.connections.Cancel Booking.ai_tool | array | 1 | 1 |
| workflows.list.connections.Cancel Booking.ai_tool[].0 | object | 3 | 1 |
| workflows.list.connections.Cancel Booking.ai_tool[].0.node | string | Appointment Scheduling Agent1 | 1 |
| workflows.list.connections.Cancel Booking.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.list.connections.Cancel Booking.ai_tool[].0.index | number | 0 | 1 |
| workflows.list.connections.Twilio Trigger | object | 1 | 1 |
| workflows.list.connections.Twilio Trigger.main | array | 1 | 1 |
| workflows.list.connections.Twilio Trigger.main[].0 | object | 3 | 1 |
| workflows.list.connections.Twilio Trigger.main[].0.node | string | Check For Command Words | 1 |
| workflows.list.connections.Twilio Trigger.main[].0.type | string | main | 1 |
| workflows.list.connections.Twilio Trigger.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Create a Booking | object | 1 | 1 |
| workflows.list.connections.Create a Booking.ai_tool | array | 1 | 1 |
| workflows.list.connections.Create a Booking.ai_tool[].0 | object | 3 | 1 |
| workflows.list.connections.Create a Booking.ai_tool[].0.node | string | Appointment Scheduling Agent1 | 1 |
| workflows.list.connections.Create a Booking.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.list.connections.Create a Booking.ai_tool[].0.index | number | 0 | 1 |
| workflows.list.connections.Get Availability | object | 1 | 1 |
| workflows.list.connections.Get Availability.ai_tool | array | 1 | 1 |
| workflows.list.connections.Get Availability.ai_tool[].0 | object | 3 | 1 |
| workflows.list.connections.Get Availability.ai_tool[].0.node | string | Appointment Scheduling Agent1 | 1 |
| workflows.list.connections.Get Availability.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.list.connections.Get Availability.ai_tool[].0.index | number | 0 | 1 |
| workflows.list.connections.User Request STOP | object | 1 | 1 |
| workflows.list.connections.User Request STOP.main | array | 1 | 1 |
| workflows.list.connections.User Request STOP.main[].0 | object | 3 | 1 |
| workflows.list.connections.User Request STOP.main[].0.node | string | Send Confirmation | 1 |
| workflows.list.connections.User Request STOP.main[].0.type | string | main | 1 |
| workflows.list.connections.User Request STOP.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Reschedule Booking | object | 1 | 1 |
| workflows.list.connections.Reschedule Booking.ai_tool | array | 1 | 1 |
| workflows.list.connections.Reschedule Booking.ai_tool[].0 | object | 3 | 1 |
| workflows.list.connections.Reschedule Booking.ai_tool[].0.node | string | Appointment Scheduling Agent1 | 1 |
| workflows.list.connections.Reschedule Booking.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.list.connections.Reschedule Booking.ai_tool[].0.index | number | 0 | 1 |
| workflows.list.connections.Get Existing Booking | object | 1 | 1 |
| workflows.list.connections.Get Existing Booking.ai_tool | array | 1 | 1 |
| workflows.list.connections.Get Existing Booking.ai_tool[].0 | object | 3 | 1 |
| workflows.list.connections.Get Existing Booking.ai_tool[].0.node | string | Appointment Scheduling Agent1 | 1 |
| workflows.list.connections.Get Existing Booking.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.list.connections.Get Existing Booking.ai_tool[].0.index | number | 0 | 1 |
| workflows.list.connections.Create/Update Session | object | 1 | 1 |
| workflows.list.connections.Create/Update Session.main | array | 1 | 1 |
| workflows.list.connections.Create/Update Session.main[].0 | object | 3 | 1 |
| workflows.list.connections.Create/Update Session.main[].0.node | string | Send Reply | 1 |
| workflows.list.connections.Create/Update Session.main[].0.type | string | main | 1 |
| workflows.list.connections.Create/Update Session.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Find Existing Booking | object | 1 | 1 |
| workflows.list.connections.Find Existing Booking.ai_tool | array | 1 | 1 |
| workflows.list.connections.Find Existing Booking.ai_tool[].0 | object | 3 | 1 |
| workflows.list.connections.Find Existing Booking.ai_tool[].0.node | string | Appointment Scheduling Agent1 | 1 |
| workflows.list.connections.Find Existing Booking.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.list.connections.Find Existing Booking.ai_tool[].0.index | number | 0 | 1 |
| workflows.list.connections.Check For Command Words | object | 1 | 1 |
| workflows.list.connections.Check For Command Words.main | array | 2 | 1 |
| workflows.list.connections.Check For Command Words.main[].0 | object | 3 | 2 |
| workflows.list.connections.Check For Command Words.main[].0.node | string | User Request STOP, Get Existing Chat Session | 2 |
| workflows.list.connections.Check For Command Words.main[].0.type | string | main | 2 |
| workflows.list.connections.Check For Command Words.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Auto-fixing Output Parser | object | 1 | 1 |
| workflows.list.connections.Auto-fixing Output Parser.ai_outputParser | array | 1 | 1 |
| workflows.list.connections.Auto-fixing Output Parser.ai_outputParser[].0 | object | 3 | 1 |
| workflows.list.connections.Auto-fixing Output Parser.ai_outputParser[].0.node | string | Appointment Scheduling Agent1 | 1 |
| workflows.list.connections.Auto-fixing Output Parser.ai_outputParser[].0.type | string | ai_outputParser | 1 |
| workflows.list.connections.Auto-fixing Output Parser.ai_outputParser[].0.index | number | 0 | 1 |
| workflows.list.connections.Find Follow-Up Candidates | object | 1 | 1 |
| workflows.list.connections.Find Follow-Up Candidates.main | array | 1 | 1 |
| workflows.list.connections.Find Follow-Up Candidates.main[].0 | object | 3 | 1 |
| workflows.list.connections.Find Follow-Up Candidates.main[].0.node | string | Generate Follow Up Message | 1 |
| workflows.list.connections.Find Follow-Up Candidates.main[].0.type | string | main | 1 |
| workflows.list.connections.Find Follow-Up Candidates.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Get Existing Chat Session | object | 1 | 1 |
| workflows.list.connections.Get Existing Chat Session.main | array | 1 | 1 |
| workflows.list.connections.Get Existing Chat Session.main[].0 | object | 3 | 1 |
| workflows.list.connections.Get Existing Chat Session.main[].0.node | string | Appointment Scheduling Agent1 | 1 |
| workflows.list.connections.Get Existing Chat Session.main[].0.type | string | main | 1 |
| workflows.list.connections.Get Existing Chat Session.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Generate Follow Up Message | object | 1 | 1 |
| workflows.list.connections.Generate Follow Up Message.main | array | 1 | 1 |
| workflows.list.connections.Generate Follow Up Message.main[].0 | object | 3 | 1 |
| workflows.list.connections.Generate Follow Up Message.main[].0.node | string | Update Follow-Up Count and Date | 1 |
| workflows.list.connections.Generate Follow Up Message.main[].0.type | string | main | 1 |
| workflows.list.connections.Generate Follow Up Message.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Appointment Scheduling Agent1 | object | 1 | 1 |
| workflows.list.connections.Appointment Scheduling Agent1.main | array | 1 | 1 |
| workflows.list.connections.Appointment Scheduling Agent1.main[].0 | object | 3 | 1 |
| workflows.list.connections.Appointment Scheduling Agent1.main[].0.node | string | Create/Update Session | 1 |
| workflows.list.connections.Appointment Scheduling Agent1.main[].0.type | string | main | 1 |
| workflows.list.connections.Appointment Scheduling Agent1.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Update Follow-Up Count and Date | object | 1 | 1 |
| workflows.list.connections.Update Follow-Up Count and Date.main | array | 1 | 1 |
| workflows.list.connections.Update Follow-Up Count and Date.main[].0 | object | 3 | 1 |
| workflows.list.connections.Update Follow-Up Count and Date.main[].0.node | string | Send Follow Up Message | 1 |
| workflows.list.connections.Update Follow-Up Count and Date.main[].0.type | string | main | 1 |
| workflows.list.connections.Update Follow-Up Count and Date.main[].0.index | number | 0 | 1 |
| workflows.list.nodes[].parameters.modelId | object | 4 | 5 |
| workflows.list.nodes[].parameters.modelId.__rl | boolean | true | 5 |
| workflows.list.nodes[].parameters.modelId.value | string | gpt-4-turbo, gpt-4o | 5 |
| workflows.list.nodes[].parameters.modelId.mode | string | list | 5 |
| workflows.list.nodes[].parameters.modelId.cachedResultName | string | GPT-4-TURBO, GPT-4O | 5 |
| workflows.list.nodes[].parameters.messages | object | 1 | 5 |
| workflows.list.nodes[].parameters.messages.values | array | 1 | 4 |
| workflows.list.nodes[].parameters.messages.values[].content | string | =# Sistema Esperto Estrazione Dati Fatture

Sei un sistema specializzato nell'estrazione precisa di , =Sei un assistente specializzato nella preparazione dati per Pinecone Vector Database. Elabora il se | 4 |
| workflows.list.nodes[].parameters.jsonOutput | boolean | true | 3 |
| workflows.list.connections.Invoice data extractor | object | 1 | 2 |
| workflows.list.connections.Invoice data extractor.main | array | 1 | 2 |
| workflows.list.connections.Invoice data extractor.main[].0 | object | 3 | 2 |
| workflows.list.connections.Invoice data extractor.main[].0.node | string | JSON Flat | 2 |
| workflows.list.connections.Invoice data extractor.main[].0.type | string | main | 2 |
| workflows.list.connections.Invoice data extractor.main[].0.index | number | 0 | 2 |
| workflows.list.connections.JSON Flat | object | 1 | 4 |
| workflows.list.connections.JSON Flat.main | array | 1 | 4 |
| workflows.list.connections.JSON Flat.main[].0 | object | 3 | 4 |
| workflows.list.connections.JSON Flat.main[].0.node | string | Supabase2, MERGE DI TUTTI I DATI | 4 |
| workflows.list.connections.JSON Flat.main[].0.type | string | main | 4 |
| workflows.list.connections.JSON Flat.main[].0.index | number | 0, 2 | 4 |
| workflows.list.connections.JSON Flat.main[].1 | object | 3 | 3 |
| workflows.list.connections.JSON Flat.main[].1.node | string | Merge4 | 3 |
| workflows.list.connections.JSON Flat.main[].1.type | string | main | 3 |
| workflows.list.connections.JSON Flat.main[].1.index | number | 1 | 3 |
| workflows.list.connections.JSON Flat.main[].2 | object | 3 | 2 |
| workflows.list.connections.JSON Flat.main[].2.node | string | Merge | 2 |
| workflows.list.connections.JSON Flat.main[].2.type | string | main | 2 |
| workflows.list.connections.JSON Flat.main[].2.index | number | 0 | 2 |
| workflows.list.connections.Supabase2 | object | 1 | 3 |
| workflows.list.connections.Supabase2.main | array | 1 | 3 |
| workflows.list.connections.Supabase2.main[].0 | object | 3 | 3 |
| workflows.list.connections.Supabase2.main[].0.node | string | Imposto record_founded (true o false) | 3 |
| workflows.list.connections.Supabase2.main[].0.type | string | main | 3 |
| workflows.list.connections.Supabase2.main[].0.index | number | 0 | 3 |
| workflows.list.connections.Imposto record_founded (true o false) | object | 1 | 3 |
| workflows.list.connections.Imposto record_founded (true o false).main | array | 1 | 3 |
| workflows.list.connections.Imposto record_founded (true o false).main[].0 | object | 3 | 3 |
| workflows.list.connections.Imposto record_founded (true o false).main[].0.node | string | Merge4 | 3 |
| workflows.list.connections.Imposto record_founded (true o false).main[].0.type | string | main | 3 |
| workflows.list.connections.Imposto record_founded (true o false).main[].0.index | number | 0 | 3 |
| workflows.list.connections.Merge4 | object | 1 | 3 |
| workflows.list.connections.Merge4.main | array | 1 | 3 |
| workflows.list.connections.Merge4.main[].0 | object | 3 | 3 |
| workflows.list.connections.Merge4.main[].0.node | string | JSON Flat1, JSON Flat3 | 3 |
| workflows.list.connections.Merge4.main[].0.type | string | main | 3 |
| workflows.list.connections.Merge4.main[].0.index | number | 0 | 3 |
| workflows.list.connections.JSON Flat1 | object | 1 | 2 |
| workflows.list.connections.JSON Flat1.main | array | 1 | 2 |
| workflows.list.connections.JSON Flat1.main[].0 | object | 3 | 2 |
| workflows.list.connections.JSON Flat1.main[].0.node | string | If1 | 2 |
| workflows.list.connections.JSON Flat1.main[].0.type | string | main | 2 |
| workflows.list.connections.JSON Flat1.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Microsoft Outlook.main[].0 | object | 3 | 2 |
| workflows.list.connections.Microsoft Outlook.main[].0.node | string | Carica Fattura PDF | 2 |
| workflows.list.connections.Microsoft Outlook.main[].0.type | string | main | 2 |
| workflows.list.connections.Microsoft Outlook.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Microsoft Outlook.main[].1 | object | 3 | 2 |
| workflows.list.connections.Microsoft Outlook.main[].1.node | string | Microsoft Outlook1, FROM PDF TO TXT | 2 |
| workflows.list.connections.Microsoft Outlook.main[].1.type | string | main | 2 |
| workflows.list.connections.Microsoft Outlook.main[].1.index | number | 0 | 2 |
| workflows.list.connections.Microsoft Outlook.main[].2 | object | 3 | 2 |
| workflows.list.connections.Microsoft Outlook.main[].2.node | string | UPLOAD MISTRAL OCR, Microsoft Outlook1 | 2 |
| workflows.list.connections.Microsoft Outlook.main[].2.type | string | main | 2 |
| workflows.list.connections.Microsoft Outlook.main[].2.index | number | 0 | 2 |
| workflows.list.connections.Estrai Mese | object | 1 | 1 |
| workflows.list.connections.Estrai Mese.main | array | 1 | 1 |
| workflows.list.connections.GET SIGNED URL | object | 1 | 2 |
| workflows.list.connections.GET SIGNED URL.main | array | 1 | 2 |
| workflows.list.connections.GET SIGNED URL.main[].0 | object | 3 | 2 |
| workflows.list.connections.GET SIGNED URL.main[].0.node | string | GET OCR RESULT | 2 |
| workflows.list.connections.GET SIGNED URL.main[].0.type | string | main | 2 |
| workflows.list.connections.GET SIGNED URL.main[].0.index | number | 0 | 2 |
| workflows.list.connections.UPLOAD MISTRAL OCR | object | 1 | 2 |
| workflows.list.connections.UPLOAD MISTRAL OCR.main | array | 1 | 2 |
| workflows.list.connections.UPLOAD MISTRAL OCR.main[].0 | object | 3 | 2 |
| workflows.list.connections.UPLOAD MISTRAL OCR.main[].0.node | string | GET SIGNED URL | 2 |
| workflows.list.connections.UPLOAD MISTRAL OCR.main[].0.type | string | main | 2 |
| workflows.list.connections.UPLOAD MISTRAL OCR.main[].0.index | number | 0 | 2 |
| workflows.list.connections.GET OCR RESULT | object | 1 | 2 |
| workflows.list.connections.GET OCR RESULT.main | array | 1 | 2 |
| workflows.list.connections.GET OCR RESULT.main[].0 | object | 3 | 1 |
| workflows.list.connections.GET OCR RESULT.main[].0.node | string | Clean Data | 1 |
| workflows.list.connections.GET OCR RESULT.main[].0.type | string | main | 1 |
| workflows.list.connections.GET OCR RESULT.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Clean Data | object | 1 | 1 |
| workflows.list.connections.Clean Data.main | array | 1 | 1 |
| workflows.list.connections.Clean Data.main[].0 | object | 3 | 1 |
| workflows.list.connections.Clean Data.main[].0.node | string | Invoice data extractor | 1 |
| workflows.list.connections.Clean Data.main[].0.type | string | main | 1 |
| workflows.list.connections.Clean Data.main[].0.index | number | 0 | 1 |
| workflows.list.nodes[].parameters.options.maxTokens | number | 32768 | 1 |
| workflows.list.nodes[].parameters.mode | string | retrieve-as-tool, insert | 2 |
| workflows.list.nodes[].parameters.toolName | string | Vector | 1 |
| workflows.list.nodes[].parameters.toolDescription | string | Recupera SOLO per: policy aziendali, resi, rimborsi, informazioni generali. 
 | 1 |
| workflows.list.nodes[].parameters.qdrantCollection | object | 4 | 1 |
| workflows.list.nodes[].parameters.qdrantCollection.__rl | boolean | true | 1 |
| workflows.list.nodes[].parameters.qdrantCollection.value | string | Double | 1 |
| workflows.list.nodes[].parameters.qdrantCollection.mode | string | list | 1 |
| workflows.list.nodes[].parameters.qdrantCollection.cachedResultName | string | Double | 1 |
| workflows.list.nodes[].parameters.topK | number | 3, 5 | 3 |
| workflows.list.connections.INFO ORDINI | object | 1 | 4 |
| workflows.list.connections.INFO ORDINI.ai_tool | array | 1 | 4 |
| workflows.list.connections.INFO ORDINI.ai_tool[].0 | object | 3 | 4 |
| workflows.list.connections.INFO ORDINI.ai_tool[].0.node | string | Milena - Assistente GommeGo, MILENA DISPATCHER | 4 |
| workflows.list.connections.INFO ORDINI.ai_tool[].0.type | string | ai_tool | 4 |
| workflows.list.connections.INFO ORDINI.ai_tool[].0.index | number | 0 | 4 |
| workflows.list.connections.Rispondi a mittente | object | 1 | 2 |
| workflows.list.connections.Rispondi a mittente.main | array | 2, 1 | 2 |
| workflows.list.connections.Rispondi a mittente.main[].0 | object | 3 | 2 |
| workflows.list.connections.Rispondi a mittente.main[].0.node | string |  EMAIL DATA COLLECTOR , Merge1 | 2 |
| workflows.list.connections.Rispondi a mittente.main[].0.type | string | main | 2 |
| workflows.list.connections.Rispondi a mittente.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Ricezione Mail | object | 1 | 2 |
| workflows.list.connections.Ricezione Mail.main | array | 1 | 2 |
| workflows.list.connections.Ricezione Mail.main[].0 | object | 3 | 2 |
| workflows.list.connections.Ricezione Mail.main[].0.node | string | Sposta mail, Pulisci Testo | 2 |
| workflows.list.connections.Ricezione Mail.main[].0.type | string | main | 2 |
| workflows.list.connections.Ricezione Mail.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Ricezione Mail.main[].1 | object | 3 | 2 |
| workflows.list.connections.Ricezione Mail.main[].1.node | string | 1 - Clean Data for Agent1, Sposta mail | 2 |
| workflows.list.connections.Ricezione Mail.main[].1.type | string | main | 2 |
| workflows.list.connections.Ricezione Mail.main[].1.index | number | 0 | 2 |
| workflows.list.connections.MERGE DI TUTTI I DATI | object | 1 | 2 |
| workflows.list.connections.MERGE DI TUTTI I DATI.main | array | 1 | 2 |
| workflows.list.connections.MERGE DI TUTTI I DATI.main[].0 | object | 3 | 2 |
| workflows.list.connections.MERGE DI TUTTI I DATI.main[].0.node | string | 1- Firma & Thread Formatter, ✍️ Firma & Thread Formatter | 2 |
| workflows.list.connections.MERGE DI TUTTI I DATI.main[].0.type | string | main | 2 |
| workflows.list.connections.MERGE DI TUTTI I DATI.main[].0.index | number | 0 | 2 |
| workflows.list.connections.MERGE DI TUTTI I DATI.main[].1 | object | 3 | 2 |
| workflows.list.connections.MERGE DI TUTTI I DATI.main[].1.node | string | 2 - Execute Workflow, Execute Workflow | 2 |
| workflows.list.connections.MERGE DI TUTTI I DATI.main[].1.type | string | main | 2 |
| workflows.list.connections.MERGE DI TUTTI I DATI.main[].1.index | number | 0 | 2 |
| workflows.list.connections.Formatta risposta | object | 1 | 1 |
| workflows.list.connections.Formatta risposta.ai_outputParser | array | 1 | 1 |
| workflows.list.connections.Formatta risposta.ai_outputParser[].0 | object | 3 | 1 |
| workflows.list.connections.Formatta risposta.ai_outputParser[].0.node | string | Milena - Assistente GommeGo | 1 |
| workflows.list.connections.Formatta risposta.ai_outputParser[].0.type | string | ai_outputParser | 1 |
| workflows.list.connections.Formatta risposta.ai_outputParser[].0.index | number | 0 | 1 |
| workflows.list.connections.1- Firma & Thread Formatter | object | 1 | 1 |
| workflows.list.connections.1- Firma & Thread Formatter.main | array | 1 | 1 |
| workflows.list.connections.1- Firma & Thread Formatter.main[].0 | object | 3 | 1 |
| workflows.list.connections.1- Firma & Thread Formatter.main[].0.node | string | Rispondi a mittente | 1 |
| workflows.list.connections.1- Firma & Thread Formatter.main[].0.type | string | main | 1 |
| workflows.list.connections.1- Firma & Thread Formatter.main[].0.index | number | 0 | 1 |
| workflows.list.connections.1 - Clean Data for Agent1 | object | 1 | 1 |
| workflows.list.connections.1 - Clean Data for Agent1.main | array | 1 | 1 |
| workflows.list.connections.1 - Clean Data for Agent1.main[].0 | object | 3 | 1 |
| workflows.list.connections.1 - Clean Data for Agent1.main[].0.node | string | Milena - Assistente GommeGo | 1 |
| workflows.list.connections.1 - Clean Data for Agent1.main[].0.type | string | main | 1 |
| workflows.list.connections.1 - Clean Data for Agent1.main[].0.index | number | 0 | 1 |
| workflows.list.connections.1 - Clean Data for Agent1.main[].1 | object | 3 | 1 |
| workflows.list.connections.1 - Clean Data for Agent1.main[].1.node | string | MERGE DI TUTTI I DATI | 1 |
| workflows.list.connections.1 - Clean Data for Agent1.main[].1.type | string | main | 1 |
| workflows.list.connections.1 - Clean Data for Agent1.main[].1.index | number | 1 | 1 |
| workflows.list.connections.Milena - Assistente GommeGo | object | 1 | 1 |
| workflows.list.connections.Milena - Assistente GommeGo.main | array | 1 | 1 |
| workflows.list.connections.Milena - Assistente GommeGo.main[].0 | object | 3 | 1 |
| workflows.list.connections.Milena - Assistente GommeGo.main[].0.node | string | MERGE DI TUTTI I DATI | 1 |
| workflows.list.connections.Milena - Assistente GommeGo.main[].0.type | string | main | 1 |
| workflows.list.connections.Milena - Assistente GommeGo.main[].0.index | number | 0 | 1 |
| workflows.list.connections.2 - Execute Workflow | object | 1 | 1 |
| workflows.list.connections.2 - Execute Workflow.main | array | 1 | 1 |
| workflows.list.connections. SUPABASE INSERT | object | 1 | 1 |
| workflows.list.connections. SUPABASE INSERT.main | array | 2 | 1 |
| workflows.list.connections. SUPABASE INSERT.main[].0 | object | 3 | 1 |
| workflows.list.connections. SUPABASE INSERT.main[].0.node | string | SUCCESS LOG | 1 |
| workflows.list.connections. SUPABASE INSERT.main[].0.type | string | main | 1 |
| workflows.list.connections. SUPABASE INSERT.main[].0.index | number | 0 | 1 |
| workflows.list.connections. EMAIL DATA COLLECTOR  | object | 1 | 1 |
| workflows.list.connections. EMAIL DATA COLLECTOR .main | array | 1 | 1 |
| workflows.list.connections. EMAIL DATA COLLECTOR .main[].0 | object | 3 | 1 |
| workflows.list.connections. EMAIL DATA COLLECTOR .main[].0.node | string |  SUPABASE INSERT | 1 |
| workflows.list.connections. EMAIL DATA COLLECTOR .main[].0.type | string | main | 1 |
| workflows.list.connections. EMAIL DATA COLLECTOR .main[].0.index | number | 0 | 1 |
| workflows.list.connections.SUCCESS LOG | object | 1 | 1 |
| workflows.list.connections.SUCCESS LOG.main | array | 1 | 1 |
| workflows.list.connections.Form Assistenza GommeGo | object | 1 | 2 |
| workflows.list.connections.Form Assistenza GommeGo.main | array | 1 | 2 |
| workflows.list.connections.Form Assistenza GommeGo.main[].0 | object | 3 | 2 |
| workflows.list.connections.Form Assistenza GommeGo.main[].0.node | string | Processa Dati Form, Form | 2 |
| workflows.list.connections.Form Assistenza GommeGo.main[].0.type | string | main | 2 |
| workflows.list.connections.Form Assistenza GommeGo.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Processa Dati Form | object | 1 | 1 |
| workflows.list.connections.Processa Dati Form.main | array | 1 | 1 |
| workflows.list.staticData.node:Microsoft Outlook Trigger | object | 1 | 2 |
| workflows.list.staticData.node:Microsoft Outlook Trigger.lastTimeChecked | string | 2025-05-24T14:52:05.004+02:00 | 2 |
| workflows.list.staticData.node:Ricezione Mail | object | 1 | 1 |
| workflows.list.staticData.node:Ricezione Mail.lastTimeChecked | string | 2025-08-12T10:44:23.002+02:00 | 1 |
| workflows.list.nodes[].parameters.requestMethod | string | POST | 1 |
| workflows.list.nodes[].parameters.jsonParameters | boolean | true | 1 |
| workflows.list.nodes[].parameters.bodyParametersJson | string | ={
  "shipments": [
    {
      "trackingId": "{{ $json.trackingId }}",
      "destinationCountry":  | 1 |
| workflows.list.connections.HTTP Request (POST Tracking)1 | object | 1 | 3 |
| workflows.list.connections.HTTP Request (POST Tracking)1.main | array | 1 | 3 |
| workflows.list.connections.HTTP Request (POST Tracking)1.main[].0 | object | 3 | 3 |
| workflows.list.connections.HTTP Request (POST Tracking)1.main[].0.node | string | If, If1 | 3 |
| workflows.list.connections.HTTP Request (POST Tracking)1.main[].0.type | string | main | 3 |
| workflows.list.connections.HTTP Request (POST Tracking)1.main[].0.index | number | 0 | 3 |
| workflows.list.connections.HTTP Request (GET Tracking Status)1 | object | 1 | 3 |
| workflows.list.connections.HTTP Request (GET Tracking Status)1.main | array | 1 | 3 |
| workflows.list.connections.Function (Format Response)1 | object | 1 | 1 |
| workflows.list.connections.Function (Format Response)1.main | array | 1 | 1 |
| workflows.list.connections.Webhook Start | object | 1 | 1 |
| workflows.list.connections.Webhook Start.main | array | 1 | 1 |
| workflows.list.connections.When Executed by Another Workflow | object | 1 | 8 |
| workflows.list.connections.When Executed by Another Workflow.main | array | 1 | 8 |
| workflows.list.connections.When Executed by Another Workflow.main[].0 | object | 3 | 7 |
| workflows.list.connections.When Executed by Another Workflow.main[].0.node | string | Pulisce Dati, Pulisci codice1 | 7 |
| workflows.list.connections.When Executed by Another Workflow.main[].0.type | string | main | 7 |
| workflows.list.connections.When Executed by Another Workflow.main[].0.index | number | 0 | 7 |
| workflows.list.connections.Wait (10 seconds) | object | 1 | 3 |
| workflows.list.connections.Wait (10 seconds).main | array | 1 | 3 |
| workflows.list.connections.Wait (10 seconds).main[].0 | object | 3 | 3 |
| workflows.list.connections.Wait (10 seconds).main[].0.node | string | HTTP Request (GET Tracking Status)1 | 3 |
| workflows.list.connections.Wait (10 seconds).main[].0.type | string | main | 3 |
| workflows.list.connections.Wait (10 seconds).main[].0.index | number | 0 | 3 |
| workflows.list.connections.Pulisce Dati | object | 1 | 1 |
| workflows.list.connections.Pulisce Dati.main | array | 1 | 1 |
| workflows.list.connections.Pulisce Dati.main[].0 | object | 3 | 1 |
| workflows.list.connections.Pulisce Dati.main[].0.node | string | Input: Tracking Details | 1 |
| workflows.list.connections.Pulisce Dati.main[].0.type | string | main | 1 |
| workflows.list.connections.Pulisce Dati.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Input: Tracking Details | object | 1 | 3 |
| workflows.list.connections.Input: Tracking Details.main | array | 1 | 3 |
| workflows.list.connections.Input: Tracking Details.main[].0 | object | 3 | 3 |
| workflows.list.connections.Input: Tracking Details.main[].0.node | string | HTTP Request (POST Tracking)1 | 3 |
| workflows.list.connections.Input: Tracking Details.main[].0.type | string | main | 3 |
| workflows.list.connections.Input: Tracking Details.main[].0.index | number | 0 | 3 |
| workflows.list.nodes[].parameters.documentId | object | 5 | 1 |
| workflows.list.nodes[].parameters.documentId.__rl | boolean | true | 1 |
| workflows.list.nodes[].parameters.documentId.value | string | 1i56iOrLIeAeBYGY6c96UuBiLWMWTczm7VQ3apBKx42A | 1 |
| workflows.list.nodes[].parameters.documentId.mode | string | list | 1 |
| workflows.list.nodes[].parameters.documentId.cachedResultName | string | Ordini T24 | 1 |
| workflows.list.nodes[].parameters.documentId.cachedResultUrl | string | https://docs.google.com/spreadsheets/d/1i56iOrLIeAeBYGY6c96UuBiLWMWTczm7VQ3apBKx42A/edit?usp=drivesd | 1 |
| workflows.list.nodes[].parameters.sheetName | object | 5 | 1 |
| workflows.list.nodes[].parameters.sheetName.__rl | boolean | true | 1 |
| workflows.list.nodes[].parameters.sheetName.value | string | gid=0 | 1 |
| workflows.list.nodes[].parameters.sheetName.mode | string | list | 1 |
| workflows.list.nodes[].parameters.sheetName.cachedResultName | string | Foglio1 | 1 |
| workflows.list.nodes[].parameters.sheetName.cachedResultUrl | string | https://docs.google.com/spreadsheets/d/1i56iOrLIeAeBYGY6c96UuBiLWMWTczm7VQ3apBKx42A/edit#gid=0 | 1 |
| workflows.list.nodes[].parameters.columns | object | 6 | 1 |
| workflows.list.nodes[].parameters.columns.mappingMode | string | defineBelow | 1 |
| workflows.list.nodes[].parameters.columns.value | object | 15 | 1 |
| workflows.list.nodes[].parameters.columns.value.Numero Ordine | string | ={{ $json['Numero Ordine'] }} | 1 |
| workflows.list.nodes[].parameters.columns.value.Numero di Riferimento | string | ={{ $json['Numero di Riferimento'] }} | 1 |
| workflows.list.nodes[].parameters.columns.value.Prodotto   | string | ={{ $json.Prodotto }} | 1 |
| workflows.list.nodes[].parameters.columns.value.Prezzo Unitario  | string | ={{ $json['Prezzo Unitario'] }} | 1 |
| workflows.list.nodes[].parameters.columns.value.Totale Ordine | string | ={{ $json['Totale Ordine'] }} | 1 |
| workflows.list.nodes[].parameters.columns.value.Prezzo Complessivo   | string | ={{ $json['Prezzo Complessivo'] }} | 1 |
| workflows.list.nodes[].parameters.columns.value.Destinatario  | string | ={{ $json.Destinatario }} | 1 |
| workflows.list.nodes[].parameters.columns.value.Indirizzo Destinatario   | string | ={{ $json['Indirizzo Destinatario'] }} | 1 |
| workflows.list.nodes[].parameters.columns.value.Data di Consegna Stimata | string | ={{ $json['Data di Consegna Stimata'] }} | 1 |
| workflows.list.nodes[].parameters.columns.value.Telefono Destinatario  | string | ={{ $json['Telefono Destinatario'] }} | 1 |
| workflows.list.nodes[].parameters.columns.value.Fornitore | string | ={{ $json.Fornitore }} | 1 |
| workflows.list.nodes[].parameters.columns.value.Indirizzo Fornitore | string | ={{ $json['Indirizzo Fornitore'] }} | 1 |
| workflows.list.nodes[].parameters.columns.value.Email fornitore | string | ={{ $json['Email Fornitore'] }} | 1 |
| workflows.list.nodes[].parameters.columns.value.Telefono Fornitore | string | ={{ $json['Telefono Fornitore'] }} | 1 |
| workflows.list.nodes[].parameters.columns.value.Data ordine | string | ={{ $json['Data Ordine'] }} | 1 |
| workflows.list.nodes[].parameters.columns.matchingColumns | array | 1 | 1 |
| workflows.list.nodes[].parameters.columns.schema | array | 16 | 1 |
| workflows.list.nodes[].parameters.columns.schema[].id | string | Numero Ordine, Numero di Riferimento | 3 |
| workflows.list.nodes[].parameters.columns.schema[].displayName | string | Numero Ordine, Numero di Riferimento | 3 |
| workflows.list.nodes[].parameters.columns.schema[].required | boolean | false | 3 |
| workflows.list.nodes[].parameters.columns.schema[].defaultMatch | boolean | false | 3 |
| workflows.list.nodes[].parameters.columns.schema[].display | boolean | true | 3 |
| workflows.list.nodes[].parameters.columns.schema[].type | string | string | 3 |
| workflows.list.nodes[].parameters.columns.schema[].canBeUsedToMatch | boolean | true | 3 |
| workflows.list.nodes[].parameters.columns.schema[].removed | boolean | false | 3 |
| workflows.list.nodes[].parameters.columns.attemptToConvertTypes | boolean | false | 1 |
| workflows.list.nodes[].parameters.columns.convertFieldsToString | boolean | false | 1 |
| workflows.list.nodes[].parameters.rule.interval[].secondsInterval | number | 60 | 1 |
| workflows.list.connections.Excel DB | object | 1 | 1 |
| workflows.list.connections.Excel DB.main | array | 1 | 1 |
| workflows.list.connections.GRAB MAIL FROM ORDINI | object | 1 | 1 |
| workflows.list.connections.GRAB MAIL FROM ORDINI.main | array | 1 | 1 |
| workflows.list.connections.GRAB MAIL FROM ORDINI.main[].0 | object | 3 | 1 |
| workflows.list.connections.GRAB MAIL FROM ORDINI.main[].0.node | string | Loop Over Items | 1 |
| workflows.list.connections.GRAB MAIL FROM ORDINI.main[].0.type | string | main | 1 |
| workflows.list.connections.GRAB MAIL FROM ORDINI.main[].0.index | number | 0 | 1 |
| workflows.list.connections.HTML TO TEXT | object | 1 | 2 |
| workflows.list.connections.HTML TO TEXT.main | array | 1 | 2 |
| workflows.list.connections.HTML TO TEXT.main[].0 | object | 3 | 2 |
| workflows.list.connections.HTML TO TEXT.main[].0.node | string | EXTRACTOR, OpenAI | 2 |
| workflows.list.connections.HTML TO TEXT.main[].0.type | string | main | 2 |
| workflows.list.connections.HTML TO TEXT.main[].0.index | number | 0 | 2 |
| workflows.list.connections.EXTRACTOR | object | 1 | 1 |
| workflows.list.connections.EXTRACTOR.main | array | 1 | 1 |
| workflows.list.connections.EXTRACTOR.main[].0 | object | 3 | 1 |
| workflows.list.connections.EXTRACTOR.main[].0.node | string | Excel DB1 | 1 |
| workflows.list.connections.EXTRACTOR.main[].0.type | string | main | 1 |
| workflows.list.connections.EXTRACTOR.main[].0.index | number | 0 | 1 |
| workflows.list.connections.ESEGUI LA SUCCESSIVA | object | 1 | 1 |
| workflows.list.connections.ESEGUI LA SUCCESSIVA.main | array | 1 | 1 |
| workflows.list.connections.ESEGUI LA SUCCESSIVA.main[].0 | object | 3 | 1 |
| workflows.list.connections.ESEGUI LA SUCCESSIVA.main[].0.node | string | Loop Over Items | 1 |
| workflows.list.connections.ESEGUI LA SUCCESSIVA.main[].0.type | string | main | 1 |
| workflows.list.connections.ESEGUI LA SUCCESSIVA.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Excel DB1 | object | 1 | 1 |
| workflows.list.connections.Excel DB1.main | array | 1 | 1 |
| workflows.list.connections.Excel DB1.main[].0 | object | 3 | 1 |
| workflows.list.connections.Excel DB1.main[].0.node | string | Wait | 1 |
| workflows.list.connections.Excel DB1.main[].0.type | string | main | 1 |
| workflows.list.connections.Excel DB1.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Wait.main[].0 | object | 3 | 1 |
| workflows.list.connections.Wait.main[].0.node | string | UPSERT SUPABASE | 1 |
| workflows.list.connections.Wait.main[].0.type | string | main | 1 |
| workflows.list.connections.Wait.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Supabase.main | array | 1 | 1 |
| workflows.list.connections.UPSERT SUPABASE | object | 1 | 1 |
| workflows.list.connections.UPSERT SUPABASE.main | array | 1 | 1 |
| workflows.list.connections.UPSERT SUPABASE.main[].0 | object | 3 | 1 |
| workflows.list.connections.UPSERT SUPABASE.main[].0.node | string | ESEGUI LA SUCCESSIVA | 1 |
| workflows.list.connections.UPSERT SUPABASE.main[].0.type | string | main | 1 |
| workflows.list.connections.UPSERT SUPABASE.main[].0.index | number | 0 | 1 |
| workflows.list.nodes[].parameters.formFields.values[].placeholder | string | tua-email@esempio.com, Mario Rossi | 3 |
| workflows.list.nodes[].parameters.formFields.values[].fieldOptions | object | 1 | 1 |
| workflows.list.nodes[].parameters.options.buttonLabel | string | Invia Richiesta | 1 |
| workflows.list.nodes[].parameters.options.respondWithOptions | object | 1 | 1 |
| workflows.list.nodes[].parameters.options.respondWithOptions.values | object | 1 | 1 |
| workflows.list.nodes[].parameters.options.customCss | string | :root {
	--font-family: 'Open Sans', sans-serif;
	--font-weight-normal: 400;
	--font-weight-bold: 60 | 1 |
| workflows.list.connections.Form 1: Assistenza Ordini | object | 1 | 1 |
| workflows.list.connections.Form 1: Assistenza Ordini.main | array | 1 | 1 |
| workflows.list.connections.Form 1: Assistenza Ordini.main[].0 | object | 3 | 1 |
| workflows.list.connections.Form 1: Assistenza Ordini.main[].0.node | string | Processa Dati Unificati | 1 |
| workflows.list.connections.Form 1: Assistenza Ordini.main[].0.type | string | main | 1 |
| workflows.list.connections.Form 1: Assistenza Ordini.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Form 2: Informazioni Generali | object | 1 | 1 |
| workflows.list.connections.Form 2: Informazioni Generali.main | array | 1 | 1 |
| workflows.list.connections.Form 2: Informazioni Generali.main[].0 | object | 3 | 1 |
| workflows.list.connections.Form 2: Informazioni Generali.main[].0.node | string | Processa Dati Unificati | 1 |
| workflows.list.connections.Form 2: Informazioni Generali.main[].0.type | string | main | 1 |
| workflows.list.connections.Form 2: Informazioni Generali.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Form 3: Richieste Urgenti | object | 1 | 1 |
| workflows.list.connections.Form 3: Richieste Urgenti.main | array | 1 | 1 |
| workflows.list.connections.Form 3: Richieste Urgenti.main[].0 | object | 3 | 1 |
| workflows.list.connections.Form 3: Richieste Urgenti.main[].0.node | string | Processa Dati Unificati | 1 |
| workflows.list.connections.Form 3: Richieste Urgenti.main[].0.type | string | main | 1 |
| workflows.list.connections.Form 3: Richieste Urgenti.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Processa Dati Unificati | object | 1 | 1 |
| workflows.list.connections.Processa Dati Unificati.main | array | 1 | 1 |
| workflows.list.connections.Webhook Form GommeGo | object | 1 | 1 |
| workflows.list.connections.Webhook Form GommeGo.main | array | 1 | 1 |
| workflows.list.connections.Webhook Form GommeGo.main[].0 | object | 3 | 1 |
| workflows.list.connections.Webhook Form GommeGo.main[].0.node | string | Verifica reCAPTCHA | 1 |
| workflows.list.connections.Webhook Form GommeGo.main[].0.type | string | main | 1 |
| workflows.list.connections.Webhook Form GommeGo.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Verifica reCAPTCHA | object | 1 | 1 |
| workflows.list.connections.Verifica reCAPTCHA.main | array | 1 | 1 |
| workflows.list.connections.Verifica reCAPTCHA.main[].0 | object | 3 | 1 |
| workflows.list.connections.Verifica reCAPTCHA.main[].0.node | string | Processa Dati se Valido | 1 |
| workflows.list.connections.Verifica reCAPTCHA.main[].0.type | string | main | 1 |
| workflows.list.connections.Verifica reCAPTCHA.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Processa Dati se Valido | object | 1 | 1 |
| workflows.list.connections.Processa Dati se Valido.main | array | 1 | 1 |
| workflows.list.connections.Processa Dati se Valido.main[].0 | object | 3 | 1 |
| workflows.list.connections.Processa Dati se Valido.main[].0.node | string | COLLEGA A CHATBOT_MAIL__SIMPLE | 1 |
| workflows.list.connections.Processa Dati se Valido.main[].0.type | string | main | 1 |
| workflows.list.connections.Processa Dati se Valido.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Processa Dati se Valido.main[].1 | object | 3 | 1 |
| workflows.list.connections.Processa Dati se Valido.main[].1.node | string | Risposta Successo | 1 |
| workflows.list.connections.Processa Dati se Valido.main[].1.type | string | main | 1 |
| workflows.list.connections.Processa Dati se Valido.main[].1.index | number | 0 | 1 |
| workflows.list.nodes[].parameters.pineconeIndex | object | 4 | 1 |
| workflows.list.nodes[].parameters.pineconeIndex.__rl | boolean | true | 1 |
| workflows.list.nodes[].parameters.pineconeIndex.value | string | documents-kb | 1 |
| workflows.list.nodes[].parameters.pineconeIndex.mode | string | list | 1 |
| workflows.list.nodes[].parameters.pineconeIndex.cachedResultName | string | documents-kb | 1 |
| workflows.list.nodes[].parameters.embeddingBatchSize | number | 100 | 1 |
| workflows.list.nodes[].parameters.options.pineconeNamespace | string | N/A | 1 |
| workflows.list.connections.Pinecone Clean & Metadata Optimizer | object | 1 | 1 |
| workflows.list.connections.Pinecone Clean & Metadata Optimizer.main | array | 1 | 1 |
| workflows.list.connections.Pinecone Clean & Metadata Optimizer.main[].0 | object | 3 | 1 |
| workflows.list.connections.Pinecone Clean & Metadata Optimizer.main[].0.node | string | Pinecone Vector Store | 1 |
| workflows.list.connections.Pinecone Clean & Metadata Optimizer.main[].0.type | string | main | 1 |
| workflows.list.connections.Pinecone Clean & Metadata Optimizer.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Pinecone Vector Store.main | array | 1 | 2 |
| workflows.list.connections.Pinecone Vector Store.main[].0 | object | 3 | 1 |
| workflows.list.connections.Pinecone Vector Store.main[].0.node | string | Monitor Inserimento | 1 |
| workflows.list.connections.Pinecone Vector Store.main[].0.type | string | main | 1 |
| workflows.list.connections.Pinecone Vector Store.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Recursive Character Text Splitter | object | 1 | 1 |
| workflows.list.connections.Recursive Character Text Splitter.ai_textSplitter | array | 1 | 1 |
| workflows.list.connections.Recursive Character Text Splitter.ai_textSplitter[].0 | object | 3 | 1 |
| workflows.list.connections.Recursive Character Text Splitter.ai_textSplitter[].0.node | string | Default Data Loader | 1 |
| workflows.list.connections.Recursive Character Text Splitter.ai_textSplitter[].0.type | string | ai_textSplitter | 1 |
| workflows.list.connections.Recursive Character Text Splitter.ai_textSplitter[].0.index | number | 0 | 1 |
| workflows.list.nodes[].parameters.method | string | POST | 3 |
| workflows.list.nodes[].parameters.sendHeaders | boolean | true | 2 |
| workflows.list.nodes[].parameters.headerParameters | object | 1 | 2 |
| workflows.list.nodes[].parameters.headerParameters.parameters | array | 1 | 2 |
| workflows.list.nodes[].parameters.headerParameters.parameters[].name | string | Authorization, Content-Type | 2 |
| workflows.list.nodes[].parameters.headerParameters.parameters[].value | string | Bearer ${MISTRAL_API_KEY}, application/json | 2 |
| workflows.list.nodes[].parameters.sendBody | boolean | true | 3 |
| workflows.list.nodes[].parameters.specifyBody | string | json | 3 |
| workflows.list.nodes[].parameters.jsonBody | string | ={
  "model": "mistral-ocr-latest",
  "document": {
    "type": "document_url",
    "document_url": , {
 "filter": {}
} | 3 |
| workflows.list.nodes[].parameters.options.response | object | 1 | 1 |
| workflows.list.nodes[].parameters.options.response.response | object | 1 | 1 |
| workflows.list.nodes[].parameters.sendQuery | boolean | true | 5 |
| workflows.list.nodes[].parameters.queryParameters | object | 1 | 5 |
| workflows.list.nodes[].parameters.queryParameters.parameters | array | 1 | 5 |
| workflows.list.nodes[].parameters.queryParameters.parameters[].name | string | expiry, limit | 5 |
| workflows.list.nodes[].parameters.queryParameters.parameters[].value | string | 24, 1 | 5 |
| workflows.list.nodes[].credentials.mistralCloudApi | object | 2 | 1 |
| workflows.list.nodes[].credentials.mistralCloudApi.id | string | IwB6SJuDF519gYoE | 1 |
| workflows.list.nodes[].credentials.mistralCloudApi.name | string | Mistral Cloud account | 1 |
| workflows.list.connections.📄 Form Caricamento Documento | object | 1 | 1 |
| workflows.list.connections.📄 Form Caricamento Documento.main | array | 1 | 1 |
| workflows.list.connections.Pre Processind DATA | object | 1 | 1 |
| workflows.list.connections.Pre Processind DATA.main | array | 1 | 1 |
| workflows.list.nodes[].parameters.events | array | 1 | 1 |
| workflows.list.nodes[].parameters.sources | array | 1 | 1 |
| workflows.list.nodes[].parameters.responseMode | string | lastNode, responseNode | 3 |
| workflows.list.connections.Webhook | object | 1 | 1 |
| workflows.list.connections.Webhook.main | array | 1 | 1 |
| workflows.list.connections.Webhook.main[].0 | object | 3 | 1 |
| workflows.list.connections.Webhook.main[].0.node | string | Routing | 1 |
| workflows.list.connections.Webhook.main[].0.type | string | main | 1 |
| workflows.list.connections.Webhook.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Routing | object | 1 | 1 |
| workflows.list.connections.Routing.main | array | 1 | 1 |
| workflows.list.connections.Routing.main[].0 | object | 3 | 1 |
| workflows.list.connections.Routing.main[].0.node | string | GET by ID | 1 |
| workflows.list.connections.Routing.main[].0.type | string | main | 1 |
| workflows.list.connections.Routing.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Routing.main[].1 | object | 3 | 1 |
| workflows.list.connections.Routing.main[].1.node | string | GET List | 1 |
| workflows.list.connections.Routing.main[].1.type | string | main | 1 |
| workflows.list.connections.Routing.main[].1.index | number | 0 | 1 |
| workflows.list.connections.GET by ID | object | 1 | 1 |
| workflows.list.connections.GET by ID.main | array | 1 | 1 |
| workflows.list.connections.GET by ID.main[].0 | object | 3 | 1 |
| workflows.list.connections.GET by ID.main[].0.node | string | Clean by ID | 1 |
| workflows.list.connections.GET by ID.main[].0.type | string | main | 1 |
| workflows.list.connections.GET by ID.main[].0.index | number | 0 | 1 |
| workflows.list.connections.GET List | object | 1 | 1 |
| workflows.list.connections.GET List.main | array | 1 | 1 |
| workflows.list.connections.GET List.main[].0 | object | 3 | 1 |
| workflows.list.connections.GET List.main[].0.node | string | Clean List | 1 |
| workflows.list.connections.GET List.main[].0.type | string | main | 1 |
| workflows.list.connections.GET List.main[].0.index | number | 0 | 1 |
| workflows.list.connections.GET List.main[].1 | object | 3 | 1 |
| workflows.list.connections.GET List.main[].1.node | string | Filter FormTrigger | 1 |
| workflows.list.connections.GET List.main[].1.type | string | main | 1 |
| workflows.list.connections.GET List.main[].1.index | number | 0 | 1 |
| workflows.list.connections.GET List.main[].2 | object | 3 | 1 |
| workflows.list.connections.GET List.main[].2.node | string | Search by Name | 1 |
| workflows.list.connections.GET List.main[].2.type | string | main | 1 |
| workflows.list.connections.GET List.main[].2.index | number | 0 | 1 |
| workflows.list.nodes[].parameters.inputSource | string | passthrough, jsonExample | 4 |
| workflows.list.connections.🔄 Workflow Trigger | object | 1 | 1 |
| workflows.list.connections.🔄 Workflow Trigger.main | array | 1 | 1 |
| workflows.list.connections.🔄 Workflow Trigger.main[].0 | object | 3 | 1 |
| workflows.list.connections.🔄 Workflow Trigger.main[].0.node | string | 📋 Data Mapper | 1 |
| workflows.list.connections.🔄 Workflow Trigger.main[].0.type | string | main | 1 |
| workflows.list.connections.🔄 Workflow Trigger.main[].0.index | number | 0 | 1 |
| workflows.list.connections.📋 Data Mapper | object | 1 | 1 |
| workflows.list.connections.📋 Data Mapper.main | array | 1 | 1 |
| workflows.list.connections.📋 Data Mapper.main[].0 | object | 3 | 1 |
| workflows.list.connections.📋 Data Mapper.main[].0.node | string | 🔍 Conversation Analyzer | 1 |
| workflows.list.connections.📋 Data Mapper.main[].0.type | string | main | 1 |
| workflows.list.connections.📋 Data Mapper.main[].0.index | number | 0 | 1 |
| workflows.list.connections.🧠 Conversation Analyzer LLM.ai_languageModel[].0 | object | 3 | 1 |
| workflows.list.connections.🧠 Conversation Analyzer LLM.ai_languageModel[].0.node | string | 🔍 Conversation Analyzer | 1 |
| workflows.list.connections.🧠 Conversation Analyzer LLM.ai_languageModel[].0.type | string | ai_languageModel | 1 |
| workflows.list.connections.🧠 Conversation Analyzer LLM.ai_languageModel[].0.index | number | 0 | 1 |
| workflows.list.connections.🔍 Conversation Analyzer | object | 1 | 1 |
| workflows.list.connections.🔍 Conversation Analyzer.main | array | 1 | 1 |
| workflows.list.connections.🔍 Conversation Analyzer.main[].0 | object | 3 | 1 |
| workflows.list.connections.🔍 Conversation Analyzer.main[].0.node | string | 🔧 JSON Extractor & Validator | 1 |
| workflows.list.connections.🔍 Conversation Analyzer.main[].0.type | string | main | 1 |
| workflows.list.connections.🔍 Conversation Analyzer.main[].0.index | number | 0 | 1 |
| workflows.list.connections.🔧 JSON Extractor & Validator.main[].0 | object | 3 | 1 |
| workflows.list.connections.🔧 JSON Extractor & Validator.main[].0.node | string | ❓ Should Create Task? | 1 |
| workflows.list.connections.🔧 JSON Extractor & Validator.main[].0.type | string | main | 1 |
| workflows.list.connections.🔧 JSON Extractor & Validator.main[].0.index | number | 0 | 1 |
| workflows.list.connections.⚙️ Enhanced Task Generator LLM.ai_languageModel[].0 | object | 3 | 1 |
| workflows.list.connections.⚙️ Enhanced Task Generator LLM.ai_languageModel[].0.node | string | ⚙️ Enhanced Task Generator | 1 |
| workflows.list.connections.⚙️ Enhanced Task Generator LLM.ai_languageModel[].0.type | string | ai_languageModel | 1 |
| workflows.list.connections.⚙️ Enhanced Task Generator LLM.ai_languageModel[].0.index | number | 0 | 1 |
| workflows.list.connections.⚙️ Enhanced Task Generator | object | 1 | 1 |
| workflows.list.connections.⚙️ Enhanced Task Generator.main | array | 1 | 1 |
| workflows.list.connections.⚙️ Enhanced Task Generator.main[].0 | object | 3 | 1 |
| workflows.list.connections.⚙️ Enhanced Task Generator.main[].0.node | string | DATA NODE COLLECTOR | 1 |
| workflows.list.connections.⚙️ Enhanced Task Generator.main[].0.type | string | main | 1 |
| workflows.list.connections.⚙️ Enhanced Task Generator.main[].0.index | number | 0 | 1 |
| workflows.list.connections.📊 Final Logging & Summary | object | 1 | 1 |
| workflows.list.connections.📊 Final Logging & Summary.main | array | 1 | 1 |
| workflows.list.connections.💾 Supabase Task Insert | object | 1 | 1 |
| workflows.list.connections.💾 Supabase Task Insert.main | array | 1 | 1 |
| workflows.list.connections.💾 Supabase Task Insert.main[].0 | object | 3 | 1 |
| workflows.list.connections.💾 Supabase Task Insert.main[].0.node | string | ⚡ Urgency Check | 1 |
| workflows.list.connections.💾 Supabase Task Insert.main[].0.type | string | main | 1 |
| workflows.list.connections.💾 Supabase Task Insert.main[].0.index | number | 0 | 1 |
| workflows.list.connections.⚡ Urgency Check | object | 1 | 1 |
| workflows.list.connections.⚡ Urgency Check.main | array | 1 | 1 |
| workflows.list.connections.⚡ Urgency Check.main[].0 | object | 3 | 1 |
| workflows.list.connections.⚡ Urgency Check.main[].0.node | string | 📱 Telegram Critical Alert | 1 |
| workflows.list.connections.⚡ Urgency Check.main[].0.type | string | main | 1 |
| workflows.list.connections.⚡ Urgency Check.main[].0.index | number | 0 | 1 |
| workflows.list.connections.📈 Metrics Data Prep | object | 1 | 1 |
| workflows.list.connections.📈 Metrics Data Prep.main | array | 1 | 1 |
| workflows.list.connections.📈 Metrics Data Prep.main[].0 | object | 3 | 1 |
| workflows.list.connections.📈 Metrics Data Prep.main[].0.node | string | 🔍 Check Today Record | 1 |
| workflows.list.connections.📈 Metrics Data Prep.main[].0.type | string | main | 1 |
| workflows.list.connections.📈 Metrics Data Prep.main[].0.index | number | 0 | 1 |
| workflows.list.connections.🔍 Check Today Record | object | 1 | 1 |
| workflows.list.connections.🔍 Check Today Record.main | array | 1 | 1 |
| workflows.list.connections.🔍 Check Today Record.main[].0 | object | 3 | 1 |
| workflows.list.connections.🔍 Check Today Record.main[].0.node | string | Code | 1 |
| workflows.list.connections.🔍 Check Today Record.main[].0.type | string | main | 1 |
| workflows.list.connections.🔍 Check Today Record.main[].0.index | number | 0 | 1 |
| workflows.list.connections.📅 Record Exists? | object | 1 | 1 |
| workflows.list.connections.📅 Record Exists?.main | array | 2 | 1 |
| workflows.list.connections.📅 Record Exists?.main[].0 | object | 3 | 2 |
| workflows.list.connections.📅 Record Exists?.main[].0.node | string | 🔄 Update Existing, 📝 Supabase Insert | 2 |
| workflows.list.connections.📅 Record Exists?.main[].0.type | string | main | 2 |
| workflows.list.connections.📅 Record Exists?.main[].0.index | number | 0 | 2 |
| workflows.list.connections.🔄 Update Existing | object | 1 | 1 |
| workflows.list.connections.🔄 Update Existing.main | array | 1 | 1 |
| workflows.list.connections.🔄 Update Existing.main[].0 | object | 3 | 1 |
| workflows.list.connections.🔄 Update Existing.main[].0.node | string | 💾 Supabase Update | 1 |
| workflows.list.connections.🔄 Update Existing.main[].0.type | string | main | 1 |
| workflows.list.connections.🔄 Update Existing.main[].0.index | number | 0 | 1 |
| workflows.list.connections.💾 Supabase Update | object | 1 | 1 |
| workflows.list.connections.💾 Supabase Update.main | array | 1 | 1 |
| workflows.list.connections.💾 Supabase Update.main[].0 | object | 3 | 1 |
| workflows.list.connections.💾 Supabase Update.main[].0.node | string | ✅ Success Log | 1 |
| workflows.list.connections.💾 Supabase Update.main[].0.type | string | main | 1 |
| workflows.list.connections.💾 Supabase Update.main[].0.index | number | 0 | 1 |
| workflows.list.connections.📝 Supabase Insert | object | 1 | 1 |
| workflows.list.connections.📝 Supabase Insert.main | array | 1 | 1 |
| workflows.list.connections.📝 Supabase Insert.main[].0 | object | 3 | 1 |
| workflows.list.connections.📝 Supabase Insert.main[].0.node | string | ✅ Success Log | 1 |
| workflows.list.connections.📝 Supabase Insert.main[].0.type | string | main | 1 |
| workflows.list.connections.📝 Supabase Insert.main[].0.index | number | 0 | 1 |
| workflows.list.connections.📋 No Task Logging | object | 1 | 1 |
| workflows.list.connections.📋 No Task Logging.main | array | 1 | 1 |
| workflows.list.connections.📋 No Task Logging.main[].0 | object | 3 | 1 |
| workflows.list.connections.📋 No Task Logging.main[].0.node | string | 📈 Metrics Data Prep | 1 |
| workflows.list.connections.📋 No Task Logging.main[].0.type | string | main | 1 |
| workflows.list.connections.📋 No Task Logging.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Pulisci codice | object | 1 | 5 |
| workflows.list.connections.Pulisci codice.main | array | 1 | 5 |
| workflows.list.connections.Ottieni Ordine | object | 1 | 4 |
| workflows.list.connections.Ottieni Ordine.main | array | 2, 1 | 4 |
| workflows.list.connections.Ottieni Ordine.main[].0 | object | 3 | 4 |
| workflows.list.connections.Ottieni Ordine.main[].0.node | string | Verifica Ordine, Verifica ordine | 4 |
| workflows.list.connections.Ottieni Ordine.main[].0.type | string | main | 4 |
| workflows.list.connections.Ottieni Ordine.main[].0.index | number | 0 | 4 |
| workflows.list.connections.Verifica Ordine | object | 1 | 3 |
| workflows.list.connections.Verifica Ordine.main | array | 1 | 3 |
| workflows.list.connections.Verifica Ordine.main[].0 | object | 3 | 3 |
| workflows.list.connections.Verifica Ordine.main[].0.node | string | If | 3 |
| workflows.list.connections.Verifica Ordine.main[].0.type | string | main | 3 |
| workflows.list.connections.Verifica Ordine.main[].0.index | number | 0 | 3 |
| workflows.list.connections.Estrai orderDetails | object | 1 | 3 |
| workflows.list.connections.Estrai orderDetails.main | array | 1 | 3 |
| workflows.list.connections.Estrai orderDetails.main[].0 | object | 3 | 3 |
| workflows.list.connections.Estrai orderDetails.main[].0.node | string | Crea Chiamate | 3 |
| workflows.list.connections.Estrai orderDetails.main[].0.type | string | main | 3 |
| workflows.list.connections.Estrai orderDetails.main[].0.index | number | 0 | 3 |
| workflows.list.connections.Crea Chiamate | object | 1 | 3 |
| workflows.list.connections.Crea Chiamate.main | array | 1 | 3 |
| workflows.list.connections.Crea Chiamate.main[].0 | object | 3 | 3 |
| workflows.list.connections.Crea Chiamate.main[].0.node | string | HTTP x3 dinamico | 3 |
| workflows.list.connections.Crea Chiamate.main[].0.type | string | main | 3 |
| workflows.list.connections.Crea Chiamate.main[].0.index | number | 0 | 3 |
| workflows.list.connections.HTTP x3 dinamico | object | 1 | 3 |
| workflows.list.connections.HTTP x3 dinamico.main | array | 2 | 3 |
| workflows.list.connections.HTTP x3 dinamico.main[].0 | object | 3 | 3 |
| workflows.list.connections.HTTP x3 dinamico.main[].0.node | string | Unisce i campi di tutti i nodi | 3 |
| workflows.list.connections.HTTP x3 dinamico.main[].0.type | string | main | 3 |
| workflows.list.connections.HTTP x3 dinamico.main[].0.index | number | 0 | 3 |
| workflows.list.connections.Unisce i campi di tutti i nodi | object | 1 | 3 |
| workflows.list.connections.Unisce i campi di tutti i nodi.main | array | 1 | 3 |
| workflows.list.connections.Unisce i campi di tutti i nodi.main[].0 | object | 3 | 3 |
| workflows.list.connections.Unisce i campi di tutti i nodi.main[].0.node | string | Parcel esiste?, Clean data x Chatbot | 3 |
| workflows.list.connections.Unisce i campi di tutti i nodi.main[].0.type | string | main | 3 |
| workflows.list.connections.Unisce i campi di tutti i nodi.main[].0.index | number | 0 | 3 |
| workflows.list.connections.Risposta Ordine Non Trovato | object | 1 | 4 |
| workflows.list.connections.Risposta Ordine Non Trovato.main | array | 1 | 4 |
| workflows.list.connections.HTTP Request (GET Tracking Status)1.main[].0 | object | 3 | 2 |
| workflows.list.connections.HTTP Request (GET Tracking Status)1.main[].0.node | string | Clean Data , Clean Data for Agent | 2 |
| workflows.list.connections.HTTP Request (GET Tracking Status)1.main[].0.type | string | main | 2 |
| workflows.list.connections.HTTP Request (GET Tracking Status)1.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Parcel esiste? | object | 1 | 2 |
| workflows.list.connections.Parcel esiste?.main | array | 2 | 2 |
| workflows.list.connections.Parcel esiste?.main[].0 | object | 3 | 4 |
| workflows.list.connections.Parcel esiste?.main[].0.node | string | Edit Fields, Clean data  | 4 |
| workflows.list.connections.Parcel esiste?.main[].0.type | string | main | 4 |
| workflows.list.connections.Parcel esiste?.main[].0.index | number | 0 | 4 |
| workflows.list.connections.Parcel esiste?.main[].1 | object | 3 | 2 |
| workflows.list.connections.Parcel esiste?.main[].1.node | string | Input: Tracking Details | 2 |
| workflows.list.connections.Parcel esiste?.main[].1.type | string | main | 2 |
| workflows.list.connections.Parcel esiste?.main[].1.index | number | 0 | 2 |
| workflows.list.connections.Pulisci codice1 | object | 1 | 2 |
| workflows.list.connections.Pulisci codice1.main | array | 1 | 2 |
| workflows.list.connections.Pulisci codice1.main[].0 | object | 3 | 2 |
| workflows.list.connections.Pulisci codice1.main[].0.node | string | Ottieni Ordine | 2 |
| workflows.list.connections.Pulisci codice1.main[].0.type | string | main | 2 |
| workflows.list.connections.Pulisci codice1.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Clean data  | object | 1 | 1 |
| workflows.list.connections.Clean data .main | array | 1 | 1 |
| workflows.list.connections.Clean data .main[].0 | object | 3 | 1 |
| workflows.list.connections.Clean data .main[].0.node | string | Merge1 | 1 |
| workflows.list.connections.Clean data .main[].0.type | string | main | 1 |
| workflows.list.connections.Clean data .main[].0.index | number | 0 | 1 |
| workflows.list.connections.Clean Data  | object | 1 | 1 |
| workflows.list.connections.Clean Data .main | array | 1 | 1 |
| workflows.list.connections.Clean Data .main[].0 | object | 3 | 1 |
| workflows.list.connections.Clean Data .main[].0.node | string | Merge1 | 1 |
| workflows.list.connections.Clean Data .main[].0.type | string | main | 1 |
| workflows.list.connections.Clean Data .main[].0.index | number | 1 | 1 |
| workflows.list.connections.Final response | object | 1 | 1 |
| workflows.list.connections.Final response.main | array | 1 | 1 |
| workflows.list.nodes[].parameters.conditions.string | array | 1 | 2 |
| workflows.list.nodes[].parameters.conditions.string[].value1 | string | ={{$json["orderFound"]}}, ={{ $json.query.validationToken }} | 2 |
| workflows.list.nodes[].parameters.conditions.string[].value2 | boolean | true | 1 |
| workflows.list.connections.IF | object | 1 | 1 |
| workflows.list.connections.IF.main | array | 2 | 1 |
| workflows.list.connections.IF.main[].0 | object | 3 | 2 |
| workflows.list.connections.IF.main[].0.node | string | Ottieni Cliente, Risposta Ordine Non Trovato | 2 |
| workflows.list.connections.IF.main[].0.type | string | main | 2 |
| workflows.list.connections.IF.main[].0.index | number | 0 | 2 |
| workflows.list.connections.IF.main[].1 | object | 3 | 1 |
| workflows.list.connections.IF.main[].1.node | string | Ottieni Indirizzo Spedizione | 1 |
| workflows.list.connections.IF.main[].1.type | string | main | 1 |
| workflows.list.connections.IF.main[].1.index | number | 0 | 1 |
| workflows.list.connections.IF.main[].2 | object | 3 | 1 |
| workflows.list.connections.IF.main[].2.node | string | Ottieni Storico Ordine | 1 |
| workflows.list.connections.IF.main[].2.type | string | main | 1 |
| workflows.list.connections.IF.main[].2.index | number | 0 | 1 |
| workflows.list.connections.IF.main[].3 | object | 3 | 1 |
| workflows.list.connections.IF.main[].3.node | string | Merge1 | 1 |
| workflows.list.connections.IF.main[].3.type | string | main | 1 |
| workflows.list.connections.IF.main[].3.index | number | 0 | 1 |
| workflows.list.connections.Ottieni Cliente | object | 1 | 1 |
| workflows.list.connections.Ottieni Cliente.main | array | 1 | 1 |
| workflows.list.connections.Ottieni Cliente.main[].0 | object | 3 | 1 |
| workflows.list.connections.Ottieni Cliente.main[].0.node | string | Merge1 | 1 |
| workflows.list.connections.Ottieni Cliente.main[].0.type | string | main | 1 |
| workflows.list.connections.Ottieni Cliente.main[].0.index | number | 2 | 1 |
| workflows.list.connections.Ottieni Indirizzo Spedizione | object | 1 | 1 |
| workflows.list.connections.Ottieni Indirizzo Spedizione.main | array | 1 | 1 |
| workflows.list.connections.Ottieni Indirizzo Spedizione.main[].0 | object | 3 | 1 |
| workflows.list.connections.Ottieni Indirizzo Spedizione.main[].0.node | string | Merge1 | 1 |
| workflows.list.connections.Ottieni Indirizzo Spedizione.main[].0.type | string | main | 1 |
| workflows.list.connections.Ottieni Indirizzo Spedizione.main[].0.index | number | 3 | 1 |
| workflows.list.connections.Risposta Ordine Non Trovato.main[].0 | object | 3 | 2 |
| workflows.list.connections.Risposta Ordine Non Trovato.main[].0.node | string | Merge | 2 |
| workflows.list.connections.Risposta Ordine Non Trovato.main[].0.type | string | main | 2 |
| workflows.list.connections.Risposta Ordine Non Trovato.main[].0.index | number | 1 | 2 |
| workflows.list.connections.Verifica ordine | object | 1 | 1 |
| workflows.list.connections.Verifica ordine.main | array | 1 | 1 |
| workflows.list.connections.Verifica ordine.main[].0 | object | 3 | 1 |
| workflows.list.connections.Verifica ordine.main[].0.node | string | IF | 1 |
| workflows.list.connections.Verifica ordine.main[].0.type | string | main | 1 |
| workflows.list.connections.Verifica ordine.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Ottieni Storico Ordine | object | 1 | 1 |
| workflows.list.connections.Ottieni Storico Ordine.main | array | 1 | 1 |
| workflows.list.connections.Ottieni Storico Ordine.main[].0 | object | 3 | 1 |
| workflows.list.connections.Ottieni Storico Ordine.main[].0.node | string | Merge1 | 1 |
| workflows.list.connections.Ottieni Storico Ordine.main[].0.type | string | main | 1 |
| workflows.list.connections.Ottieni Storico Ordine.main[].0.index | number | 1 | 1 |
| workflows.list.connections.Pulisci codice.main[].0 | object | 3 | 3 |
| workflows.list.connections.Pulisci codice.main[].0.node | string | Ottieni Ordine, RAG AI Agent | 3 |
| workflows.list.connections.Pulisci codice.main[].0.type | string | main | 3 |
| workflows.list.connections.Pulisci codice.main[].0.index | number | 0 | 3 |
| workflows.list.nodes[].parameters.options.joinPages | boolean | true | 2 |
| workflows.list.nodes[].credentials.postgres | object | 2 | 2 |
| workflows.list.nodes[].credentials.postgres.id | string | jBT1O3LaStZrwqsC, 3JqN7cnp8K5WZ58E | 2 |
| workflows.list.nodes[].credentials.postgres.name | string | Postgres Supabase TEC, Postgres account | 2 |
| workflows.list.connections.PDF to Text Converter | object | 1 | 1 |
| workflows.list.connections.PDF to Text Converter.main | array | 1 | 1 |
| workflows.list.connections.PDF to Text Converter.main[].0 | object | 3 | 1 |
| workflows.list.connections.PDF to Text Converter.main[].0.node | string | AI Invoice Data Extractor | 1 |
| workflows.list.connections.PDF to Text Converter.main[].0.type | string | main | 1 |
| workflows.list.connections.PDF to Text Converter.main[].0.index | number | 0 | 1 |
| workflows.list.connections.AI Invoice Data Extractor | object | 1 | 1 |
| workflows.list.connections.AI Invoice Data Extractor.main | array | 1 | 1 |
| workflows.list.connections.AI Invoice Data Extractor.main[].0 | object | 3 | 1 |
| workflows.list.connections.AI Invoice Data Extractor.main[].0.node | string | Data Processor & Validator | 1 |
| workflows.list.connections.AI Invoice Data Extractor.main[].0.type | string | main | 1 |
| workflows.list.connections.AI Invoice Data Extractor.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Supabase UPSERT | object | 1 | 1 |
| workflows.list.connections.Supabase UPSERT.main | array | 1 | 1 |
| workflows.list.connections.Postgres | object | 1 | 1 |
| workflows.list.connections.Postgres.main | array | 1 | 1 |
| workflows.list.connections.Postgres.main[].0 | object | 3 | 1 |
| workflows.list.connections.Postgres.main[].0.node | string | Success Logger & Response | 1 |
| workflows.list.connections.Postgres.main[].0.type | string | main | 1 |
| workflows.list.connections.Postgres.main[].0.index | number | 0 | 1 |
| workflows.list.connections.FROM PDF TO TXT | object | 1 | 1 |
| workflows.list.connections.FROM PDF TO TXT.main | array | 1 | 1 |
| workflows.list.connections.FROM PDF TO TXT.main[].0 | object | 3 | 1 |
| workflows.list.connections.FROM PDF TO TXT.main[].0.node | string | Invoice data extractor | 1 |
| workflows.list.connections.FROM PDF TO TXT.main[].0.type | string | main | 1 |
| workflows.list.connections.FROM PDF TO TXT.main[].0.index | number | 0 | 1 |
| workflows.list.connections.GET_CUSTOMER.ai_tool[].0 | object | 3 | 1 |
| workflows.list.connections.GET_CUSTOMER.ai_tool[].0.node | string | RAG AI Agent | 1 |
| workflows.list.connections.GET_CUSTOMER.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.list.connections.GET_CUSTOMER.ai_tool[].0.index | number | 0 | 1 |
| workflows.list.connections.Get-invoice | object | 1 | 1 |
| workflows.list.connections.Get-invoice.ai_tool | array | 1 | 1 |
| workflows.list.connections.Get-invoice.ai_tool[].0 | object | 3 | 1 |
| workflows.list.connections.Get-invoice.ai_tool[].0.node | string | RAG AI Agent | 1 |
| workflows.list.connections.Get-invoice.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.list.connections.Get-invoice.ai_tool[].0.index | number | 0 | 1 |
| workflows.list.connections.Window Buffer Memory | object | 1, 2 | 2 |
| workflows.list.connections.Window Buffer Memory.ai_memory | array | 1 | 2 |
| workflows.list.connections.Window Buffer Memory.ai_memory[].0 | object | 3 | 2 |
| workflows.list.connections.Window Buffer Memory.ai_memory[].0.node | string | DiagChunk AI Agent, AI Agent | 2 |
| workflows.list.connections.Window Buffer Memory.ai_memory[].0.type | string | ai_memory | 2 |
| workflows.list.connections.Window Buffer Memory.ai_memory[].0.index | number | 0 | 2 |
| workflows.list.connections.Supabase Vector Store | object | 1 | 1 |
| workflows.list.connections.Supabase Vector Store.ai_vectorStore | array | 1 | 1 |
| workflows.list.connections.Supabase Vector Store.ai_vectorStore[].0 | object | 3 | 1 |
| workflows.list.connections.Supabase Vector Store.ai_vectorStore[].0.node | string | Answer questions with a vector store1 | 1 |
| workflows.list.connections.Supabase Vector Store.ai_vectorStore[].0.type | string | ai_vectorStore | 1 |
| workflows.list.connections.Supabase Vector Store.ai_vectorStore[].0.index | number | 0 | 1 |
| workflows.list.connections.Set Chat Input1 | object | 1 | 1 |
| workflows.list.connections.Set Chat Input1.main | array | 1 | 1 |
| workflows.list.connections.Set Chat Input1.main[].0 | object | 3 | 1 |
| workflows.list.connections.Set Chat Input1.main[].0.node | string | DiagChunk AI Agent | 1 |
| workflows.list.connections.Set Chat Input1.main[].0.type | string | main | 1 |
| workflows.list.connections.Set Chat Input1.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Pinecone Vector Store.ai_vectorStore[].0 | object | 3 | 2 |
| workflows.list.connections.Pinecone Vector Store.ai_vectorStore[].0.node | string | Answer questions with a vector store, Vector Store Retriever | 2 |
| workflows.list.connections.Pinecone Vector Store.ai_vectorStore[].0.type | string | ai_vectorStore | 2 |
| workflows.list.connections.Pinecone Vector Store.ai_vectorStore[].0.index | number | 0 | 2 |
| workflows.list.connections.Window Buffer Memory1 | object | 1 | 1 |
| workflows.list.connections.Window Buffer Memory1.ai_memory | array | 1 | 1 |
| workflows.list.connections.Window Buffer Memory1.ai_memory[].0 | object | 3 | 1 |
| workflows.list.connections.Window Buffer Memory1.ai_memory[].0.node | string | DiagChunk | 1 |
| workflows.list.connections.Window Buffer Memory1.ai_memory[].0.type | string | ai_memory | 1 |
| workflows.list.connections.Window Buffer Memory1.ai_memory[].0.index | number | 0 | 1 |
| workflows.list.connections.Set Chat Input | object | 1 | 1 |
| workflows.list.connections.Set Chat Input.main | array | 1 | 1 |
| workflows.list.connections.Set Chat Input.main[].0 | object | 3 | 1 |
| workflows.list.connections.Set Chat Input.main[].0.node | string | DiagChunk | 1 |
| workflows.list.connections.Set Chat Input.main[].0.type | string | main | 1 |
| workflows.list.connections.Set Chat Input.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Window Buffer Memory2 | object | 1 | 1 |
| workflows.list.connections.Window Buffer Memory2.ai_memory | array | 1 | 1 |
| workflows.list.connections.Window Buffer Memory2.ai_memory[].0 | object | 3 | 1 |
| workflows.list.connections.Window Buffer Memory2.ai_memory[].0.node | string | DiagChunk AI Agent1 | 1 |
| workflows.list.connections.Window Buffer Memory2.ai_memory[].0.type | string | ai_memory | 1 |
| workflows.list.connections.Window Buffer Memory2.ai_memory[].0.index | number | 0 | 1 |
| workflows.list.connections.Set Chat Input2 | object | 1 | 1 |
| workflows.list.connections.Set Chat Input2.main | array | 1 | 1 |
| workflows.list.connections.Set Chat Input2.main[].0 | object | 3 | 1 |
| workflows.list.connections.Set Chat Input2.main[].0.node | string | DiagChunk AI Agent1 | 1 |
| workflows.list.connections.Set Chat Input2.main[].0.type | string | main | 1 |
| workflows.list.connections.Set Chat Input2.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Answer questions with a vector store2 | object | 1 | 1 |
| workflows.list.connections.Answer questions with a vector store2.ai_tool | array | 1 | 1 |
| workflows.list.connections.Answer questions with a vector store2.ai_tool[].0 | object | 3 | 1 |
| workflows.list.connections.Answer questions with a vector store2.ai_tool[].0.node | string | DiagChunk AI Agent1 | 1 |
| workflows.list.connections.Answer questions with a vector store2.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.list.connections.Answer questions with a vector store2.ai_tool[].0.index | number | 0 | 1 |
| workflows.list.connections.OpenAI Chat Model5 | object | 1 | 1 |
| workflows.list.connections.OpenAI Chat Model5.ai_languageModel | array | 1 | 1 |
| workflows.list.connections.OpenAI Chat Model5.ai_languageModel[].0 | object | 3 | 1 |
| workflows.list.connections.OpenAI Chat Model5.ai_languageModel[].0.node | string | Answer questions with a vector store2 | 1 |
| workflows.list.connections.OpenAI Chat Model5.ai_languageModel[].0.type | string | ai_languageModel | 1 |
| workflows.list.connections.OpenAI Chat Model5.ai_languageModel[].0.index | number | 0 | 1 |
| workflows.list.connections.Clean data x Chatbot | object | 1 | 2 |
| workflows.list.connections.Clean data x Chatbot.main | array | 1 | 2 |
| workflows.list.connections.Clean data x Chatbot.main[].0 | object | 3 | 2 |
| workflows.list.connections.Clean data x Chatbot.main[].0.node | string | Merge1, Merge | 2 |
| workflows.list.connections.Clean data x Chatbot.main[].0.type | string | main | 2 |
| workflows.list.connections.Clean data x Chatbot.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Clean Data for Agent | object | 1 | 1 |
| workflows.list.connections.Clean Data for Agent.main | array | 1 | 1 |
| workflows.list.connections.Clean Data for Agent.main[].0 | object | 3 | 1 |
| workflows.list.connections.Clean Data for Agent.main[].0.node | string | Merge1 | 1 |
| workflows.list.connections.Clean Data for Agent.main[].0.type | string | main | 1 |
| workflows.list.connections.Clean Data for Agent.main[].0.index | number | 1 | 1 |
| workflows.list.nodes[].parameters.agent | string | openAiFunctionsAgent | 1 |
| workflows.list.connections.GET_DETAIL2.ai_tool[].0 | object | 3 | 2 |
| workflows.list.connections.GET_DETAIL2.ai_tool[].0.node | string | RAG AI Agent, TRACKING | 2 |
| workflows.list.connections.GET_DETAIL2.ai_tool[].0.type | string | ai_tool | 2 |
| workflows.list.connections.GET_DETAIL2.ai_tool[].0.index | number | 0 | 2 |
| workflows.list.nodes[].parameters.sessionIdType | string | customKey | 1 |
| workflows.list.nodes[].parameters.sessionKey | string | ={{ $('WhatsApp Trigger').item.json.messages[0].from }}, ={{ $json.chatId }} | 2 |
| workflows.list.nodes[].parameters.contextWindowLength | number | 20, 10 | 2 |
| workflows.list.connections.Check Input Type | object | 1 | 1 |
| workflows.list.connections.Check Input Type.main | array | 3 | 1 |
| workflows.list.connections.Check Input Type.main[].0 | object | 3 | 3 |
| workflows.list.connections.Check Input Type.main[].0.node | string | Get Audio URL, Get Image URL | 3 |
| workflows.list.connections.Check Input Type.main[].0.type | string | main | 3 |
| workflows.list.connections.Check Input Type.main[].0.index | number | 0 | 3 |
| workflows.list.connections.Get Image URL | object | 1 | 1 |
| workflows.list.connections.Get Image URL.main | array | 1 | 1 |
| workflows.list.connections.Get Image URL.main[].0 | object | 3 | 1 |
| workflows.list.connections.Get Image URL.main[].0.node | string | Download Image | 1 |
| workflows.list.connections.Get Image URL.main[].0.type | string | main | 1 |
| workflows.list.connections.Get Image URL.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Download Image | object | 1 | 1 |
| workflows.list.connections.Download Image.main | array | 1 | 1 |
| workflows.list.connections.Download Image.main[].0 | object | 3 | 1 |
| workflows.list.connections.Download Image.main[].0.node | string | Analyze Image | 1 |
| workflows.list.connections.Download Image.main[].0.type | string | main | 1 |
| workflows.list.connections.Download Image.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Analyze Image | object | 1 | 1 |
| workflows.list.connections.Analyze Image.main | array | 1 | 1 |
| workflows.list.connections.Analyze Image.main[].0 | object | 3 | 1 |
| workflows.list.connections.Analyze Image.main[].0.node | string | Image + Text Prompt | 1 |
| workflows.list.connections.Analyze Image.main[].0.type | string | main | 1 |
| workflows.list.connections.Analyze Image.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Text Only Prompt | object | 1 | 1 |
| workflows.list.connections.Text Only Prompt.main | array | 1 | 1 |
| workflows.list.connections.Text Only Prompt.main[].0 | object | 3 | 1 |
| workflows.list.connections.Text Only Prompt.main[].0.node | string | AI Agent | 1 |
| workflows.list.connections.Text Only Prompt.main[].0.type | string | main | 1 |
| workflows.list.connections.Text Only Prompt.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Image + Text Prompt | object | 1 | 1 |
| workflows.list.connections.Image + Text Prompt.main | array | 1 | 1 |
| workflows.list.connections.Image + Text Prompt.main[].0 | object | 3 | 1 |
| workflows.list.connections.Image + Text Prompt.main[].0.node | string | AI Agent | 1 |
| workflows.list.connections.Image + Text Prompt.main[].0.type | string | main | 1 |
| workflows.list.connections.Image + Text Prompt.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Get Audio URL | object | 1 | 1 |
| workflows.list.connections.Get Audio URL.main | array | 1 | 1 |
| workflows.list.connections.Get Audio URL.main[].0 | object | 3 | 1 |
| workflows.list.connections.Get Audio URL.main[].0.node | string | Download Audio | 1 |
| workflows.list.connections.Get Audio URL.main[].0.type | string | main | 1 |
| workflows.list.connections.Get Audio URL.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Transcribe Audio | object | 1 | 1 |
| workflows.list.connections.Transcribe Audio.main | array | 1 | 1 |
| workflows.list.connections.Transcribe Audio.main[].0 | object | 3 | 1 |
| workflows.list.connections.Transcribe Audio.main[].0.node | string | Audio Prompt | 1 |
| workflows.list.connections.Transcribe Audio.main[].0.type | string | main | 1 |
| workflows.list.connections.Transcribe Audio.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Audio Prompt | object | 1 | 1 |
| workflows.list.connections.Audio Prompt.main | array | 1 | 1 |
| workflows.list.connections.Audio Prompt.main[].0 | object | 3 | 1 |
| workflows.list.connections.Audio Prompt.main[].0.node | string | AI Agent | 1 |
| workflows.list.connections.Audio Prompt.main[].0.type | string | main | 1 |
| workflows.list.connections.Audio Prompt.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Generate Audio | object | 1 | 1 |
| workflows.list.connections.Generate Audio.main | array | 1 | 1 |
| workflows.list.connections.Generate Audio.main[].0 | object | 3 | 1 |
| workflows.list.connections.Generate Audio.main[].0.node | string | Fix Mime Type | 1 |
| workflows.list.connections.Generate Audio.main[].0.type | string | main | 1 |
| workflows.list.connections.Generate Audio.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Fix Mime Type | object | 1 | 1 |
| workflows.list.connections.Fix Mime Type.main | array | 1 | 1 |
| workflows.list.connections.Fix Mime Type.main[].0 | object | 3 | 1 |
| workflows.list.connections.Fix Mime Type.main[].0.node | string | Respond with Audio | 1 |
| workflows.list.connections.Fix Mime Type.main[].0.type | string | main | 1 |
| workflows.list.connections.Fix Mime Type.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Web Search | object | 1 | 1 |
| workflows.list.connections.Web Search.ai_tool | array | 1 | 1 |
| workflows.list.connections.Web Search.ai_tool[].0 | object | 3 | 1 |
| workflows.list.connections.Web Search.ai_tool[].0.node | string | AI Agent | 1 |
| workflows.list.connections.Web Search.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.list.connections.Web Search.ai_tool[].0.index | number | 0 | 1 |
| workflows.list.connections.Calculator | object | 1 | 1 |
| workflows.list.connections.Calculator.ai_tool | array | 1 | 1 |
| workflows.list.connections.Calculator.ai_tool[].0 | object | 3 | 1 |
| workflows.list.connections.Calculator.ai_tool[].0.node | string | AI Agent | 1 |
| workflows.list.connections.Calculator.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.list.connections.Calculator.ai_tool[].0.index | number | 0 | 1 |
| workflows.list.connections.Knowledge Base | object | 1 | 1 |
| workflows.list.connections.Knowledge Base.ai_tool | array | 1 | 1 |
| workflows.list.connections.Knowledge Base.ai_tool[].0 | object | 3 | 1 |
| workflows.list.connections.Knowledge Base.ai_tool[].0.node | string | AI Agent | 1 |
| workflows.list.connections.Knowledge Base.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.list.connections.Knowledge Base.ai_tool[].0.index | number | 0 | 1 |
| workflows.list.connections.MCP Client | object | 1 | 1 |
| workflows.list.connections.MCP Client.ai_tool | array | 1 | 1 |
| workflows.list.connections.MCP Client.ai_tool[].0 | object | 3 | 1 |
| workflows.list.connections.MCP Client.ai_tool[].0.node | string | AI Agent | 1 |
| workflows.list.connections.MCP Client.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.list.connections.MCP Client.ai_tool[].0.index | number | 0 | 1 |
| workflows.list.nodes[].parameters.description | string | Condizioni generali di vendita di GommeGo (TEC SRL), e-commerce di pneumatici. Include: informazioni, [INTENT: info_ordini]

TOOL NAME: INFO ORDINI

Funzione:  
Gestisce tutte le richieste relative a or | 3 |
| workflows.list.nodes[].parameters.fromEmail | string | ={{ $('Email Trigger (IMAP)').item.json.to }} | 1 |
| workflows.list.nodes[].parameters.toEmail | string | ={{ $('Email Trigger (IMAP)').item.json.from }} | 1 |
| workflows.list.nodes[].parameters.subject | string | =Re: {{ $('Email Trigger (IMAP)').item.json.subject }} | 1 |
| workflows.list.connections.Email Summarization Chain.main[].0 | object | 3 | 1 |
| workflows.list.connections.Email Summarization Chain.main[].0.node | string | Email Classifier | 1 |
| workflows.list.connections.Email Summarization Chain.main[].0.type | string | main | 1 |
| workflows.list.connections.Email Summarization Chain.main[].0.index | number | 0 | 1 |
| workflows.list.connections.OpenAI.ai_languageModel | array | 1 | 1 |
| workflows.list.connections.OpenAI.ai_languageModel[].0 | object | 3 | 1 |
| workflows.list.connections.OpenAI.ai_languageModel[].0.node | string | Write email | 1 |
| workflows.list.connections.OpenAI.ai_languageModel[].0.type | string | ai_languageModel | 1 |
| workflows.list.connections.OpenAI.ai_languageModel[].0.index | number | 0 | 1 |
| workflows.list.connections.Lista File | object | 1 | 2 |
| workflows.list.connections.Lista File.main | array | 1 | 2 |
| workflows.list.connections.Lista File.main[].0 | object | 3 | 2 |
| workflows.list.connections.Lista File.main[].0.node | string | Download file | 2 |
| workflows.list.connections.Lista File.main[].0.type | string | main | 2 |
| workflows.list.connections.Lista File.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Download file | object | 1 | 2 |
| workflows.list.connections.Download file.main | array | 1 | 2 |
| workflows.list.nodes[].parameters.inputType | string | base64 | 1 |
| workflows.list.nodes[].parameters.formFields.values[].acceptFileTypes | string | .jpg,.jpeg,.png,.pdf | 1 |
| workflows.list.connections.Form Caricamento Documento | object | 1 | 1 |
| workflows.list.connections.Form Caricamento Documento.main | array | 1 | 1 |
| workflows.list.connections.Form Caricamento Documento.main[].0 | object | 3 | 1 |
| workflows.list.connections.Form Caricamento Documento.main[].0.node | string | Validazione File | 1 |
| workflows.list.connections.Form Caricamento Documento.main[].0.type | string | main | 1 |
| workflows.list.connections.Form Caricamento Documento.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Validazione File.main[].0 | object | 3 | 1 |
| workflows.list.connections.Validazione File.main[].0.node | string | Estrai Testo | 1 |
| workflows.list.connections.Validazione File.main[].0.type | string | main | 1 |
| workflows.list.connections.Validazione File.main[].0.index | number | 0 | 1 |
| workflows.list.connections.🔵 Telegram Trigger | object | 1 | 1 |
| workflows.list.connections.🔵 Telegram Trigger.main | array | 1 | 1 |
| workflows.list.connections.🔵 Telegram Trigger.main[].0 | object | 3 | 1 |
| workflows.list.connections.🔵 Telegram Trigger.main[].0.node | string | 📊 Estrazione Metadati Base | 1 |
| workflows.list.connections.🔵 Telegram Trigger.main[].0.type | string | main | 1 |
| workflows.list.connections.🔵 Telegram Trigger.main[].0.index | number | 0 | 1 |
| workflows.list.connections.📊 Estrazione Metadati Base | object | 1 | 1 |
| workflows.list.connections.📊 Estrazione Metadati Base.main | array | 1 | 1 |
| workflows.list.connections.📊 Estrazione Metadati Base.main[].0 | object | 3 | 1 |
| workflows.list.connections.📊 Estrazione Metadati Base.main[].0.node | string | 🔍 Classificatore Messaggio | 1 |
| workflows.list.connections.📊 Estrazione Metadati Base.main[].0.type | string | main | 1 |
| workflows.list.connections.📊 Estrazione Metadati Base.main[].0.index | number | 0 | 1 |
| workflows.list.connections.🔍 Classificatore Messaggio | object | 1 | 1 |
| workflows.list.connections.🔍 Classificatore Messaggio.main | array | 1 | 1 |
| workflows.list.connections.🔍 Classificatore Messaggio.main[].0 | object | 3 | 1 |
| workflows.list.connections.🔍 Classificatore Messaggio.main[].0.node | string | ✅ Validazione Tipo Supportato | 1 |
| workflows.list.connections.🔍 Classificatore Messaggio.main[].0.type | string | main | 1 |
| workflows.list.connections.🔍 Classificatore Messaggio.main[].0.index | number | 0 | 1 |
| workflows.list.connections.✅ Validazione Tipo Supportato | object | 1 | 1 |
| workflows.list.connections.✅ Validazione Tipo Supportato.main | array | 2 | 1 |
| workflows.list.connections.✅ Validazione Tipo Supportato.main[].0 | object | 3 | 2 |
| workflows.list.connections.✅ Validazione Tipo Supportato.main[].0.node | string | 🎯 Completamento Fase 1, ❌ Gestione Tipo Non Supportato | 2 |
| workflows.list.connections.✅ Validazione Tipo Supportato.main[].0.type | string | main | 2 |
| workflows.list.connections.✅ Validazione Tipo Supportato.main[].0.index | number | 0 | 2 |
| workflows.list.connections.🎯 Completamento Fase 1 | object | 1 | 1 |
| workflows.list.connections.🎯 Completamento Fase 1.main | array | 1 | 1 |
| workflows.list.connections.🎯 Completamento Fase 1.main[].0 | object | 3 | 1 |
| workflows.list.connections.🎯 Completamento Fase 1.main[].0.node | string | ⭕ FINE FASE 1 | 1 |
| workflows.list.connections.🎯 Completamento Fase 1.main[].0.type | string | main | 1 |
| workflows.list.connections.🎯 Completamento Fase 1.main[].0.index | number | 0 | 1 |
| workflows.list.connections.❌ Gestione Tipo Non Supportato | object | 1 | 1 |
| workflows.list.connections.❌ Gestione Tipo Non Supportato.main | array | 1 | 1 |
| workflows.list.connections.❌ Gestione Tipo Non Supportato.main[].0 | object | 3 | 1 |
| workflows.list.connections.❌ Gestione Tipo Non Supportato.main[].0.node | string | ⭕ FINE FASE 1 | 1 |
| workflows.list.connections.❌ Gestione Tipo Non Supportato.main[].0.type | string | main | 1 |
| workflows.list.connections.❌ Gestione Tipo Non Supportato.main[].0.index | number | 0 | 1 |
| workflows.list.nodes[].parameters.workflowId | object | 4 | 3 |
| workflows.list.nodes[].parameters.workflowId.__rl | boolean | true | 3 |
| workflows.list.nodes[].parameters.workflowId.value | string | el9CwyiWMEpfLfFH, djG3L8jYB8VwpDZV | 3 |
| workflows.list.nodes[].parameters.workflowId.mode | string | list | 3 |
| workflows.list.nodes[].parameters.workflowId.cachedResultName | string | CHATBOT COMMERCIALE, SUB_CHATBOT_API_TRACK_OK | 3 |
| workflows.list.nodes[].parameters.workflowInputs | object | 6 | 3 |
| workflows.list.nodes[].parameters.workflowInputs.mappingMode | string | defineBelow | 3 |
| workflows.list.nodes[].parameters.workflowInputs.value | object | 0 | 3 |
| workflows.list.nodes[].parameters.workflowInputs.matchingColumns | array | 0, 1 | 3 |
| workflows.list.nodes[].parameters.workflowInputs.schema | array | 0, 1 | 3 |
| workflows.list.nodes[].parameters.workflowInputs.attemptToConvertTypes | boolean | false | 3 |
| workflows.list.nodes[].parameters.workflowInputs.convertFieldsToString | boolean | false | 3 |
| workflows.list.nodes[].parameters.workflowInputs.schema[].id | string | query | 1 |
| workflows.list.nodes[].parameters.workflowInputs.schema[].displayName | string | query | 1 |
| workflows.list.nodes[].parameters.workflowInputs.schema[].required | boolean | false | 1 |
| workflows.list.nodes[].parameters.workflowInputs.schema[].defaultMatch | boolean | false | 1 |
| workflows.list.nodes[].parameters.workflowInputs.schema[].display | boolean | true | 1 |
| workflows.list.nodes[].parameters.workflowInputs.schema[].canBeUsedToMatch | boolean | true | 1 |
| workflows.list.nodes[].parameters.workflowInputs.schema[].type | string | string | 1 |
| workflows.list.nodes[].parameters.workflowInputs.schema[].removed | boolean | false | 1 |
| workflows.list.connections.COMMERCIALE | object | 1 | 2 |
| workflows.list.connections.COMMERCIALE.ai_tool | array | 1 | 2 |
| workflows.list.connections.AMMINISTRAZIONE | object | 1 | 2 |
| workflows.list.connections.AMMINISTRAZIONE.ai_tool | array | 1 | 2 |
| workflows.list.connections.INFO ORDE | object | 1 | 2 |
| workflows.list.connections.INFO ORDE.ai_tool | array | 1 | 2 |
| workflows.list.connections.Chat Logger | object | 1 | 1 |
| workflows.list.connections.Chat Logger.main | array | 1 | 1 |
| workflows.list.connections.Chat Logger.main[].0 | object | 3 | 1 |
| workflows.list.connections.Chat Logger.main[].0.node | string | Intent Classifier | 1 |
| workflows.list.connections.Chat Logger.main[].0.type | string | main | 1 |
| workflows.list.connections.Chat Logger.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Intent Classifier | object | 1 | 1 |
| workflows.list.connections.Intent Classifier.main | array | 1 | 1 |
| workflows.list.connections.Intent Classifier.main[].0 | object | 3 | 1 |
| workflows.list.connections.Intent Classifier.main[].0.node | string | Sentiment Analyzer | 1 |
| workflows.list.connections.Intent Classifier.main[].0.type | string | main | 1 |
| workflows.list.connections.Intent Classifier.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Sentiment Analyzer | object | 1 | 1 |
| workflows.list.connections.Sentiment Analyzer.main | array | 1 | 1 |
| workflows.list.connections.Sentiment Analyzer.main[].0 | object | 3 | 1 |
| workflows.list.connections.Sentiment Analyzer.main[].0.node | string | MILENA DISPATCHER | 1 |
| workflows.list.connections.Sentiment Analyzer.main[].0.type | string | main | 1 |
| workflows.list.connections.Sentiment Analyzer.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Save Chat Input | object | 1 | 1 |
| workflows.list.connections.Save Chat Input.main | array | 1 | 1 |
| workflows.list.connections.MILENA DISPATCHER | object | 1 | 1 |
| workflows.list.connections.MILENA DISPATCHER.main | array | 1 | 1 |
| workflows.list.connections.MILENA DISPATCHER.main[].0 | object | 3 | 1 |
| workflows.list.connections.MILENA DISPATCHER.main[].0.node | string | Response Logger | 1 |
| workflows.list.connections.MILENA DISPATCHER.main[].0.type | string | main | 1 |
| workflows.list.connections.MILENA DISPATCHER.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Response Logger | object | 1 | 1 |
| workflows.list.connections.Response Logger.main | array | 1 | 1 |
| workflows.list.connections.Response Logger.main[].0 | object | 3 | 1 |
| workflows.list.connections.Response Logger.main[].0.node | string | Performance Tracker | 1 |
| workflows.list.connections.Response Logger.main[].0.type | string | main | 1 |
| workflows.list.connections.Response Logger.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Performance Tracker | object | 1 | 1 |
| workflows.list.connections.Performance Tracker.main | array | 1 | 1 |
| workflows.list.connections.Performance Tracker.main[].0 | object | 3 | 1 |
| workflows.list.connections.Performance Tracker.main[].0.node | string | Anomaly Detector | 1 |
| workflows.list.connections.Performance Tracker.main[].0.type | string | main | 1 |
| workflows.list.connections.Performance Tracker.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Save Interaction | object | 1 | 1 |
| workflows.list.connections.Save Interaction.main | array | 1 | 1 |
| workflows.list.connections.Data Merger | object | 1 | 1 |
| workflows.list.connections.Data Merger.main | array | 1 | 1 |
| workflows.list.connections.Data Merger.main[].0 | object | 3 | 1 |
| workflows.list.connections.Data Merger.main[].0.node | string | Save Analytics (PostgreSQL) | 1 |
| workflows.list.connections.Data Merger.main[].0.type | string | main | 1 |
| workflows.list.connections.Data Merger.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Data Merger.main[].1 | object | 3 | 1 |
| workflows.list.connections.Data Merger.main[].1.node | string | Qdrant Vector Store1 | 1 |
| workflows.list.connections.Data Merger.main[].1.type | string | main | 1 |
| workflows.list.connections.Data Merger.main[].1.index | number | 0 | 1 |
| workflows.list.connections.Anomaly Detector | object | 1 | 1 |
| workflows.list.connections.Anomaly Detector.main | array | 1 | 1 |
| workflows.list.connections.Anomaly Detector.main[].0 | object | 3 | 1 |
| workflows.list.connections.Anomaly Detector.main[].0.node | string | Data Merger | 1 |
| workflows.list.connections.Anomaly Detector.main[].0.type | string | main | 1 |
| workflows.list.connections.Anomaly Detector.main[].0.index | number | 0 | 1 |
| workflows.list.connections.ORDER | object | 1 | 1 |
| workflows.list.connections.ORDER.ai_tool | array | 1 | 1 |
| workflows.list.connections.ORDER.ai_tool[].0 | object | 3 | 1 |
| workflows.list.connections.ORDER.ai_tool[].0.node | string | TRACKING | 1 |
| workflows.list.connections.ORDER.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.list.connections.ORDER.ai_tool[].0.index | number | 0 | 1 |
| workflows.list.connections.CUSTOMER DETAIL | object | 1 | 1 |
| workflows.list.connections.CUSTOMER DETAIL.ai_tool | array | 1 | 1 |
| workflows.list.nodes[].parameters.inputText | string | =Devi classificare le mail in base a questi parametri
{{ $json.isThreadReply }}
{{ $json.mittente }} | 1 |
| workflows.list.nodes[].parameters.categories | object | 1 | 1 |
| workflows.list.nodes[].parameters.categories.categories | array | 8 | 1 |
| workflows.list.nodes[].parameters.categories.categories[].category | string | Info Order, Sales | 3 |
| workflows.list.nodes[].parameters.categories.categories[].description | string | Richiesta Info Ordini, preventivi | 3 |
| workflows.list.nodes[].parameters.options.multiClass | boolean | true | 1 |
| workflows.list.nodes[].parameters.options.fallback | string | other | 1 |
| workflows.list.nodes[].parameters.options.systemPromptTemplate | string | =Classifica il seguente messaggio email in una sola delle seguenti categorie predefinite. Restituisc | 1 |
| workflows.list.nodes[].parameters.options.enableAutoFixing | boolean | true | 1 |
| workflows.list.nodes[].parameters.messages.messageValues | array | 1 | 1 |
| workflows.list.nodes[].parameters.messages.messageValues[].message | string | =Sei un revisore professionista, specializzato nella comunicazione Customer Care, con particolare at | 1 |
| workflows.list.connections.Thread Reply Classifier | object | 1 | 1 |
| workflows.list.connections.Thread Reply Classifier.main | array | 1 | 1 |
| workflows.list.connections.Thread Reply Classifier.main[].0 | object | 3 | 1 |
| workflows.list.connections.Thread Reply Classifier.main[].0.node | string | Merge Email + Classification | 1 |
| workflows.list.connections.Thread Reply Classifier.main[].0.type | string | main | 1 |
| workflows.list.connections.Thread Reply Classifier.main[].0.index | number | 1 | 1 |
| workflows.list.connections.Merge Email + Classification | object | 1 | 1 |
| workflows.list.connections.Merge Email + Classification.main | array | 1 | 1 |
| workflows.list.connections.Merge Email + Classification.main[].0 | object | 3 | 1 |
| workflows.list.connections.Merge Email + Classification.main[].0.node | string | Estrae tipo di interazione | 1 |
| workflows.list.connections.Merge Email + Classification.main[].0.type | string | main | 1 |
| workflows.list.connections.Merge Email + Classification.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Write email1 | object | 1 | 1 |
| workflows.list.connections.Write email1.main | array | 1 | 1 |
| workflows.list.connections.Write email1.main[].0 | object | 3 | 1 |
| workflows.list.connections.Write email1.main[].0.node | string | Review email | 1 |
| workflows.list.connections.Write email1.main[].0.type | string | main | 1 |
| workflows.list.connections.Write email1.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Prepara Email per Classificatore | object | 1 | 1 |
| workflows.list.connections.Prepara Email per Classificatore.main | array | 1 | 1 |
| workflows.list.connections.Prepara Email per Classificatore.main[].0 | object | 3 | 1 |
| workflows.list.connections.Prepara Email per Classificatore.main[].0.node | string | MERGE DI TUTTI I DATI | 1 |
| workflows.list.connections.Prepara Email per Classificatore.main[].0.type | string | main | 1 |
| workflows.list.connections.Prepara Email per Classificatore.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Prepara Email per Classificatore.main[].1 | object | 3 | 1 |
| workflows.list.connections.Prepara Email per Classificatore.main[].1.node | string | Merge Email + Classification | 1 |
| workflows.list.connections.Prepara Email per Classificatore.main[].1.type | string | main | 1 |
| workflows.list.connections.Prepara Email per Classificatore.main[].1.index | number | 0 | 1 |
| workflows.list.connections.Prepara Email per Classificatore.main[].2 | object | 3 | 1 |
| workflows.list.connections.Prepara Email per Classificatore.main[].2.node | string | AI Classifier preliminare | 1 |
| workflows.list.connections.Prepara Email per Classificatore.main[].2.type | string | main | 1 |
| workflows.list.connections.Prepara Email per Classificatore.main[].2.index | number | 0 | 1 |
| workflows.list.connections.Prepara Email per Classificatore.main[].3 | object | 3 | 1 |
| workflows.list.connections.Prepara Email per Classificatore.main[].3.node | string | 📊 EMAIL DATA COLLECTOR | 1 |
| workflows.list.connections.Prepara Email per Classificatore.main[].3.type | string | main | 1 |
| workflows.list.connections.Prepara Email per Classificatore.main[].3.index | number | 0 | 1 |
| workflows.list.connections.Pulisci Testo | object | 1 | 1 |
| workflows.list.connections.Pulisci Testo.main | array | 1 | 1 |
| workflows.list.connections.Pulisci Testo.main[].0 | object | 3 | 1 |
| workflows.list.connections.Pulisci Testo.main[].0.node | string | Prepara Email per Classificatore | 1 |
| workflows.list.connections.Pulisci Testo.main[].0.type | string | main | 1 |
| workflows.list.connections.Pulisci Testo.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Pulisci Testo.main[].1 | object | 3 | 1 |
| workflows.list.connections.Pulisci Testo.main[].1.node | string | Information Extractor | 1 |
| workflows.list.connections.Pulisci Testo.main[].1.type | string | main | 1 |
| workflows.list.connections.Pulisci Testo.main[].1.index | number | 0 | 1 |
| workflows.list.connections.Estrae tipo di interazione | object | 1 | 1 |
| workflows.list.connections.Estrae tipo di interazione.main | array | 1 | 1 |
| workflows.list.connections.Estrae tipo di interazione.main[].0 | object | 3 | 1 |
| workflows.list.connections.Estrae tipo di interazione.main[].0.node | string | Write email1 | 1 |
| workflows.list.connections.Estrae tipo di interazione.main[].0.type | string | main | 1 |
| workflows.list.connections.Estrae tipo di interazione.main[].0.index | number | 0 | 1 |
| workflows.list.connections.AI Classifier preliminare | object | 1 | 1 |
| workflows.list.connections.AI Classifier preliminare.main | array | 2 | 1 |
| workflows.list.connections.AI Classifier preliminare.main[].0 | object | 3 | 1 |
| workflows.list.connections.AI Classifier preliminare.main[].0.node | string | E' UNA RISPOSTA? | 1 |
| workflows.list.connections.AI Classifier preliminare.main[].0.type | string | main | 1 |
| workflows.list.connections.AI Classifier preliminare.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Information Extractor | object | 1 | 1 |
| workflows.list.connections.Information Extractor.main | array | 1 | 1 |
| workflows.list.connections.Information Extractor.main[].0 | object | 3 | 1 |
| workflows.list.connections.Information Extractor.main[].0.node | string | JSON Flat | 1 |
| workflows.list.connections.Information Extractor.main[].0.type | string | main | 1 |
| workflows.list.connections.Information Extractor.main[].0.index | number | 0 | 1 |
| workflows.list.connections.📊 EMAIL DATA COLLECTOR | object | 1 | 1 |
| workflows.list.connections.📊 EMAIL DATA COLLECTOR.main | array | 1 | 1 |
| workflows.list.connections.📊 EMAIL DATA COLLECTOR.main[].0 | object | 3 | 1 |
| workflows.list.connections.📊 EMAIL DATA COLLECTOR.main[].0.node | string | PRE - PROCESSED DATA MAIL | 1 |
| workflows.list.connections.📊 EMAIL DATA COLLECTOR.main[].0.type | string | main | 1 |
| workflows.list.connections.📊 EMAIL DATA COLLECTOR.main[].0.index | number | 0 | 1 |
| workflows.list.connections.📈🔄 EMAIL COMPLETE DATA COLLECTOR | object | 1 | 1 |
| workflows.list.connections.📈🔄 EMAIL COMPLETE DATA COLLECTOR.main | array | 1 | 1 |
| workflows.list.connections.📈🔄 EMAIL COMPLETE DATA COLLECTOR.main[].0 | object | 3 | 1 |
| workflows.list.connections.📈🔄 EMAIL COMPLETE DATA COLLECTOR.main[].0.node | string | COMPLETE MAIL DATA | 1 |
| workflows.list.connections.📈🔄 EMAIL COMPLETE DATA COLLECTOR.main[].0.type | string | main | 1 |
| workflows.list.connections.📈🔄 EMAIL COMPLETE DATA COLLECTOR.main[].0.index | number | 0 | 1 |
| workflows.list.connections.✍️ Firma & Thread Formatter | object | 1 | 1 |
| workflows.list.connections.✍️ Firma & Thread Formatter.main | array | 1 | 1 |
| workflows.list.connections.✍️ Firma & Thread Formatter.main[].0 | object | 3 | 1 |
| workflows.list.connections.✍️ Firma & Thread Formatter.main[].0.node | string | Fornisce ID mail per reply | 1 |
| workflows.list.connections.✍️ Firma & Thread Formatter.main[].0.type | string | main | 1 |
| workflows.list.connections.✍️ Firma & Thread Formatter.main[].0.index | number | 0 | 1 |
| workflows.list.connections.✍️ Firma & Thread Formatter.main[].1 | object | 3 | 1 |
| workflows.list.connections.✍️ Firma & Thread Formatter.main[].1.node | string | Merge1 | 1 |
| workflows.list.connections.✍️ Firma & Thread Formatter.main[].1.type | string | main | 1 |
| workflows.list.connections.✍️ Firma & Thread Formatter.main[].1.index | number | 1 | 1 |
| workflows.list.connections.Fornisce ID mail per reply | object | 1 | 1 |
| workflows.list.connections.Fornisce ID mail per reply.main | array | 1 | 1 |
| workflows.list.connections.Fornisce ID mail per reply.main[].0 | object | 3 | 1 |
| workflows.list.connections.Fornisce ID mail per reply.main[].0.node | string | Rispondi a mittente | 1 |
| workflows.list.connections.Fornisce ID mail per reply.main[].0.type | string | main | 1 |
| workflows.list.connections.Fornisce ID mail per reply.main[].0.index | number | 0 | 1 |
| workflows.list.connections.E' UNA RISPOSTA? | object | 1 | 1 |
| workflows.list.connections.E' UNA RISPOSTA?.main | array | 2 | 1 |
| workflows.list.connections.E' UNA RISPOSTA?.main[].0 | object | 3 | 2 |
| workflows.list.connections.E' UNA RISPOSTA?.main[].0.node | string | Thread Reply Classifier, Email Classifier | 2 |
| workflows.list.connections.E' UNA RISPOSTA?.main[].0.type | string | main | 2 |
| workflows.list.connections.E' UNA RISPOSTA?.main[].0.index | number | 0 | 2 |
| workflows.list.pinData.Ricezione Mail | array | 1 | 1 |
| workflows.list.pinData.Ricezione Mail[].json | object | 9 | 1 |
| workflows.list.pinData.Ricezione Mail[].json.@odata.etag | string | W/"CQAAABYAAAABIvZjidpvQo+FOUmjs9ACAAAF6TUY" | 1 |
| workflows.list.pinData.Ricezione Mail[].json.id | string | AAMkADRmMTYxODRmLWJmZjYtNDQ4Ny1hZGE0LWQzYjNhZjJkZDQyMgBGAAAAAAAbCa7Kx9UPS7NhabBhamKLBwABIvZjidpvQo_F | 1 |
| workflows.list.pinData.Ricezione Mail[].json.categories | array | 0 | 1 |
| workflows.list.pinData.Ricezione Mail[].json.sentDateTime | string | 2025-05-26T19:38:30Z | 1 |
| workflows.list.pinData.Ricezione Mail[].json.subject | string | Ordine MCWRWNXKT | 1 |
| workflows.list.pinData.Ricezione Mail[].json.body | object | 2 | 1 |
| workflows.list.pinData.Ricezione Mail[].json.body.contentType | string | html | 1 |
| workflows.list.pinData.Ricezione Mail[].json.body.content | string | <html><head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><body style= | 1 |
| workflows.list.pinData.Ricezione Mail[].json.sender | object | 1 | 1 |
| workflows.list.pinData.Ricezione Mail[].json.sender.emailAddress | object | 2 | 1 |
| workflows.list.pinData.Ricezione Mail[].json.ccRecipients | array | 0 | 1 |
| workflows.list.pinData.Ricezione Mail[].json.replyTo | array | 0 | 1 |
| workflows.list.nodes[].parameters.jsonExample | string | {
  "query": "WDSLMTPUF"
} | 1 |
| workflows.list.nodes[].parameters.dataPropertyName | string | body.content | 1 |
| workflows.list.nodes[].parameters.extractionValues | object | 1 | 1 |
| workflows.list.nodes[].parameters.extractionValues.values | array | 1 | 1 |
| workflows.list.nodes[].parameters.extractionValues.values[].key | string | = | 1 |
| workflows.list.nodes[].parameters.extractionValues.values[].cssSelector | string | body | 1 |
| workflows.list.connections.Acquisisci gli ordini dalla cartella Ordini | object | 1 | 1 |
| workflows.list.connections.Acquisisci gli ordini dalla cartella Ordini.main | array | 1 | 1 |
| workflows.list.connections.Acquisisci gli ordini dalla cartella Ordini.main[].0 | object | 3 | 1 |
| workflows.list.connections.Acquisisci gli ordini dalla cartella Ordini.main[].0.node | string | HTML TO TEXT | 1 |
| workflows.list.connections.Acquisisci gli ordini dalla cartella Ordini.main[].0.type | string | main | 1 |
| workflows.list.connections.Acquisisci gli ordini dalla cartella Ordini.main[].0.index | number | 0 | 1 |
| workflows.list.connections.OpenAI.main[].1 | object | 3 | 1 |
| workflows.list.connections.OpenAI.main[].1.node | string | Merge | 1 |
| workflows.list.connections.OpenAI.main[].1.type | string | main | 1 |
| workflows.list.connections.OpenAI.main[].1.index | number | 0 | 1 |
| workflows.list.connections.If.main[].1 | object | 3 | 1 |
| workflows.list.connections.If.main[].1.node | string | Merge3 | 1 |
| workflows.list.connections.If.main[].1.type | string | main | 1 |
| workflows.list.connections.If.main[].1.index | number | 0 | 1 |
| workflows.list.connections.Merge3 | object | 1 | 1 |
| workflows.list.connections.Merge3.main | array | 1 | 1 |
| workflows.list.connections.Merge3.main[].0 | object | 3 | 1 |
| workflows.list.connections.Merge3.main[].0.node | string | Code5 | 1 |
| workflows.list.connections.Merge3.main[].0.type | string | main | 1 |
| workflows.list.connections.Merge3.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Code5 | object | 1 | 1 |
| workflows.list.connections.Code5.main | array | 1 | 1 |
| workflows.list.connections.Code5.main[].0 | object | 3 | 1 |
| workflows.list.connections.Code5.main[].0.node | string | Microsoft Outlook | 1 |
| workflows.list.connections.Code5.main[].0.type | string | main | 1 |
| workflows.list.connections.Code5.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Update Prestashop | object | 1 | 1 |
| workflows.list.connections.Update Prestashop.main | array | 1 | 1 |
| workflows.list.connections.Update Prestashop.main[].0 | object | 3 | 1 |
| workflows.list.connections.Update Prestashop.main[].0.node | string | Merge | 1 |
| workflows.list.connections.Update Prestashop.main[].0.type | string | main | 1 |
| workflows.list.connections.Update Prestashop.main[].0.index | number | 1 | 1 |
| workflows.list.connections.JSON Flat3 | object | 1 | 1 |
| workflows.list.connections.JSON Flat3.main | array | 1 | 1 |
| workflows.list.connections.JSON Flat3.main[].0 | object | 3 | 1 |
| workflows.list.connections.JSON Flat3.main[].0.node | string | If | 1 |
| workflows.list.connections.JSON Flat3.main[].0.type | string | main | 1 |
| workflows.list.connections.JSON Flat3.main[].0.index | number | 0 | 1 |
| workflows.list.connections.HTTP Request | object | 1 | 1 |
| workflows.list.connections.HTTP Request.ai_tool | array | 1 | 1 |
| workflows.list.connections.OpenAI Analyzer | object | 1 | 1 |
| workflows.list.connections.OpenAI Analyzer.ai_languageModel | array | 1 | 1 |
| workflows.list.connections.OpenAI Analyzer.ai_languageModel[].0 | object | 3 | 1 |
| workflows.list.connections.OpenAI Analyzer.ai_languageModel[].0.node | string | Conversation Analyzer | 1 |
| workflows.list.connections.OpenAI Analyzer.ai_languageModel[].0.type | string | ai_languageModel | 1 |
| workflows.list.connections.OpenAI Analyzer.ai_languageModel[].0.index | number | 0 | 1 |
| workflows.list.connections.❓ Gap Detected? | object | 1 | 1 |
| workflows.list.connections.❓ Gap Detected?.main | array | 2 | 1 |
| workflows.list.connections.❓ Gap Detected?.main[].0 | object | 3 | 2 |
| workflows.list.connections.❓ Gap Detected?.main[].0.node | string | ⚙️ Smart Task Generator, No Action Needed | 2 |
| workflows.list.connections.❓ Gap Detected?.main[].0.type | string | main | 2 |
| workflows.list.connections.❓ Gap Detected?.main[].0.index | number | 0 | 2 |
| workflows.list.connections.⚙️ Smart Task Generator | object | 1 | 1 |
| workflows.list.connections.⚙️ Smart Task Generator.main | array | 1 | 1 |
| workflows.list.connections.⚙️ Smart Task Generator.main[].0 | object | 3 | 1 |
| workflows.list.connections.⚙️ Smart Task Generator.main[].0.node | string | Task Enricher | 1 |
| workflows.list.connections.⚙️ Smart Task Generator.main[].0.type | string | main | 1 |
| workflows.list.connections.⚙️ Smart Task Generator.main[].0.index | number | 0 | 1 |
| workflows.list.connections.OpenAI Task Gen | object | 1 | 1 |
| workflows.list.connections.OpenAI Task Gen.ai_languageModel | array | 1 | 1 |
| workflows.list.connections.OpenAI Task Gen.ai_languageModel[].0 | object | 3 | 1 |
| workflows.list.connections.OpenAI Task Gen.ai_languageModel[].0.node | string | ⚙️ Smart Task Generator | 1 |
| workflows.list.connections.OpenAI Task Gen.ai_languageModel[].0.type | string | ai_languageModel | 1 |
| workflows.list.connections.OpenAI Task Gen.ai_languageModel[].0.index | number | 0 | 1 |
| workflows.list.connections.💾 Supabase Insert | object | 1 | 1 |
| workflows.list.connections.💾 Supabase Insert.main | array | 1 | 1 |
| workflows.list.connections.💾 Supabase Insert.main[].0 | object | 3 | 1 |
| workflows.list.connections.💾 Supabase Insert.main[].0.node | string | URGENTE? | 1 |
| workflows.list.connections.💾 Supabase Insert.main[].0.type | string | main | 1 |
| workflows.list.connections.💾 Supabase Insert.main[].0.index | number | 0 | 1 |
| workflows.list.connections.📱 Telegram Urgent | object | 1 | 1 |
| workflows.list.connections.📱 Telegram Urgent.main | array | 1 | 1 |
| workflows.list.connections.Mappa Campi.main[].1 | object | 3 | 1 |
| workflows.list.connections.Mappa Campi.main[].1.node | string | Merge | 1 |
| workflows.list.connections.Mappa Campi.main[].1.type | string | main | 1 |
| workflows.list.connections.Mappa Campi.main[].1.index | number | 0 | 1 |
| workflows.list.connections.Trasforma in Json | object | 1 | 1 |
| workflows.list.connections.Trasforma in Json.main | array | 1 | 1 |
| workflows.list.connections.Trasforma in Json.main[].0 | object | 3 | 1 |
| workflows.list.connections.Trasforma in Json.main[].0.node | string | ❓ Gap Detected? | 1 |
| workflows.list.connections.Trasforma in Json.main[].0.type | string | main | 1 |
| workflows.list.connections.Trasforma in Json.main[].0.index | number | 0 | 1 |
| workflows.list.connections.CREATE Metrics | object | 1 | 1 |
| workflows.list.connections.CREATE Metrics.main | array | 1 | 1 |
| workflows.list.connections.URGENTE? | object | 1 | 1 |
| workflows.list.connections.URGENTE?.main | array | 2 | 1 |
| workflows.list.connections.URGENTE?.main[].0 | object | 3 | 1 |
| workflows.list.connections.URGENTE?.main[].0.node | string | Microsoft Outlook | 1 |
| workflows.list.connections.URGENTE?.main[].0.type | string | main | 1 |
| workflows.list.connections.URGENTE?.main[].0.index | number | 0 | 1 |
| workflows.list.connections.URGENTE?.main[].1 | object | 3 | 1 |
| workflows.list.connections.URGENTE?.main[].1.node | string | 📱 Telegram Urgent | 1 |
| workflows.list.connections.URGENTE?.main[].1.type | string | main | 1 |
| workflows.list.connections.URGENTE?.main[].1.index | number | 0 | 1 |
| workflows.list.connections.METRICS UPDATER | object | 1 | 1 |
| workflows.list.connections.METRICS UPDATER.main | array | 1 | 1 |
| workflows.list.connections.METRICS UPDATER.main[].0 | object | 3 | 1 |
| workflows.list.connections.METRICS UPDATER.main[].0.node | string | If | 1 |
| workflows.list.connections.METRICS UPDATER.main[].0.type | string | main | 1 |
| workflows.list.connections.METRICS UPDATER.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Task Enricher | object | 1 | 1 |
| workflows.list.connections.Task Enricher.main | array | 1 | 1 |
| workflows.list.connections.Task Enricher.main[].0 | object | 3 | 1 |
| workflows.list.connections.Task Enricher.main[].0.node | string | Merge | 1 |
| workflows.list.connections.Task Enricher.main[].0.type | string | main | 1 |
| workflows.list.connections.Task Enricher.main[].0.index | number | 1 | 1 |
| workflows.list.connections.Task Enricher.main[].1 | object | 3 | 1 |
| workflows.list.connections.Task Enricher.main[].1.node | string | METRICS UPDATER | 1 |
| workflows.list.connections.Task Enricher.main[].1.type | string | main | 1 |
| workflows.list.connections.Task Enricher.main[].1.index | number | 0 | 1 |
| workflows.list.connections.No Action Needed | object | 1 | 1 |
| workflows.list.connections.No Action Needed.main | array | 1 | 1 |
| workflows.list.connections.Check if CREATE Metrics | object | 1 | 1 |
| workflows.list.connections.Check if CREATE Metrics.main | array | 1 | 1 |
| workflows.list.pinData.When Executed by Another Workflow | array | 1 | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json | object | 16 | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.output | object | 5 | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.output.categoria | string | Assistenza Ordini | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.output.tipo_interazione | string | Aggiornamento Tracking | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.output.confidence | string | high | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.output.risposta_html | string | <p>Gentile Geometra Cappellacci,</p>
<p>La ringrazio per la Sua pazienza e comprensione in merito al | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.output.order_id | string | BCRGBYWMU | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.message_id | string | AAMkADRmMTYxODRmLWJmZjYtNDQ4Ny1hZGE0LWQzYjNhZjJkZDQyMgBGAAAAAAAbCa7Kx9UPS7NhabBhamKLBwABIvZjidpvQo_F | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.mittente | string | supplies@tecsolutions.app | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.mittente_nome | string | Supplies TEC S.r.l. | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.oggetto | string | RE: [GommeGo!] IN TRANSITO – LINK DI TRACCIAMENTO INVIATO | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.messaggio_cliente | string | Buongiorno faccio presente che manca ancora 1 pneumatico.
Saluti
Luca Cappellacci
------------------ | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.thread_storico | string | Il Lun 26 Mag 2025, 13:37 Info < info@gommego.com > ha scritto:
Gentile Sig. Cappellacci,
La ringraz | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.isThreadReply | boolean | true | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.isFirstMessage | boolean | false | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.isSpam | boolean | false | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.data_iso | string | 2025-06-01T15:53:25Z | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.data_locale | string | 01/06/2025, 15:53:25 | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.order_id | string | BCRGBYWMU | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.reply_to | array | 0 | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.cc | array | 0 | 1 |
| workflows.list.pinData.When Executed by Another Workflow[].json.categorie | array | 0 | 1 |
| workflows.list.nodes[].parameters.nodeCredentialType | string | qdrantApi, microsoftOutlookOAuth2Api | 2 |
| workflows.list.connections.When clicking "Test workflow" | object | 1 | 1 |
| workflows.list.connections.When clicking "Test workflow".main | array | 1 | 1 |
| workflows.list.connections.When clicking "Test workflow".main[].0 | object | 3 | 1 |
| workflows.list.connections.When clicking "Test workflow".main[].0.node | string | Lista File | 1 |
| workflows.list.connections.When clicking "Test workflow".main[].0.type | string | main | 1 |
| workflows.list.connections.When clicking "Test workflow".main[].0.index | number | 0 | 1 |
| workflows.list.connections.Chunking Semantico | object | 1 | 1 |
| workflows.list.connections.Chunking Semantico.main | array | 1 | 1 |
| workflows.list.connections.Chunking Semantico.main[].0 | object | 3 | 1 |
| workflows.list.connections.Chunking Semantico.main[].0.node | string | Genera Embedding con OpenAI | 1 |
| workflows.list.connections.Chunking Semantico.main[].0.type | string | main | 1 |
| workflows.list.connections.Chunking Semantico.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Chunking Semantico.main[].1 | object | 3 | 1 |
| workflows.list.connections.Chunking Semantico.main[].1.node | string | Merge2 | 1 |
| workflows.list.connections.Chunking Semantico.main[].1.type | string | main | 1 |
| workflows.list.connections.Chunking Semantico.main[].1.index | number | 0 | 1 |
| workflows.list.connections.Processa Batch di Chunk | object | 1 | 1 |
| workflows.list.connections.Processa Batch di Chunk.main | array | 2 | 1 |
| workflows.list.connections.Processa Batch di Chunk.main[].0 | object | 3 | 2 |
| workflows.list.connections.Processa Batch di Chunk.main[].0.node | string | Genera Embedding con OpenAI, Continua Processamento | 2 |
| workflows.list.connections.Processa Batch di Chunk.main[].0.type | string | main | 2 |
| workflows.list.connections.Processa Batch di Chunk.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Genera Embedding con OpenAI | object | 1 | 1 |
| workflows.list.connections.Genera Embedding con OpenAI.main | array | 1 | 1 |
| workflows.list.connections.Genera Embedding con OpenAI.main[].0 | object | 3 | 1 |
| workflows.list.connections.Genera Embedding con OpenAI.main[].0.node | string | Merge2 | 1 |
| workflows.list.connections.Genera Embedding con OpenAI.main[].0.type | string | main | 1 |
| workflows.list.connections.Genera Embedding con OpenAI.main[].0.index | number | 1 | 1 |
| workflows.list.connections.Prepara Dati per Qdrant | object | 1 | 1 |
| workflows.list.connections.Prepara Dati per Qdrant.main | array | 1 | 1 |
| workflows.list.connections.Prepara Dati per Qdrant.main[].0 | object | 3 | 1 |
| workflows.list.connections.Prepara Dati per Qdrant.main[].0.node | string | Edit Fields1 | 1 |
| workflows.list.connections.Prepara Dati per Qdrant.main[].0.type | string | main | 1 |
| workflows.list.connections.Prepara Dati per Qdrant.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Upsert in Qdrant | object | 1 | 1 |
| workflows.list.connections.Upsert in Qdrant.main | array | 1 | 1 |
| workflows.list.connections.Upsert in Qdrant.main[].0 | object | 3 | 1 |
| workflows.list.connections.Upsert in Qdrant.main[].0.node | string | Processa Batch di Chunk | 1 |
| workflows.list.connections.Upsert in Qdrant.main[].0.type | string | main | 1 |
| workflows.list.connections.Upsert in Qdrant.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Configura Parametri | object | 1 | 1 |
| workflows.list.connections.Configura Parametri.main | array | 1 | 1 |
| workflows.list.connections.Download file.main[].0 | object | 3 | 1 |
| workflows.list.connections.Download file.main[].0.node | string | Extract from File | 1 |
| workflows.list.connections.Download file.main[].0.type | string | main | 1 |
| workflows.list.connections.Download file.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Download file.main[].1 | object | 3 | 1 |
| workflows.list.connections.Download file.main[].1.node | string | Edit Fields | 1 |
| workflows.list.connections.Download file.main[].1.type | string | main | 1 |
| workflows.list.connections.Download file.main[].1.index | number | 0 | 1 |
| workflows.list.connections.Prepara testo per chunking | object | 1 | 1 |
| workflows.list.connections.Prepara testo per chunking.main | array | 1 | 1 |
| workflows.list.connections.Prepara testo per chunking.main[].0 | object | 3 | 1 |
| workflows.list.connections.Prepara testo per chunking.main[].0.node | string | Chunking Semantico | 1 |
| workflows.list.connections.Prepara testo per chunking.main[].0.type | string | main | 1 |
| workflows.list.connections.Prepara testo per chunking.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Merge2 | object | 1 | 1 |
| workflows.list.connections.Merge2.main | array | 1 | 1 |
| workflows.list.connections.Merge2.main[].0 | object | 3 | 1 |
| workflows.list.connections.Merge2.main[].0.node | string | Code | 1 |
| workflows.list.connections.Merge2.main[].0.type | string | main | 1 |
| workflows.list.connections.Merge2.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Genera TAG | object | 1 | 1 |
| workflows.list.connections.Genera TAG.main | array | 1 | 1 |
| workflows.list.connections.Genera TAG.main[].0 | object | 3 | 1 |
| workflows.list.connections.Genera TAG.main[].0.node | string | Merge1 | 1 |
| workflows.list.connections.Genera TAG.main[].0.type | string | main | 1 |
| workflows.list.connections.Genera TAG.main[].0.index | number | 0 | 1 |
| workflows.list.nodes[].parameters.requestOptions | object | 0 | 1 |
| workflows.list.nodes[].disabled | boolean | true | 3 |
| workflows.list.connections.Session Manager | object | 1 | 1 |
| workflows.list.connections.Session Manager.main | array | 1 | 1 |
| workflows.list.connections.Session Manager.main[].0 | object | 3 | 1 |
| workflows.list.connections.Session Manager.main[].0.node | string | AI Chat Model | 1 |
| workflows.list.connections.Session Manager.main[].0.type | string | main | 1 |
| workflows.list.connections.Session Manager.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Session Manager.main[].1 | object | 3 | 1 |
| workflows.list.connections.Session Manager.main[].1.node | string | RAG Context Retriever | 1 |
| workflows.list.connections.Session Manager.main[].1.type | string | main | 1 |
| workflows.list.connections.Session Manager.main[].1.index | number | 0 | 1 |
| workflows.list.connections.AI Chat Model | object | 1 | 1 |
| workflows.list.connections.AI Chat Model.main | array | 1 | 1 |
| workflows.list.connections.AI Chat Model.main[].0 | object | 3 | 1 |
| workflows.list.connections.AI Chat Model.main[].0.node | string | Response Formatter | 1 |
| workflows.list.connections.AI Chat Model.main[].0.type | string | main | 1 |
| workflows.list.connections.AI Chat Model.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Response Formatter | object | 1 | 1 |
| workflows.list.connections.Response Formatter.main | array | 1 | 1 |
| workflows.list.connections.Response Formatter.main[].0 | object | 3 | 1 |
| workflows.list.connections.Response Formatter.main[].0.node | string | Channel Router | 1 |
| workflows.list.connections.Response Formatter.main[].0.type | string | main | 1 |
| workflows.list.connections.Response Formatter.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Response Formatter.main[].1 | object | 3 | 1 |
| workflows.list.connections.Response Formatter.main[].1.node | string | Analytics Tracker | 1 |
| workflows.list.connections.Response Formatter.main[].1.type | string | main | 1 |
| workflows.list.connections.Response Formatter.main[].1.index | number | 0 | 1 |
| workflows.list.connections.Channel Router | object | 1 | 1 |
| workflows.list.connections.Channel Router.main | array | 2 | 1 |
| workflows.list.connections.Channel Router.main[].0 | object | 3 | 2 |
| workflows.list.connections.Channel Router.main[].0.node | string | Web Response, Email Response | 2 |
| workflows.list.connections.Channel Router.main[].0.type | string | main | 2 |
| workflows.list.connections.Channel Router.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Analytics Tracker | object | 1 | 1 |
| workflows.list.connections.Analytics Tracker.main | array | 1 | 1 |
| workflows.list.connections.Analytics Tracker.main[].0 | object | 3 | 1 |
| workflows.list.connections.Analytics Tracker.main[].0.node | string | Memory Storage | 1 |
| workflows.list.connections.Analytics Tracker.main[].0.type | string | main | 1 |
| workflows.list.connections.Analytics Tracker.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Email Trigger | object | 1 | 1 |
| workflows.list.connections.Email Trigger.main | array | 1 | 1 |
| workflows.list.connections.Email Trigger.main[].0 | object | 3 | 1 |
| workflows.list.connections.Email Trigger.main[].0.node | string | Session Manager | 1 |
| workflows.list.connections.Email Trigger.main[].0.type | string | main | 1 |
| workflows.list.connections.Email Trigger.main[].0.index | number | 0 | 1 |
| workflows.list.settings.timezone | string | Europe/Rome | 2 |
| workflows.list.settings.saveDataErrorExecution | string | all | 1 |
| workflows.list.settings.saveDataSuccessExecution | string | all | 2 |
| workflows.list.settings.saveManualExecutions | boolean | true | 2 |
| workflows.list.settings.saveExecutionProgress | boolean | true | 2 |
| workflows.list.settings.executionTimeout | number | 300 | 1 |
| workflows.list.nodes[].parameters.responseFormat | string | string | 1 |
| workflows.list.nodes[].parameters.options.followRedirect | boolean | true | 1 |
| workflows.list.connections.Inserisci Link | object | 1 | 1 |
| workflows.list.connections.Inserisci Link.main | array | 1 | 1 |
| workflows.list.connections.Inserisci Link.main[].0 | object | 3 | 1 |
| workflows.list.connections.Inserisci Link.main[].0.node | string | Scarica Pagina | 1 |
| workflows.list.connections.Inserisci Link.main[].0.type | string | main | 1 |
| workflows.list.connections.Inserisci Link.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Scarica Pagina | object | 1 | 1 |
| workflows.list.connections.Scarica Pagina.main | array | 1 | 1 |
| workflows.list.connections.Scarica Pagina.main[].0 | object | 3 | 1 |
| workflows.list.connections.Scarica Pagina.main[].0.node | string | Code | 1 |
| workflows.list.connections.Scarica Pagina.main[].0.type | string | main | 1 |
| workflows.list.connections.Scarica Pagina.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Filtra Righe | object | 1 | 1 |
| workflows.list.connections.Filtra Righe.main | array | 1 | 1 |
| workflows.list.connections.HTML | object | 1 | 2 |
| workflows.list.connections.HTML.main | array | 1 | 2 |
| workflows.list.connections.AI - Interpreta Spedizione | object | 1 | 1 |
| workflows.list.connections.AI - Interpreta Spedizione.main | array | 1 | 1 |
| workflows.list.connections.Filtra Righe1 | object | 1 | 1 |
| workflows.list.connections.Filtra Righe1.main | array | 1 | 1 |
| workflows.list.connections.Filtra Righe1.main[].0 | object | 3 | 1 |
| workflows.list.connections.Filtra Righe1.main[].0.node | string | AI - Interpreta Spedizione | 1 |
| workflows.list.connections.Filtra Righe1.main[].0.type | string | main | 1 |
| workflows.list.connections.Filtra Righe1.main[].0.index | number | 0 | 1 |
| workflows.list.nodes[].parameters.filter.whatToSearch | string | files | 1 |
| workflows.list.nodes[].parameters.filter.fileTypes | array | 0 | 1 |
| workflows.list.nodes[].parameters.options.fields | array | 3 | 1 |
| workflows.list.connections.Manual Trigger | object | 1 | 1 |
| workflows.list.connections.Manual Trigger.main | array | 1 | 1 |
| workflows.list.connections.Manual Trigger.main[].0 | object | 3 | 1 |
| workflows.list.connections.Manual Trigger.main[].0.node | string | Google Drive1 | 1 |
| workflows.list.connections.Manual Trigger.main[].0.type | string | main | 1 |
| workflows.list.connections.Manual Trigger.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Google Drive1 | object | 1 | 1 |
| workflows.list.connections.Google Drive1.main | array | 1 | 1 |
| workflows.list.connections.Google Drive1.main[].0 | object | 3 | 1 |
| workflows.list.connections.Google Drive1.main[].0.node | string | Edit Fields | 1 |
| workflows.list.connections.Google Drive1.main[].0.type | string | main | 1 |
| workflows.list.connections.Google Drive1.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Google Drive2 | object | 1 | 1 |
| workflows.list.connections.Google Drive2.main | array | 1 | 1 |
| workflows.list.connections.Google Drive2.main[].0 | object | 3 | 1 |
| workflows.list.connections.Google Drive2.main[].0.node | string | Save Metadata | 1 |
| workflows.list.connections.Google Drive2.main[].0.type | string | main | 1 |
| workflows.list.connections.Google Drive2.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Exentions | object | 1 | 1 |
| workflows.list.connections.Exentions.main | array | 1 | 1 |
| workflows.list.connections.Exentions.main[].0 | object | 3 | 1 |
| workflows.list.connections.Exentions.main[].0.node | string | Switch | 1 |
| workflows.list.connections.Exentions.main[].0.type | string | main | 1 |
| workflows.list.connections.Exentions.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Switch | object | 1 | 1 |
| workflows.list.connections.Switch.main | array | 11 | 1 |
| workflows.list.connections.Switch.main[].0 | object | 3 | 3 |
| workflows.list.connections.Switch.main[].0.node | string | CSV, HTML | 3 |
| workflows.list.connections.Switch.main[].0.type | string | main | 3 |
| workflows.list.connections.Switch.main[].0.index | number | 0 | 3 |
| workflows.list.connections.PDF | object | 1 | 1 |
| workflows.list.connections.PDF.main | array | 1 | 1 |
| workflows.list.connections.PDF.main[].0 | object | 3 | 1 |
| workflows.list.connections.PDF.main[].0.node | string | Merge PDF | 1 |
| workflows.list.connections.PDF.main[].0.type | string | main | 1 |
| workflows.list.connections.PDF.main[].0.index | number | 0 | 1 |
| workflows.list.connections.JSON | object | 1 | 1 |
| workflows.list.connections.JSON.main | array | 1 | 1 |
| workflows.list.connections.JSON.main[].0 | object | 3 | 1 |
| workflows.list.connections.JSON.main[].0.node | string | Merge PDF10 | 1 |
| workflows.list.connections.JSON.main[].0.type | string | main | 1 |
| workflows.list.connections.JSON.main[].0.index | number | 0 | 1 |
| workflows.list.connections.HTML.main[].0 | object | 3 | 1 |
| workflows.list.connections.HTML.main[].0.node | string | Merge PDF8 | 1 |
| workflows.list.connections.HTML.main[].0.type | string | main | 1 |
| workflows.list.connections.HTML.main[].0.index | number | 0 | 1 |
| workflows.list.connections.ICS | object | 1 | 1 |
| workflows.list.connections.ICS.main | array | 1 | 1 |
| workflows.list.connections.ICS.main[].0 | object | 3 | 1 |
| workflows.list.connections.ICS.main[].0.node | string | Merge PDF7 | 1 |
| workflows.list.connections.ICS.main[].0.type | string | main | 1 |
| workflows.list.connections.ICS.main[].0.index | number | 0 | 1 |
| workflows.list.connections.ODS | object | 1 | 1 |
| workflows.list.connections.ODS.main | array | 1 | 1 |
| workflows.list.connections.ODS.main[].0 | object | 3 | 1 |
| workflows.list.connections.ODS.main[].0.node | string | Merge PDF1 | 1 |
| workflows.list.connections.ODS.main[].0.type | string | main | 1 |
| workflows.list.connections.ODS.main[].0.index | number | 0 | 1 |
| workflows.list.connections.RFT | object | 1 | 1 |
| workflows.list.connections.RFT.main | array | 1 | 1 |
| workflows.list.connections.RFT.main[].0 | object | 3 | 1 |
| workflows.list.connections.RFT.main[].0.node | string | Merge PDF2 | 1 |
| workflows.list.connections.RFT.main[].0.type | string | main | 1 |
| workflows.list.connections.RFT.main[].0.index | number | 0 | 1 |
| workflows.list.connections.TXT | object | 1 | 1 |
| workflows.list.connections.TXT.main | array | 1 | 1 |
| workflows.list.connections.TXT.main[].0 | object | 3 | 1 |
| workflows.list.connections.TXT.main[].0.node | string | Merge PDF3 | 1 |
| workflows.list.connections.TXT.main[].0.type | string | main | 1 |
| workflows.list.connections.TXT.main[].0.index | number | 0 | 1 |
| workflows.list.connections.XML | object | 1 | 1 |
| workflows.list.connections.XML.main | array | 1 | 1 |
| workflows.list.connections.XML.main[].0 | object | 3 | 1 |
| workflows.list.connections.XML.main[].0.node | string | Merge PDF4 | 1 |
| workflows.list.connections.XML.main[].0.type | string | main | 1 |
| workflows.list.connections.XML.main[].0.index | number | 0 | 1 |
| workflows.list.connections.XLS | object | 1 | 1 |
| workflows.list.connections.XLS.main | array | 1 | 1 |
| workflows.list.connections.XLS.main[].0 | object | 3 | 1 |
| workflows.list.connections.XLS.main[].0.node | string | Merge PDF5 | 1 |
| workflows.list.connections.XLS.main[].0.type | string | main | 1 |
| workflows.list.connections.XLS.main[].0.index | number | 0 | 1 |
| workflows.list.connections.XLSX | object | 1 | 1 |
| workflows.list.connections.XLSX.main | array | 1 | 1 |
| workflows.list.connections.XLSX.main[].0 | object | 3 | 1 |
| workflows.list.connections.XLSX.main[].0.node | string | Merge PDF6 | 1 |
| workflows.list.connections.XLSX.main[].0.type | string | main | 1 |
| workflows.list.connections.XLSX.main[].0.index | number | 0 | 1 |
| workflows.list.connections.CSV | object | 1 | 1 |
| workflows.list.connections.CSV.main | array | 1 | 1 |
| workflows.list.connections.CSV.main[].0 | object | 3 | 1 |
| workflows.list.connections.CSV.main[].0.node | string | Merge PDF9 | 1 |
| workflows.list.connections.CSV.main[].0.type | string | main | 1 |
| workflows.list.connections.CSV.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Save Metadata | object | 1 | 1 |
| workflows.list.connections.Save Metadata.main | array | 1 | 1 |
| workflows.list.connections.Save Metadata.main[].0 | object | 3 | 1 |
| workflows.list.connections.Save Metadata.main[].0.node | string | Exentions | 1 |
| workflows.list.connections.Save Metadata.main[].0.type | string | main | 1 |
| workflows.list.connections.Save Metadata.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Save Metadata.main[].1 | object | 3 | 1 |
| workflows.list.connections.Save Metadata.main[].1.node | string | Merge PDF | 1 |
| workflows.list.connections.Save Metadata.main[].1.type | string | main | 1 |
| workflows.list.connections.Save Metadata.main[].1.index | number | 1 | 1 |
| workflows.list.connections.Save Metadata.main[].2 | object | 3 | 1 |
| workflows.list.connections.Save Metadata.main[].2.node | string | Merge PDF10 | 1 |
| workflows.list.connections.Save Metadata.main[].2.type | string | main | 1 |
| workflows.list.connections.Save Metadata.main[].2.index | number | 1 | 1 |
| workflows.list.connections.Save Metadata.main[].3 | object | 3 | 1 |
| workflows.list.connections.Save Metadata.main[].3.node | string | Merge PDF9 | 1 |
| workflows.list.connections.Save Metadata.main[].3.type | string | main | 1 |
| workflows.list.connections.Save Metadata.main[].3.index | number | 1 | 1 |
| workflows.list.connections.Save Metadata.main[].4 | object | 3 | 1 |
| workflows.list.connections.Save Metadata.main[].4.node | string | Merge PDF8 | 1 |
| workflows.list.connections.Save Metadata.main[].4.type | string | main | 1 |
| workflows.list.connections.Save Metadata.main[].4.index | number | 1 | 1 |
| workflows.list.connections.Save Metadata.main[].5 | object | 3 | 1 |
| workflows.list.connections.Save Metadata.main[].5.node | string | Merge PDF7 | 1 |
| workflows.list.connections.Save Metadata.main[].5.type | string | main | 1 |
| workflows.list.connections.Save Metadata.main[].5.index | number | 1 | 1 |
| workflows.list.connections.Save Metadata.main[].6 | object | 3 | 1 |
| workflows.list.connections.Save Metadata.main[].6.node | string | Merge PDF1 | 1 |
| workflows.list.connections.Save Metadata.main[].6.type | string | main | 1 |
| workflows.list.connections.Save Metadata.main[].6.index | number | 1 | 1 |
| workflows.list.connections.Save Metadata.main[].7 | object | 3 | 1 |
| workflows.list.connections.Save Metadata.main[].7.node | string | Merge PDF5 | 1 |
| workflows.list.connections.Save Metadata.main[].7.type | string | main | 1 |
| workflows.list.connections.Save Metadata.main[].7.index | number | 1 | 1 |
| workflows.list.connections.Save Metadata.main[].8 | object | 3 | 1 |
| workflows.list.connections.Save Metadata.main[].8.node | string | Merge PDF6 | 1 |
| workflows.list.connections.Save Metadata.main[].8.type | string | main | 1 |
| workflows.list.connections.Save Metadata.main[].8.index | number | 1 | 1 |
| workflows.list.connections.Save Metadata.main[].9 | object | 3 | 1 |
| workflows.list.connections.Save Metadata.main[].9.node | string | Merge PDF4 | 1 |
| workflows.list.connections.Save Metadata.main[].9.type | string | main | 1 |
| workflows.list.connections.Save Metadata.main[].9.index | number | 1 | 1 |
| workflows.list.connections.Save Metadata.main[].10 | object | 3 | 1 |
| workflows.list.connections.Save Metadata.main[].10.node | string | Merge PDF3 | 1 |
| workflows.list.connections.Save Metadata.main[].10.type | string | main | 1 |
| workflows.list.connections.Save Metadata.main[].10.index | number | 1 | 1 |
| workflows.list.connections.Save Metadata.main[].11 | object | 3 | 1 |
| workflows.list.connections.Save Metadata.main[].11.node | string | Merge PDF2 | 1 |
| workflows.list.connections.Save Metadata.main[].11.type | string | main | 1 |
| workflows.list.connections.Save Metadata.main[].11.index | number | 1 | 1 |
| workflows.list.connections.Merge PDF | object | 1 | 1 |
| workflows.list.connections.Merge PDF.main | array | 1 | 1 |
| workflows.list.connections.Merge PDF.main[].0 | object | 3 | 1 |
| workflows.list.connections.Merge PDF.main[].0.node | string | Set Final PDF | 1 |
| workflows.list.connections.Merge PDF.main[].0.type | string | main | 1 |
| workflows.list.connections.Merge PDF.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Merge PDF1 | object | 1 | 1 |
| workflows.list.connections.Merge PDF1.main | array | 1 | 1 |
| workflows.list.connections.Merge PDF1.main[].0 | object | 3 | 1 |
| workflows.list.connections.Merge PDF1.main[].0.node | string | Set Final PDF1 | 1 |
| workflows.list.connections.Merge PDF1.main[].0.type | string | main | 1 |
| workflows.list.connections.Merge PDF1.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Merge PDF2 | object | 1 | 1 |
| workflows.list.connections.Merge PDF2.main | array | 1 | 1 |
| workflows.list.connections.Merge PDF2.main[].0 | object | 3 | 1 |
| workflows.list.connections.Merge PDF2.main[].0.node | string | Set Final PDF2 | 1 |
| workflows.list.connections.Merge PDF2.main[].0.type | string | main | 1 |
| workflows.list.connections.Merge PDF2.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Merge PDF3 | object | 1 | 1 |
| workflows.list.connections.Merge PDF3.main | array | 1 | 1 |
| workflows.list.connections.Merge PDF3.main[].0 | object | 3 | 1 |
| workflows.list.connections.Merge PDF3.main[].0.node | string | Set Final PDF3 | 1 |
| workflows.list.connections.Merge PDF3.main[].0.type | string | main | 1 |
| workflows.list.connections.Merge PDF3.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Merge PDF4 | object | 1 | 1 |
| workflows.list.connections.Merge PDF4.main | array | 1 | 1 |
| workflows.list.connections.Merge PDF4.main[].0 | object | 3 | 1 |
| workflows.list.connections.Merge PDF4.main[].0.node | string | Set Final PDF4 | 1 |
| workflows.list.connections.Merge PDF4.main[].0.type | string | main | 1 |
| workflows.list.connections.Merge PDF4.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Merge PDF5 | object | 1 | 1 |
| workflows.list.connections.Merge PDF5.main | array | 1 | 1 |
| workflows.list.connections.Merge PDF5.main[].0 | object | 3 | 1 |
| workflows.list.connections.Merge PDF5.main[].0.node | string | Set Final PDF5 | 1 |
| workflows.list.connections.Merge PDF5.main[].0.type | string | main | 1 |
| workflows.list.connections.Merge PDF5.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Merge PDF6 | object | 1 | 1 |
| workflows.list.connections.Merge PDF6.main | array | 1 | 1 |
| workflows.list.connections.Merge PDF6.main[].0 | object | 3 | 1 |
| workflows.list.connections.Merge PDF6.main[].0.node | string | Set Final PDF6 | 1 |
| workflows.list.connections.Merge PDF6.main[].0.type | string | main | 1 |
| workflows.list.connections.Merge PDF6.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Merge PDF7 | object | 1 | 1 |
| workflows.list.connections.Merge PDF7.main | array | 1 | 1 |
| workflows.list.connections.Merge PDF7.main[].0 | object | 3 | 1 |
| workflows.list.connections.Merge PDF7.main[].0.node | string | Set Final PDF7 | 1 |
| workflows.list.connections.Merge PDF7.main[].0.type | string | main | 1 |
| workflows.list.connections.Merge PDF7.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Merge PDF8 | object | 1 | 1 |
| workflows.list.connections.Merge PDF8.main | array | 1 | 1 |
| workflows.list.connections.Merge PDF8.main[].0 | object | 3 | 1 |
| workflows.list.connections.Merge PDF8.main[].0.node | string | Set Final PDF8 | 1 |
| workflows.list.connections.Merge PDF8.main[].0.type | string | main | 1 |
| workflows.list.connections.Merge PDF8.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Merge PDF9 | object | 1 | 1 |
| workflows.list.connections.Merge PDF9.main | array | 1 | 1 |
| workflows.list.connections.Merge PDF9.main[].0 | object | 3 | 1 |
| workflows.list.connections.Merge PDF9.main[].0.node | string | Set Final PDF9 | 1 |
| workflows.list.connections.Merge PDF9.main[].0.type | string | main | 1 |
| workflows.list.connections.Merge PDF9.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Merge PDF10 | object | 1 | 1 |
| workflows.list.connections.Merge PDF10.main | array | 1 | 1 |
| workflows.list.connections.Merge PDF10.main[].0 | object | 3 | 1 |
| workflows.list.connections.Merge PDF10.main[].0.node | string | Set Final PDF10 | 1 |
| workflows.list.connections.Merge PDF10.main[].0.type | string | main | 1 |
| workflows.list.connections.Merge PDF10.main[].0.index | number | 0 | 1 |
| workflows.list.nodes[].parameters.initialMessages | string | Salve👋
Il mio nome è Milena come posso aiutarla oggi? | 1 |
| workflows.list.connections.Open Router | object | 1 | 1 |
| workflows.list.connections.Open Router.ai_languageModel | array | 1 | 1 |
| workflows.list.connections.OpenRouter Chat Model | object | 1 | 1 |
| workflows.list.connections.OpenRouter Chat Model.ai_languageModel | array | 1 | 1 |
| workflows.list.connections.DeepSeek Chat Model | object | 1 | 1 |
| workflows.list.connections.DeepSeek Chat Model.ai_languageModel | array | 1 | 1 |
| workflows.list.nodes[].parameters.conditions.string[].operation | string | isNotEmpty | 1 |
| workflows.list.connections.Register Subscription | object | 1 | 1 |
| workflows.list.connections.Register Subscription.main | array | 1 | 1 |
| workflows.list.connections.Register Subscription.main[].0 | object | 3 | 1 |
| workflows.list.connections.Register Subscription.main[].0.node | string | Do Nothing - Subscription Created | 1 |
| workflows.list.connections.Register Subscription.main[].0.type | string | main | 1 |
| workflows.list.connections.Register Subscription.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Validation Check | object | 1 | 1 |
| workflows.list.connections.Validation Check.main | array | 2 | 1 |
| workflows.list.connections.Validation Check.main[].0 | object | 3 | 2 |
| workflows.list.connections.Validation Check.main[].0.node | string | Validation Response, Check New Message | 2 |
| workflows.list.connections.Validation Check.main[].0.type | string | main | 2 |
| workflows.list.connections.Validation Check.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Validation Response | object | 1 | 1 |
| workflows.list.connections.Validation Response.main | array | 1 | 1 |
| workflows.list.connections.Validation Response.main[].0 | object | 3 | 1 |
| workflows.list.connections.Validation Response.main[].0.node | string | Do Nothing - Validation | 1 |
| workflows.list.connections.Validation Response.main[].0.type | string | main | 1 |
| workflows.list.connections.Validation Response.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Check New Message | object | 1 | 1 |
| workflows.list.connections.Check New Message.main | array | 2 | 1 |
| workflows.list.connections.Check New Message.main[].0 | object | 3 | 2 |
| workflows.list.connections.Check New Message.main[].0.node | string | Get Email Details, Do Nothing - Not Message | 2 |
| workflows.list.connections.Check New Message.main[].0.type | string | main | 2 |
| workflows.list.connections.Check New Message.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Get Email Details | object | 1 | 1 |
| workflows.list.connections.Get Email Details.main | array | 1 | 1 |
| workflows.list.connections.Get Email Details.main[].0 | object | 3 | 1 |
| workflows.list.connections.Get Email Details.main[].0.node | string | Check if Unread | 1 |
| workflows.list.connections.Get Email Details.main[].0.type | string | main | 1 |
| workflows.list.connections.Get Email Details.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Check if Unread | object | 1 | 1 |
| workflows.list.connections.Check if Unread.main | array | 2 | 1 |
| workflows.list.connections.Check if Unread.main[].0 | object | 3 | 2 |
| workflows.list.connections.Check if Unread.main[].0.node | string | Process Unread Email, Do Nothing - Already Read | 2 |
| workflows.list.connections.Check if Unread.main[].0.type | string | main | 2 |
| workflows.list.connections.Check if Unread.main[].0.index | number | 0 | 2 |
| workflows.list.connections.Process Unread Email | object | 1 | 1 |
| workflows.list.connections.Process Unread Email.main | array | 1 | 1 |
| workflows.list.connections.Process Unread Email.main[].0 | object | 3 | 1 |
| workflows.list.connections.Process Unread Email.main[].0.node | string | Do Nothing - Email Processed | 1 |
| workflows.list.connections.Process Unread Email.main[].0.type | string | main | 1 |
| workflows.list.connections.Process Unread Email.main[].0.index | number | 0 | 1 |
| workflows.list.connections.verify Subscription1 | object | 1 | 1 |
| workflows.list.connections.verify Subscription1.main | array | 1 | 1 |
| workflows.list.connections.verify Subscription1.main[].0 | object | 3 | 1 |
| workflows.list.connections.verify Subscription1.main[].0.node | string | Code | 1 |
| workflows.list.connections.verify Subscription1.main[].0.type | string | main | 1 |
| workflows.list.connections.verify Subscription1.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Filter Duplicates | object | 1 | 1 |
| workflows.list.connections.Filter Duplicates.main | array | 1 | 1 |
| workflows.list.connections.Filter Duplicates.main[].0 | object | 3 | 1 |
| workflows.list.connections.Filter Duplicates.main[].0.node | string | Delete Subscription | 1 |
| workflows.list.connections.Filter Duplicates.main[].0.type | string | main | 1 |
| workflows.list.connections.Filter Duplicates.main[].0.index | number | 0 | 1 |
| workflows.list.nodes[].parameters.options.maxIterations | number | 10 | 1 |
| workflows.list.nodes[].parameters.options.returnIntermediateSteps | boolean | true | 1 |
| workflows.list.connections.Chat Trigger | object | 1 | 1 |
| workflows.list.connections.Chat Trigger.main | array | 1 | 1 |
| workflows.list.connections.Chat Trigger.main[].0 | object | 3 | 1 |
| workflows.list.connections.Chat Trigger.main[].0.node | string | AI Agent | 1 |
| workflows.list.connections.Chat Trigger.main[].0.type | string | main | 1 |
| workflows.list.connections.Chat Trigger.main[].0.index | number | 0 | 1 |
| workflows.list.connections.Window Buffer Memory.main | array | 1 | 1 |
| workflows.list.connections.OpenAI Chat Model.main | array | 1 | 1 |
| workflows.list.connections.PilotPro Knowledge Base | object | 2 | 1 |
| workflows.list.connections.PilotPro Knowledge Base.main | array | 1 | 1 |
| workflows.list.connections.PilotPro Knowledge Base.ai_tool | array | 1 | 1 |
| workflows.list.connections.PilotPro Knowledge Base.ai_tool[].0 | object | 3 | 1 |
| workflows.list.connections.PilotPro Knowledge Base.ai_tool[].0.node | string | AI Agent | 1 |
| workflows.list.connections.PilotPro Knowledge Base.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.list.connections.PilotPro Knowledge Base.ai_tool[].0.index | number | 0 | 1 |
| workflows.list.connections.Vector Store Retriever | object | 2 | 1 |
| workflows.list.connections.Vector Store Retriever.main | array | 1 | 1 |
| workflows.list.connections.Vector Store Retriever.ai_retriever | array | 1 | 1 |
| workflows.list.connections.Vector Store Retriever.ai_retriever[].0 | object | 3 | 1 |
| workflows.list.connections.Vector Store Retriever.ai_retriever[].0.node | string | PilotPro Knowledge Base | 1 |
| workflows.list.connections.Vector Store Retriever.ai_retriever[].0.type | string | ai_retriever | 1 |
| workflows.list.connections.Vector Store Retriever.ai_retriever[].0.index | number | 0 | 1 |
| workflows.list.connections.Cohere Reranker | object | 2 | 1 |
| workflows.list.connections.Cohere Reranker.main | array | 1 | 1 |
| workflows.list.connections.Cohere Reranker.ai_reranker | array | 1 | 1 |
| workflows.list.connections.Cohere Reranker.ai_reranker[].0 | object | 3 | 1 |
| workflows.list.connections.Cohere Reranker.ai_reranker[].0.node | string | Vector Store Retriever | 1 |
| workflows.list.connections.Cohere Reranker.ai_reranker[].0.type | string | ai_reranker | 1 |
| workflows.list.connections.Cohere Reranker.ai_reranker[].0.index | number | 0 | 1 |
| workflows.list.connections.OpenAI Embeddings | object | 2 | 1 |
| workflows.list.connections.OpenAI Embeddings.main | array | 1 | 1 |
| workflows.list.connections.OpenAI Embeddings.ai_embedding | array | 1 | 1 |
| workflows.list.connections.OpenAI Embeddings.ai_embedding[].0 | object | 3 | 1 |
| workflows.list.connections.OpenAI Embeddings.ai_embedding[].0.node | string | Pinecone Vector Store | 1 |
| workflows.list.connections.OpenAI Embeddings.ai_embedding[].0.type | string | ai_embedding | 1 |
| workflows.list.connections.OpenAI Embeddings.ai_embedding[].0.index | number | 0 | 1 |
| workflows.list.connections.Schedule Expert Call | object | 2 | 1 |
| workflows.list.connections.Schedule Expert Call.main | array | 1 | 1 |
| workflows.list.connections.Schedule Expert Call.ai_tool | array | 1 | 1 |
| workflows.list.connections.Schedule Expert Call.ai_tool[].0 | object | 3 | 1 |
| workflows.list.connections.Schedule Expert Call.ai_tool[].0.node | string | AI Agent | 1 |
| workflows.list.connections.Schedule Expert Call.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.list.connections.Schedule Expert Call.ai_tool[].0.index | number | 0 | 1 |
| workflows.detail | object | 16 | 5 |
| workflows.detail.createdAt | string | 2025-06-20T13:50:12.556Z, 2025-06-13T19:13:11.999Z | 5 |
| workflows.detail.updatedAt | string | 2025-06-28T14:35:35.000Z, 2025-06-13T21:41:59.000Z | 5 |
| workflows.detail.id | string | 053vrF50XdC1ciOA, 0BHv8Kqy4TxBfoud | 5 |
| workflows.detail.name | string | RETURN VALIDATION & INTAKE, My workflow 4 | 5 |
| workflows.detail.active | boolean | true, false | 5 |
| workflows.detail.isArchived | boolean | false, true | 5 |
| workflows.detail.nodes | array | 32, 8 | 5 |
| workflows.detail.nodes[].parameters | object | 1, 2 | 15 |
| workflows.detail.nodes[].parameters.jsCode | string | // Mappa i dati del form
const motivoMap = {
  'prodotto_errato': 'GOMMEGO',
  'ordine_sbagliato': ' | 1 |
| workflows.detail.nodes[].parameters.values | object | 1 | 2 |
| workflows.detail.nodes[].parameters.values.string | array | 2 | 2 |
| workflows.detail.nodes[].parameters.values.string[].name | string | rma, Tipo Reso | 4 |
| workflows.detail.nodes[].parameters.values.string[].value | string | RMA-2024-{{ Math.floor(Math.random() * 10000) }}, RESO CON ADDEBITO FORNITORE | 4 |
| workflows.detail.nodes[].parameters.options | object | 0, 1 | 7 |
| workflows.detail.nodes[].id | string | 38eac349-913b-4304-91f6-77e2762aa33e, ae8650ec-95c3-4161-a288-924c07aeb748 | 15 |
| workflows.detail.nodes[].name | string | Prepara Dati, Genera RMA | 15 |
| workflows.detail.nodes[].type | string | n8n-nodes-base.code, n8n-nodes-base.set | 15 |
| workflows.detail.nodes[].typeVersion | number | 1, 3.4 | 15 |
| workflows.detail.nodes[].position | array | 2 | 15 |
| workflows.detail.nodes[].webhookId | string | 2c77a0da-6beb-48b1-acc8-bc20b702449e, 519b8f23-e21c-430e-a1ee-45e8570596f8 | 10 |
| workflows.detail.nodes[].credentials | object | 1 | 13 |
| workflows.detail.nodes[].credentials.googleDriveOAuth2Api | object | 2 | 1 |
| workflows.detail.nodes[].credentials.googleDriveOAuth2Api.id | string | WBhAeqmWykJUM02S | 1 |
| workflows.detail.nodes[].credentials.googleDriveOAuth2Api.name | string | Google Drive account | 1 |
| workflows.detail.nodes[].credentials.openAiApi | object | 2 | 2 |
| workflows.detail.nodes[].credentials.openAiApi.id | string | PWlkktuNL3ZIywBy | 2 |
| workflows.detail.nodes[].credentials.openAiApi.name | string | OpenAi account | 2 |
| workflows.detail.nodes[].credentials.googlePalmApi | object | 2 | 1 |
| workflows.detail.nodes[].credentials.googlePalmApi.id | string | owVOESxC0E1TNLDF | 1 |
| workflows.detail.nodes[].credentials.googlePalmApi.name | string | Google Gemini(PaLM) GommeGo | 1 |
| workflows.detail.nodes[].alwaysOutputData | boolean | true | 5 |
| workflows.detail.nodes[].notes | string | Valida il file caricato: controlla formato, dimensione e prepara per upload. Converte da base64 a bi, 🔹 Agente AI per diagnosi embedding | 3 |
| workflows.detail.nodes[].notesInFlow | boolean | true | 1 |
| workflows.detail.connections | object | 24, 6 | 5 |
| workflows.detail.connections.Genera RMA | object | 1 | 1 |
| workflows.detail.connections.Genera RMA.main | array | 1 | 1 |
| workflows.detail.connections.Prepara Email | object | 1 | 1 |
| workflows.detail.connections.Prepara Email.main | array | 1 | 1 |
| workflows.detail.connections.On form submission | object | 1 | 2 |
| workflows.detail.connections.On form submission.main | array | 1 | 2 |
| workflows.detail.connections.On form submission.main[].0 | object | 3 | 2 |
| workflows.detail.connections.On form submission.main[].0.node | string | Mappa Dati, Leggi Email Non Lette | 2 |
| workflows.detail.connections.On form submission.main[].0.type | string | main | 2 |
| workflows.detail.connections.On form submission.main[].0.index | number | 0 | 2 |
| workflows.detail.connections.On form submission.main[].1 | object | 3 | 1 |
| workflows.detail.connections.On form submission.main[].1.node | string | Estrai Testo | 1 |
| workflows.detail.connections.On form submission.main[].1.type | string | main | 1 |
| workflows.detail.connections.On form submission.main[].1.index | number | 0 | 1 |
| workflows.detail.connections.On form submission.main[].2 | object | 3 | 1 |
| workflows.detail.connections.On form submission.main[].2.node | string | Carica immagini Merce | 1 |
| workflows.detail.connections.On form submission.main[].2.type | string | main | 1 |
| workflows.detail.connections.On form submission.main[].2.index | number | 0 | 1 |
| workflows.detail.connections.Prepara Dati | object | 1 | 1 |
| workflows.detail.connections.Prepara Dati.main | array | 1 | 1 |
| workflows.detail.connections.Genera RMA1 | object | 1 | 1 |
| workflows.detail.connections.Genera RMA1.main | array | 1 | 1 |
| workflows.detail.connections.Convert to File1 | object | 1 | 1 |
| workflows.detail.connections.Convert to File1.main | array | 1 | 1 |
| workflows.detail.connections.Estrai Testo | object | 1 | 1 |
| workflows.detail.connections.Estrai Testo.main | array | 1 | 1 |
| workflows.detail.connections.Estrai Testo.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Estrai Testo.main[].0.node | string | Formatta Dati | 1 |
| workflows.detail.connections.Estrai Testo.main[].0.type | string | main | 1 |
| workflows.detail.connections.Estrai Testo.main[].0.index | number | 0 | 1 |
| workflows.detail.connections.Validazione File | object | 1 | 1 |
| workflows.detail.connections.Validazione File.main | array | 1 | 1 |
| workflows.detail.connections.Mappa Dati | object | 1 | 1 |
| workflows.detail.connections.Mappa Dati.main | array | 1 | 1 |
| workflows.detail.connections.Mappa Dati.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Mappa Dati.main[].0.node | string | Merge | 1 |
| workflows.detail.connections.Mappa Dati.main[].0.type | string | main | 1 |
| workflows.detail.connections.Mappa Dati.main[].0.index | number | 0 | 1 |
| workflows.detail.connections.Formatta Dati | object | 1 | 1 |
| workflows.detail.connections.Formatta Dati.main | array | 1 | 1 |
| workflows.detail.connections.Formatta Dati.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Formatta Dati.main[].0.node | string | Merge | 1 |
| workflows.detail.connections.Formatta Dati.main[].0.type | string | main | 1 |
| workflows.detail.connections.Formatta Dati.main[].0.index | number | 1 | 1 |
| workflows.detail.connections.Merge | object | 1 | 4 |
| workflows.detail.connections.Merge.main | array | 1 | 4 |
| workflows.detail.connections.Merge.main[].0 | object | 3 | 4 |
| workflows.detail.connections.Merge.main[].0.node | string | Merge1, Aggregate Report | 4 |
| workflows.detail.connections.Merge.main[].0.type | string | main | 4 |
| workflows.detail.connections.Merge.main[].0.index | number | 0 | 4 |
| workflows.detail.connections.Merge.main[].1 | object | 3 | 1 |
| workflows.detail.connections.Merge.main[].1.node | string | MAPPA NUMERO ORDINE | 1 |
| workflows.detail.connections.Merge.main[].1.type | string | main | 1 |
| workflows.detail.connections.Merge.main[].1.index | number | 0 | 1 |
| workflows.detail.connections.Google Gemini Chat Model | object | 1 | 1 |
| workflows.detail.connections.Google Gemini Chat Model.ai_languageModel | array | 1 | 1 |
| workflows.detail.connections.Google Gemini Chat Model.ai_languageModel[].0 | object | 3 | 1 |
| workflows.detail.connections.Google Gemini Chat Model.ai_languageModel[].0.node | string | VALIDAZIONE E INTAKE | 1 |
| workflows.detail.connections.Google Gemini Chat Model.ai_languageModel[].0.type | string | ai_languageModel | 1 |
| workflows.detail.connections.Google Gemini Chat Model.ai_languageModel[].0.index | number | 0 | 1 |
| workflows.detail.connections.Call n8n Workflow Tool | object | 1 | 1 |
| workflows.detail.connections.Call n8n Workflow Tool.ai_tool | array | 1 | 1 |
| workflows.detail.connections.Call n8n Workflow Tool.ai_tool[].0 | object | 3 | 1 |
| workflows.detail.connections.Call n8n Workflow Tool.ai_tool[].0.node | string | VALIDAZIONE E INTAKE | 1 |
| workflows.detail.connections.Call n8n Workflow Tool.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.detail.connections.Call n8n Workflow Tool.ai_tool[].0.index | number | 0 | 1 |
| workflows.detail.connections.Supabase | object | 1 | 1 |
| workflows.detail.connections.Supabase.ai_tool | array | 1 | 1 |
| workflows.detail.connections.Supabase.ai_tool[].0 | object | 3 | 1 |
| workflows.detail.connections.Supabase.ai_tool[].0.node | string | VALIDAZIONE E INTAKE | 1 |
| workflows.detail.connections.Supabase.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.detail.connections.Supabase.ai_tool[].0.index | number | 0 | 1 |
| workflows.detail.connections.Carica immagini Merce | object | 1 | 1 |
| workflows.detail.connections.Carica immagini Merce.main | array | 1 | 1 |
| workflows.detail.connections.Carica immagini Merce.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Carica immagini Merce.main[].0.node | string | Mappa nome File | 1 |
| workflows.detail.connections.Carica immagini Merce.main[].0.type | string | main | 1 |
| workflows.detail.connections.Carica immagini Merce.main[].0.index | number | 0 | 1 |
| workflows.detail.connections.If | object | 1 | 1 |
| workflows.detail.connections.If.main | array | 2 | 1 |
| workflows.detail.connections.If.main[].0 | object | 3 | 2 |
| workflows.detail.connections.If.main[].0.node | string | Genera RMA, Genera RMA1 | 2 |
| workflows.detail.connections.If.main[].0.type | string | main | 2 |
| workflows.detail.connections.If.main[].0.index | number | 0 | 2 |
| workflows.detail.connections.Mappa nome File | object | 1 | 1 |
| workflows.detail.connections.Mappa nome File.main | array | 1 | 1 |
| workflows.detail.connections.Mappa nome File.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Mappa nome File.main[].0.node | string | Merge | 1 |
| workflows.detail.connections.Mappa nome File.main[].0.type | string | main | 1 |
| workflows.detail.connections.Mappa nome File.main[].0.index | number | 2 | 1 |
| workflows.detail.connections.MAPPA NUMERO ORDINE | object | 1 | 1 |
| workflows.detail.connections.MAPPA NUMERO ORDINE.main | array | 1 | 1 |
| workflows.detail.connections.MAPPA NUMERO ORDINE.main[].0 | object | 3 | 1 |
| workflows.detail.connections.MAPPA NUMERO ORDINE.main[].0.node | string | Execute Workflow | 1 |
| workflows.detail.connections.MAPPA NUMERO ORDINE.main[].0.type | string | main | 1 |
| workflows.detail.connections.MAPPA NUMERO ORDINE.main[].0.index | number | 0 | 1 |
| workflows.detail.connections.INSERT CAMPI RMA | object | 1 | 1 |
| workflows.detail.connections.INSERT CAMPI RMA.main | array | 1 | 1 |
| workflows.detail.connections.Execute Workflow | object | 1 | 1 |
| workflows.detail.connections.Execute Workflow.main | array | 1 | 1 |
| workflows.detail.connections.Execute Workflow.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Execute Workflow.main[].0.node | string | Merge1 | 1 |
| workflows.detail.connections.Execute Workflow.main[].0.type | string | main | 1 |
| workflows.detail.connections.Execute Workflow.main[].0.index | number | 1 | 1 |
| workflows.detail.connections.Merge1 | object | 1 | 1 |
| workflows.detail.connections.Merge1.main | array | 1 | 1 |
| workflows.detail.connections.Merge1.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Merge1.main[].0.node | string | numero ordine esiste? | 1 |
| workflows.detail.connections.Merge1.main[].0.type | string | main | 1 |
| workflows.detail.connections.Merge1.main[].0.index | number | 0 | 1 |
| workflows.detail.connections.numero ordine esiste? | object | 1 | 1 |
| workflows.detail.connections.numero ordine esiste?.main | array | 2 | 1 |
| workflows.detail.connections.numero ordine esiste?.main[].0 | object | 3 | 2 |
| workflows.detail.connections.numero ordine esiste?.main[].0.node | string | Validazione ed RMA, Form | 2 |
| workflows.detail.connections.numero ordine esiste?.main[].0.type | string | main | 2 |
| workflows.detail.connections.numero ordine esiste?.main[].0.index | number | 0 | 2 |
| workflows.detail.connections.If1 | object | 1 | 1 |
| workflows.detail.connections.If1.main | array | 2 | 1 |
| workflows.detail.connections.If1.main[].0 | object | 3 | 2 |
| workflows.detail.connections.If1.main[].0.node | string | UPSERT CAMPI RMA, Form1 | 2 |
| workflows.detail.connections.If1.main[].0.type | string | main | 2 |
| workflows.detail.connections.If1.main[].0.index | number | 0 | 2 |
| workflows.detail.connections.Validazione ed RMA | object | 1 | 1 |
| workflows.detail.connections.Validazione ed RMA.main | array | 1 | 1 |
| workflows.detail.connections.Validazione ed RMA.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Validazione ed RMA.main[].0.node | string | If1 | 1 |
| workflows.detail.connections.Validazione ed RMA.main[].0.type | string | main | 1 |
| workflows.detail.connections.Validazione ed RMA.main[].0.index | number | 0 | 1 |
| workflows.detail.settings | object | 1, 3 | 5 |
| workflows.detail.settings.executionOrder | string | v1 | 5 |
| workflows.detail.meta | object | 1 | 3 |
| workflows.detail.meta.templateCredsSetupCompleted | boolean | true | 3 |
| workflows.detail.pinData | object | 1, 0 | 5 |
| workflows.detail.pinData.Form1 | array | 1 | 1 |
| workflows.detail.pinData.Form1[].json | object | 57 | 1 |
| workflows.detail.pinData.Form1[].json.Nome e Cognome cliente | string | Carlo martino | 1 |
| workflows.detail.pinData.Form1[].json.Email di conferma ordine | string | supplires@tecsolutions.app | 1 |
| workflows.detail.pinData.Form1[].json.Nr Ordine | string | WHQTNRXIZ | 1 |
| workflows.detail.pinData.Form1[].json.Data ricezione merce | string | 2025-06-13 | 1 |
| workflows.detail.pinData.Form1[].json.Motivo della restituzione  | string | Ho ricevuto merce sbagliata | 1 |
| workflows.detail.pinData.Form1[].json.Descrizione del problema  | string | merce completamente sbagliata | 1 |
| workflows.detail.pinData.Form1[].json.Foto allegate? | string | false | 1 |
| workflows.detail.pinData.Form1[].json.data inoltro richiesta | string | 2025-06-22 | 1 |
| workflows.detail.pinData.Form1[].json.testo_estratto | string | 1. 

```
NANKANG 
WINTER ACTIVA
N-607+
215/55 R16
97V XL

E
C
72 dB

C

EU
```

2. | 1 |
| workflows.detail.pinData.Form1[].json.descrizione_immagine | string | L'immagine mostra un pacco di quattro pneumatici sovrapposti e avvolti in pellicola trasparente da i | 1 |
| workflows.detail.pinData.Form1[].json.Nome Foto Allegata | string | WHQTNRXIZ - Carlo martino - 2025-06-13 | 1 |
| workflows.detail.pinData.Form1[].json.orderFound | boolean | true | 1 |
| workflows.detail.pinData.Form1[].json.order_reference | string | WHQTNRXIZ | 1 |
| workflows.detail.pinData.Form1[].json.order_status | string | Consegnato | 1 |
| workflows.detail.pinData.Form1[].json.order_shipping_number | string | 1ZR1J1466800230797 | 1 |
| workflows.detail.pinData.Form1[].json.order_payment_method | string | PayPal | 1 |
| workflows.detail.pinData.Form1[].json.order_date_created | string | 2025-06-09 12:22:57 | 1 |
| workflows.detail.pinData.Form1[].json.order_date_updated | string | 2025-06-20 21:33:22 | 1 |
| workflows.detail.pinData.Form1[].json.order_total_paid | string | € 211.00 | 1 |
| workflows.detail.pinData.Form1[].json.order_total_products | string | € 161.36 | 1 |
| workflows.detail.pinData.Form1[].json.order_total_products_with_tax | string | € 196.84 | 1 |
| workflows.detail.pinData.Form1[].json.order_products_0_name | string | NEXEN N BLUE HD PLUS 155/65 R14 75T | 1 |
| workflows.detail.pinData.Form1[].json.order_products_0_reference | string | 981110000163006 | 1 |
| workflows.detail.pinData.Form1[].json.order_products_0_ean | string | 8807622509902 | 1 |
| workflows.detail.pinData.Form1[].json.order_products_0_quantity | number | 4 | 1 |
| workflows.detail.pinData.Form1[].json.order_products_0_unit_price | string | € 49.21 | 1 |
| workflows.detail.pinData.Form1[].json.order_products_0_total_price | string | € 196.84 | 1 |
| workflows.detail.pinData.Form1[].json.customer_full_name | string | Carlo Martino | 1 |
| workflows.detail.pinData.Form1[].json.customer_email | string | carlo.martino@martino.it | 1 |
| workflows.detail.pinData.Form1[].json.customer_phone | string | 0805618333 | 1 |
| workflows.detail.pinData.Form1[].json.customer_is_active | boolean | true | 1 |
| workflows.detail.pinData.Form1[].json.customer_customer_since | string | 2019-04-30 18:53:35 | 1 |
| workflows.detail.pinData.Form1[].json.delivery_recipient | string | Carlo Martino | 1 |
| workflows.detail.pinData.Form1[].json.delivery_street | string | Via Delle Murge 80 | 1 |
| workflows.detail.pinData.Form1[].json.delivery_city | string | BARI | 1 |
| workflows.detail.pinData.Form1[].json.delivery_postcode | string | 70124 | 1 |
| workflows.detail.pinData.Form1[].json.delivery_country | string | Italia | 1 |
| workflows.detail.pinData.Form1[].json.delivery_phone | string | 0805618333 | 1 |
| workflows.detail.pinData.Form1[].json.shipment_tracking_number | string | 1ZR1J1466800230797 | 1 |
| workflows.detail.pinData.Form1[].json.shipment_tracking_url | string | https://www.ups.com/track?loc=it_IT&tracknum=1ZR1J1466800230797&requester=WT/trackdetails | 1 |
| workflows.detail.pinData.Form1[].json.shipment_latest_status | string | Consegnato | 1 |
| workflows.detail.pinData.Form1[].json.shipment_latest_status_date | string | 2025-06-13T11:04:00+00:00 | 1 |
| workflows.detail.pinData.Form1[].json.shipment_departure_date | string | 2025-06-11T13:33:00+00:00 | 1 |
| workflows.detail.pinData.Form1[].json.shipment_arrival_date | string | 2025-06-13T11:04:00+00:00 | 1 |
| workflows.detail.pinData.Form1[].json.shipment_delivery_history_0 | string | 2025-06-13: Consegnato | 1 |
| workflows.detail.pinData.Form1[].json.shipment_delivery_history_1 | string | 2025-06-13: In consegna oggi | 1 |
| workflows.detail.pinData.Form1[].json.shipment_delivery_history_2 | string | 2025-06-13: In elaborazione presso la struttura UPS | 1 |
| workflows.detail.pinData.Form1[].json.shipment_delivery_history_3 | string | 2025-06-12: Partito dal centro | 1 |
| workflows.detail.pinData.Form1[].json.shipment_delivery_history_4 | string | 2025-06-12: Arrivato al centro | 1 |
| workflows.detail.pinData.Form1[].json.shipment_delivery_history_5 | string | 2025-06-12: Partito dal centro | 1 |
| workflows.detail.pinData.Form1[].json.shipment_delivery_history_6 | string | 2025-06-12: Arrivato al centro | 1 |
| workflows.detail.pinData.Form1[].json.shipment_delivery_history_7 | string | 2025-06-11: Il mittente ha creato un'etichetta, UPS non ha ancora ricevuto il pacco | 1 |
| workflows.detail.pinData.Form1[].json.Response | string | ✅ Ordine trovato: WHQTNRXIZ | 1 |
| workflows.detail.pinData.Form1[].json.shipment_arrival_date_normalizzata | string | 2025-06-13 | 1 |
| workflows.detail.pinData.Form1[].json.data_inoltro_richiesta_normalizzata | string | 2025-06-22 | 1 |
| workflows.detail.pinData.Form1[].json.reso richiesto entro 14 giorni | boolean | true | 1 |
| workflows.detail.pinData.Form1[].json.giorni passati | number | 9 | 1 |
| workflows.detail.versionId | string | f696720d-965e-4727-823e-a38652a9db49, b8e147e8-5a04-4079-ac62-b5c2ccd9d0b8 | 5 |
| workflows.detail.triggerCount | number | 1, 0 | 5 |
| workflows.detail.shared | array | 1 | 5 |
| workflows.detail.shared[].createdAt | string | 2025-06-20T13:50:12.562Z, 2025-06-13T19:13:12.004Z | 5 |
| workflows.detail.shared[].updatedAt | string | 2025-06-20T13:50:12.562Z, 2025-06-13T19:13:12.004Z | 5 |
| workflows.detail.shared[].role | string | workflow:owner | 5 |
| workflows.detail.shared[].workflowId | string | 053vrF50XdC1ciOA, 0BHv8Kqy4TxBfoud | 5 |
| workflows.detail.shared[].projectId | string | faRAVziI0wwHAtrH | 5 |
| workflows.detail.shared[].project | object | 8 | 5 |
| workflows.detail.shared[].project.createdAt | string | 2025-05-08T14:10:38.888Z | 5 |
| workflows.detail.shared[].project.updatedAt | string | 2025-05-08T14:14:47.889Z | 5 |
| workflows.detail.shared[].project.id | string | faRAVziI0wwHAtrH | 5 |
| workflows.detail.shared[].project.name | string | Tiziano Annicchiarico <tiziano.annicchiarico@tecsolutions.org> | 5 |
| workflows.detail.shared[].project.type | string | personal | 5 |
| workflows.detail.shared[].project.projectRelations | array | 1 | 5 |
| workflows.detail.shared[].project.projectRelations[].createdAt | string | 2025-05-08T14:10:38.888Z | 5 |
| workflows.detail.shared[].project.projectRelations[].updatedAt | string | 2025-05-08T14:10:38.888Z | 5 |
| workflows.detail.shared[].project.projectRelations[].role | string | project:personalOwner | 5 |
| workflows.detail.shared[].project.projectRelations[].userId | string | d2011ea3-1757-483b-807c-1a1cadfe7618 | 5 |
| workflows.detail.shared[].project.projectRelations[].projectId | string | faRAVziI0wwHAtrH | 5 |
| workflows.detail.shared[].project.projectRelations[].user | object | 13 | 5 |
| workflows.detail.shared[].project.projectRelations[].user.createdAt | string | 2025-05-08T14:10:38.611Z | 5 |
| workflows.detail.shared[].project.projectRelations[].user.updatedAt | string | 2025-08-11T22:01:00.000Z | 5 |
| workflows.detail.shared[].project.projectRelations[].user.id | string | d2011ea3-1757-483b-807c-1a1cadfe7618 | 5 |
| workflows.detail.shared[].project.projectRelations[].user.email | string | tiziano.annicchiarico@tecsolutions.org | 5 |
| workflows.detail.shared[].project.projectRelations[].user.firstName | string | Tiziano | 5 |
| workflows.detail.shared[].project.projectRelations[].user.lastName | string | Annicchiarico | 5 |
| workflows.detail.shared[].project.projectRelations[].user.personalizationAnswers | object | 5 | 5 |
| workflows.detail.shared[].project.projectRelations[].user.settings | object | 5 | 5 |
| workflows.detail.shared[].project.projectRelations[].user.role | string | global:owner | 5 |
| workflows.detail.shared[].project.projectRelations[].user.disabled | boolean | false | 5 |
| workflows.detail.shared[].project.projectRelations[].user.mfaEnabled | boolean | false | 5 |
| workflows.detail.shared[].project.projectRelations[].user.lastActiveAt | string | 2025-08-11 | 5 |
| workflows.detail.shared[].project.projectRelations[].user.isPending | boolean | false | 5 |
| workflows.detail.tags | array | 0, 2 | 5 |
| workflows.detail.nodes[].parameters.triggerTimes | object | 1 | 1 |
| workflows.detail.nodes[].parameters.triggerTimes.item | array | 1 | 1 |
| workflows.detail.nodes[].parameters.triggerTimes.item[].mode | string | custom | 1 |
| workflows.detail.nodes[].parameters.triggerTimes.item[].cronExpression | string | 0 8,21 * * * | 1 |
| workflows.detail.nodes[].parameters.functionCode | string | // 📊 REPORT AGGREGATOR 
// Con metriche complete e task urgenti

const tasks = $items("TASK").map(i | 1 |
| workflows.detail.nodes[].parameters.operation | string | getAll, move | 2 |
| workflows.detail.nodes[].parameters.tableId | string | smart_tasks, errors | 2 |
| workflows.detail.nodes[].parameters.filters | object | 1 | 1 |
| workflows.detail.nodes[].parameters.filters.conditions | array | 1 | 1 |
| workflows.detail.nodes[].parameters.filters.conditions[].keyName | string | created_at | 1 |
| workflows.detail.nodes[].parameters.filters.conditions[].condition | string | gt | 1 |
| workflows.detail.nodes[].parameters.filters.conditions[].keyValue | string | ={{ new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }} | 1 |
| workflows.detail.nodes[].retryOnFail | boolean | true | 4 |
| workflows.detail.nodes[].credentials.supabaseApi | object | 2 | 3 |
| workflows.detail.nodes[].credentials.supabaseApi.id | string | U18uJwD80Uq036TV, jJWkqm9L91vHyDLJ | 3 |
| workflows.detail.nodes[].credentials.supabaseApi.name | string | Supabase tiziano.annicchiarico@gmail.com, Supabase  ERROR_HANDLING | 3 |
| workflows.detail.nodes[].credentials.telegramApi | object | 2 | 1 |
| workflows.detail.nodes[].credentials.telegramApi.id | string | dbGXwcFAw4mNHLio | 1 |
| workflows.detail.nodes[].credentials.telegramApi.name | string | GommeGoBot | 1 |
| workflows.detail.nodes[].onError | string | continueRegularOutput | 1 |
| workflows.detail.connections.Schedule | object | 1 | 1 |
| workflows.detail.connections.Schedule.main | array | 1 | 1 |
| workflows.detail.connections.Schedule.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Schedule.main[].0.node | string | MAIL | 1 |
| workflows.detail.connections.Schedule.main[].0.type | string | main | 1 |
| workflows.detail.connections.Schedule.main[].0.index | number | 0 | 1 |
| workflows.detail.connections.Schedule.main[].1 | object | 3 | 1 |
| workflows.detail.connections.Schedule.main[].1.node | string | TASK | 1 |
| workflows.detail.connections.Schedule.main[].1.type | string | main | 1 |
| workflows.detail.connections.Schedule.main[].1.index | number | 0 | 1 |
| workflows.detail.connections.Aggregate Report | object | 1 | 1 |
| workflows.detail.connections.Aggregate Report.main | array | 1 | 1 |
| workflows.detail.connections.Aggregate Report.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Aggregate Report.main[].0.node | string | Send Report | 1 |
| workflows.detail.connections.Aggregate Report.main[].0.type | string | main | 1 |
| workflows.detail.connections.Aggregate Report.main[].0.index | number | 0 | 1 |
| workflows.detail.connections.Aggregate Report.main[].1 | object | 3 | 1 |
| workflows.detail.connections.Aggregate Report.main[].1.node | string | 📱 Telegram Report | 1 |
| workflows.detail.connections.Aggregate Report.main[].1.type | string | main | 1 |
| workflows.detail.connections.Aggregate Report.main[].1.index | number | 0 | 1 |
| workflows.detail.connections.TASK | object | 1 | 1 |
| workflows.detail.connections.TASK.main | array | 1 | 1 |
| workflows.detail.connections.TASK.main[].0 | object | 3 | 1 |
| workflows.detail.connections.TASK.main[].0.node | string | Merge | 1 |
| workflows.detail.connections.TASK.main[].0.type | string | main | 1 |
| workflows.detail.connections.TASK.main[].0.index | number | 1 | 1 |
| workflows.detail.connections.MAIL | object | 1 | 1 |
| workflows.detail.connections.MAIL.main | array | 1 | 1 |
| workflows.detail.connections.MAIL.main[].0 | object | 3 | 1 |
| workflows.detail.connections.MAIL.main[].0.node | string | Merge | 1 |
| workflows.detail.connections.MAIL.main[].0.type | string | main | 1 |
| workflows.detail.connections.MAIL.main[].0.index | number | 0 | 1 |
| workflows.detail.connections.Send Report | object | 1 | 1 |
| workflows.detail.connections.Send Report.main | array | 2 | 1 |
| workflows.detail.settings.callerPolicy | string | workflowsFromSameOwner | 1 |
| workflows.detail.settings.errorWorkflow | string | 1LreJWx0H8iEqkgn | 1 |
| workflows.detail.nodes[].parameters.assignments | object | 1 | 1 |
| workflows.detail.nodes[].parameters.assignments.assignments | array | 13 | 1 |
| workflows.detail.nodes[].parameters.assignments.assignments[].id | string | db0cb791-2bee-4cbd-8779-7f86c821273a, 9777ff8e-d790-453e-9c79-96d10f49bceb | 3 |
| workflows.detail.nodes[].parameters.assignments.assignments[].name | string | timestamp, =notified | 3 |
| workflows.detail.nodes[].parameters.assignments.assignments[].value | string | ={{ $now }}, false | 3 |
| workflows.detail.nodes[].parameters.assignments.assignments[].type | string | string | 3 |
| workflows.detail.nodes[].parameters.fieldsUi | object | 1 | 1 |
| workflows.detail.nodes[].parameters.fieldsUi.fieldValues | array | 11 | 1 |
| workflows.detail.nodes[].parameters.fieldsUi.fieldValues[].fieldId | string | workflow_name, workflow_id | 3 |
| workflows.detail.nodes[].parameters.fieldsUi.fieldValues[].fieldValue | string | ={{ $json.workflow.name }}, ={{ $json.workflow.id }} | 3 |
| workflows.detail.connections.Mappa Campi | object | 1 | 1 |
| workflows.detail.connections.Mappa Campi.main | array | 1 | 1 |
| workflows.detail.connections.Mappa Campi.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Mappa Campi.main[].0.node | string | Scrive In DB  | 1 |
| workflows.detail.connections.Mappa Campi.main[].0.type | string | main | 1 |
| workflows.detail.connections.Mappa Campi.main[].0.index | number | 0 | 1 |
| workflows.detail.connections.Error Trigger | object | 1 | 1 |
| workflows.detail.connections.Error Trigger.main | array | 1 | 1 |
| workflows.detail.connections.Error Trigger.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Error Trigger.main[].0.node | string | Mappa Campi | 1 |
| workflows.detail.connections.Error Trigger.main[].0.type | string | main | 1 |
| workflows.detail.connections.Error Trigger.main[].0.index | number | 0 | 1 |
| workflows.detail.nodes[].parameters.rule | object | 1 | 1 |
| workflows.detail.nodes[].parameters.rule.interval | array | 1 | 1 |
| workflows.detail.nodes[].parameters.rule.interval[].field | string | minutes | 1 |
| workflows.detail.nodes[].parameters.rule.interval[].minutesInterval | number | 1 | 1 |
| workflows.detail.nodes[].parameters.resource | string | folderMessage | 1 |
| workflows.detail.nodes[].parameters.folderId | object | 4 | 2 |
| workflows.detail.nodes[].parameters.folderId.__rl | boolean | true | 2 |
| workflows.detail.nodes[].parameters.folderId.value | string | AAMkADY5YTU5ODIzLTM5M2MtNGU4Zi04YzNmLTBlYmYxNDNhODNjMAAuAAAAAAAty8lTOVoeRrTqgTQml0B1AQAYYLMeDvsGSqoD | 2 |
| workflows.detail.nodes[].parameters.folderId.mode | string | list | 2 |
| workflows.detail.nodes[].parameters.folderId.cachedResultName | string | FATTURE, Template | 2 |
| workflows.detail.nodes[].parameters.limit | number | 1 | 1 |
| workflows.detail.nodes[].parameters.output | string | fields | 1 |
| workflows.detail.nodes[].parameters.fields | array | 3 | 1 |
| workflows.detail.nodes[].parameters.filtersUI | object | 1 | 1 |
| workflows.detail.nodes[].parameters.filtersUI.values | object | 1 | 1 |
| workflows.detail.nodes[].parameters.filtersUI.values.filters | object | 1 | 1 |
| workflows.detail.nodes[].parameters.options.downloadAttachments | boolean | true | 1 |
| workflows.detail.nodes[].parameters.messageId | object | 3 | 1 |
| workflows.detail.nodes[].parameters.messageId.__rl | boolean | true | 1 |
| workflows.detail.nodes[].parameters.messageId.value | string | ={{ $json.id }} | 1 |
| workflows.detail.nodes[].parameters.messageId.mode | string | id | 1 |
| workflows.detail.nodes[].credentials.microsoftOutlookOAuth2Api | object | 2 | 2 |
| workflows.detail.nodes[].credentials.microsoftOutlookOAuth2Api.id | string | gvsjOBgXBwH8vLH8 | 2 |
| workflows.detail.nodes[].credentials.microsoftOutlookOAuth2Api.name | string | Outlook Supplies | 2 |
| workflows.detail.connections.Schedule Trigger | object | 1 | 1 |
| workflows.detail.connections.Schedule Trigger.main | array | 1 | 1 |
| workflows.detail.connections.Schedule Trigger.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Schedule Trigger.main[].0.node | string | Leggi Email Non Lette | 1 |
| workflows.detail.connections.Schedule Trigger.main[].0.type | string | main | 1 |
| workflows.detail.connections.Schedule Trigger.main[].0.index | number | 0 | 1 |
| workflows.detail.connections.Leggi Email Non Lette | object | 1 | 1 |
| workflows.detail.connections.Leggi Email Non Lette.main | array | 1 | 1 |
| workflows.detail.connections.Leggi Email Non Lette.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Leggi Email Non Lette.main[].0.node | string | Estrai Testo da PDF | 1 |
| workflows.detail.connections.Leggi Email Non Lette.main[].0.type | string | main | 1 |
| workflows.detail.connections.Leggi Email Non Lette.main[].0.index | number | 0 | 1 |
| workflows.detail.connections.Leggi Email Non Lette.main[].1 | object | 3 | 1 |
| workflows.detail.connections.Leggi Email Non Lette.main[].1.node | string | Carica Fattura PDF | 1 |
| workflows.detail.connections.Leggi Email Non Lette.main[].1.type | string | main | 1 |
| workflows.detail.connections.Leggi Email Non Lette.main[].1.index | number | 0 | 1 |
| workflows.detail.connections.Leggi Email Non Lette.main[].2 | object | 3 | 1 |
| workflows.detail.connections.Leggi Email Non Lette.main[].2.node | string | Sposta Email in Template | 1 |
| workflows.detail.connections.Leggi Email Non Lette.main[].2.type | string | main | 1 |
| workflows.detail.connections.Leggi Email Non Lette.main[].2.index | number | 0 | 1 |
| workflows.detail.connections.Sposta Email in Template | object | 1 | 1 |
| workflows.detail.connections.Sposta Email in Template.main | array | 1 | 1 |
| workflows.detail.connections.Estrai Testo da PDF | object | 1 | 1 |
| workflows.detail.connections.Estrai Testo da PDF.main | array | 1 | 1 |
| workflows.detail.connections.Estrai Testo da PDF.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Estrai Testo da PDF.main[].0.node | string | OpenAI Estrazione Dati | 1 |
| workflows.detail.connections.Estrai Testo da PDF.main[].0.type | string | main | 1 |
| workflows.detail.connections.Estrai Testo da PDF.main[].0.index | number | 0 | 1 |
| workflows.detail.connections.OpenAI Estrazione Dati | object | 1 | 1 |
| workflows.detail.connections.OpenAI Estrazione Dati.main | array | 1 | 1 |
| workflows.detail.connections.OpenAI Estrazione Dati.main[].0 | object | 3 | 1 |
| workflows.detail.connections.OpenAI Estrazione Dati.main[].0.node | string | Data Processor & Validator | 1 |
| workflows.detail.connections.OpenAI Estrazione Dati.main[].0.type | string | main | 1 |
| workflows.detail.connections.OpenAI Estrazione Dati.main[].0.index | number | 0 | 1 |
| workflows.detail.connections.Data Processor & Validator | object | 1 | 1 |
| workflows.detail.connections.Data Processor & Validator.main | array | 1 | 1 |
| workflows.detail.connections.Data Processor & Validator.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Data Processor & Validator.main[].0.node | string | Merge | 1 |
| workflows.detail.connections.Data Processor & Validator.main[].0.type | string | main | 1 |
| workflows.detail.connections.Data Processor & Validator.main[].0.index | number | 0 | 1 |
| workflows.detail.connections.Carica Fattura PDF | object | 1 | 1 |
| workflows.detail.connections.Carica Fattura PDF.main | array | 1 | 1 |
| workflows.detail.connections.Carica Fattura PDF.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Carica Fattura PDF.main[].0.node | string | Edit Fields | 1 |
| workflows.detail.connections.Carica Fattura PDF.main[].0.type | string | main | 1 |
| workflows.detail.connections.Carica Fattura PDF.main[].0.index | number | 0 | 1 |
| workflows.detail.connections.Se ITA cancella | object | 1 | 1 |
| workflows.detail.connections.Se ITA cancella.main | array | 2 | 1 |
| workflows.detail.connections.Se ITA cancella.main[].0 | object | 3 | 2 |
| workflows.detail.connections.Se ITA cancella.main[].0.node | string | Cancella by ID, Cambia Nome | 2 |
| workflows.detail.connections.Se ITA cancella.main[].0.type | string | main | 2 |
| workflows.detail.connections.Se ITA cancella.main[].0.index | number | 0 | 2 |
| workflows.detail.connections.Edit Fields | object | 1 | 2 |
| workflows.detail.connections.Edit Fields.main | array | 1 | 2 |
| workflows.detail.connections.Edit Fields.main[].0 | object | 3 | 2 |
| workflows.detail.connections.Edit Fields.main[].0.node | string | Merge, Input Email Data1 | 2 |
| workflows.detail.connections.Edit Fields.main[].0.type | string | main | 2 |
| workflows.detail.connections.Edit Fields.main[].0.index | number | 1, 0 | 2 |
| workflows.detail.connections.JSON Flat2 | object | 1 | 1 |
| workflows.detail.connections.JSON Flat2.main | array | 1 | 1 |
| workflows.detail.connections.JSON Flat2.main[].0 | object | 3 | 1 |
| workflows.detail.connections.JSON Flat2.main[].0.node | string | Se ITA cancella | 1 |
| workflows.detail.connections.JSON Flat2.main[].0.type | string | main | 1 |
| workflows.detail.connections.JSON Flat2.main[].0.index | number | 0 | 1 |
| workflows.detail.connections.Cambia Nome | object | 1 | 1 |
| workflows.detail.connections.Cambia Nome.main | array | 1 | 1 |
| workflows.detail.connections.Cambia Nome.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Cambia Nome.main[].0.node | string | Genera Mail  | 1 |
| workflows.detail.connections.Cambia Nome.main[].0.type | string | main | 1 |
| workflows.detail.connections.Cambia Nome.main[].0.index | number | 0 | 1 |
| workflows.detail.nodes[].parameters.url | string | https://www.gommego.com/api/orders?filter[reference]=[XXXXXX]&output_format=JSON | 1 |
| workflows.detail.nodes[].parameters.authentication | string | genericCredentialType | 1 |
| workflows.detail.nodes[].parameters.genericAuthType | string | httpBasicAuth | 1 |
| workflows.detail.nodes[].parameters.options.customEmailConfig | string | ["UNSEEN"] | 1 |
| workflows.detail.nodes[].parameters.html | string | ={{ $json.textHtml }} | 1 |
| workflows.detail.nodes[].waitBetweenTries | number | 5000 | 1 |
| workflows.detail.nodes[].credentials.httpBasicAuth | object | 2 | 1 |
| workflows.detail.nodes[].credentials.httpBasicAuth.id | string | CDYbffajBgDWgdXn | 1 |
| workflows.detail.nodes[].credentials.httpBasicAuth.name | string | Prestashop-API | 1 |
| workflows.detail.nodes[].credentials.imap | object | 2 | 1 |
| workflows.detail.nodes[].credentials.imap.id | string | VoojIkqtfMuLmw81 | 1 |
| workflows.detail.nodes[].credentials.imap.name | string | IMAP account | 1 |
| workflows.detail.nodes[].credentials.smtp | object | 2 | 1 |
| workflows.detail.nodes[].credentials.smtp.id | string | ognxP8WoHebaMOsi | 1 |
| workflows.detail.nodes[].credentials.smtp.name | string | SMTP INVIO GommeGo | 1 |
| workflows.detail.connections.Email Trigger (IMAP) | object | 1 | 1 |
| workflows.detail.connections.Email Trigger (IMAP).main | array | 1 | 1 |
| workflows.detail.connections.Email Trigger (IMAP).main[].0 | object | 3 | 1 |
| workflows.detail.connections.Email Trigger (IMAP).main[].0.node | string | Limit | 1 |
| workflows.detail.connections.Email Trigger (IMAP).main[].0.type | string | main | 1 |
| workflows.detail.connections.Email Trigger (IMAP).main[].0.index | number | 0 | 1 |
| workflows.detail.connections.Email Classifier | object | 1 | 1 |
| workflows.detail.connections.Email Classifier.main | array | 5 | 1 |
| workflows.detail.connections.Email Classifier.main[].0 | object | 3 | 3 |
| workflows.detail.connections.Email Classifier.main[].0.node | string | Write email, Do nothing | 3 |
| workflows.detail.connections.Email Classifier.main[].0.type | string | main | 3 |
| workflows.detail.connections.Email Classifier.main[].0.index | number | 0 | 3 |
| workflows.detail.connections.Email Classifier.main[].1 | object | 3 | 1 |
| workflows.detail.connections.Email Classifier.main[].1.node | string | Write email | 1 |
| workflows.detail.connections.Email Classifier.main[].1.type | string | main | 1 |
| workflows.detail.connections.Email Classifier.main[].1.index | number | 0 | 1 |
| workflows.detail.connections.Email Summarization Chain | object | 1 | 1 |
| workflows.detail.connections.Email Summarization Chain.main | array | 1 | 1 |
| workflows.detail.connections.Write email | object | 1 | 1 |
| workflows.detail.connections.Write email.main | array | 1 | 1 |
| workflows.detail.connections.Write email.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Write email.main[].0.node | string | Review email | 1 |
| workflows.detail.connections.Write email.main[].0.type | string | main | 1 |
| workflows.detail.connections.Write email.main[].0.index | number | 0 | 1 |
| workflows.detail.connections.Review email | object | 1 | 1 |
| workflows.detail.connections.Review email.main | array | 1 | 1 |
| workflows.detail.connections.Review email.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Review email.main[].0.node | string | Merge | 1 |
| workflows.detail.connections.Review email.main[].0.type | string | main | 1 |
| workflows.detail.connections.Review email.main[].0.index | number | 1 | 1 |
| workflows.detail.connections.OpenAI 4-o-mini | object | 1 | 1 |
| workflows.detail.connections.OpenAI 4-o-mini.ai_languageModel | array | 1 | 1 |
| workflows.detail.connections.OpenAI 4-o-mini.ai_languageModel[].0 | object | 3 | 1 |
| workflows.detail.connections.OpenAI 4-o-mini.ai_languageModel[].0.node | string | Email Classifier | 1 |
| workflows.detail.connections.OpenAI 4-o-mini.ai_languageModel[].0.type | string | ai_languageModel | 1 |
| workflows.detail.connections.OpenAI 4-o-mini.ai_languageModel[].0.index | number | 0 | 1 |
| workflows.detail.connections.OpenAI Chat Model2 | object | 1 | 1 |
| workflows.detail.connections.OpenAI Chat Model2.ai_languageModel | array | 1 | 1 |
| workflows.detail.connections.OpenAI Chat Model2.ai_languageModel[].0 | object | 3 | 1 |
| workflows.detail.connections.OpenAI Chat Model2.ai_languageModel[].0.node | string | Email Summarization Chain | 1 |
| workflows.detail.connections.OpenAI Chat Model2.ai_languageModel[].0.type | string | ai_languageModel | 1 |
| workflows.detail.connections.OpenAI Chat Model2.ai_languageModel[].0.index | number | 0 | 1 |
| workflows.detail.connections.OpenAI Chat Model3 | object | 1 | 1 |
| workflows.detail.connections.OpenAI Chat Model3.ai_languageModel | array | 1 | 1 |
| workflows.detail.connections.OpenAI Chat Model3.ai_languageModel[].0 | object | 3 | 1 |
| workflows.detail.connections.OpenAI Chat Model3.ai_languageModel[].0.node | string | Review email | 1 |
| workflows.detail.connections.OpenAI Chat Model3.ai_languageModel[].0.type | string | ai_languageModel | 1 |
| workflows.detail.connections.OpenAI Chat Model3.ai_languageModel[].0.index | number | 0 | 1 |
| workflows.detail.connections.GET_ID1 | object | 1 | 1 |
| workflows.detail.connections.GET_ID1.ai_tool | array | 1 | 1 |
| workflows.detail.connections.GET_ID1.ai_tool[].0 | object | 3 | 1 |
| workflows.detail.connections.GET_ID1.ai_tool[].0.node | string | Write email | 1 |
| workflows.detail.connections.GET_ID1.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.detail.connections.GET_ID1.ai_tool[].0.index | number | 0 | 1 |
| workflows.detail.connections.OpenAI Chat Model4 | object | 1 | 1 |
| workflows.detail.connections.OpenAI Chat Model4.ai_languageModel | array | 1 | 1 |
| workflows.detail.connections.OpenAI Chat Model4.ai_languageModel[].0 | object | 3 | 1 |
| workflows.detail.connections.OpenAI Chat Model4.ai_languageModel[].0.node | string | Write email | 1 |
| workflows.detail.connections.OpenAI Chat Model4.ai_languageModel[].0.type | string | ai_languageModel | 1 |
| workflows.detail.connections.OpenAI Chat Model4.ai_languageModel[].0.index | number | 0 | 1 |
| workflows.detail.connections.GET_DETAIL1 | object | 1 | 1 |
| workflows.detail.connections.GET_DETAIL1.ai_tool | array | 1 | 1 |
| workflows.detail.connections.GET_DETAIL1.ai_tool[].0 | object | 3 | 1 |
| workflows.detail.connections.GET_DETAIL1.ai_tool[].0.node | string | Write email | 1 |
| workflows.detail.connections.GET_DETAIL1.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.detail.connections.GET_DETAIL1.ai_tool[].0.index | number | 0 | 1 |
| workflows.detail.connections.GET_CUSTOMER1 | object | 1 | 1 |
| workflows.detail.connections.GET_CUSTOMER1.ai_tool | array | 1 | 1 |
| workflows.detail.connections.GET_DELIVERY ADDRESS1 | object | 1 | 1 |
| workflows.detail.connections.GET_DELIVERY ADDRESS1.ai_tool | array | 1 | 1 |
| workflows.detail.connections.Embeddings OpenAI3 | object | 1 | 1 |
| workflows.detail.connections.Embeddings OpenAI3.ai_embedding | array | 1 | 1 |
| workflows.detail.connections.Embeddings OpenAI3.ai_embedding[].0 | object | 3 | 1 |
| workflows.detail.connections.Embeddings OpenAI3.ai_embedding[].0.node | string | Qdrant Vector Store | 1 |
| workflows.detail.connections.Embeddings OpenAI3.ai_embedding[].0.type | string | ai_embedding | 1 |
| workflows.detail.connections.Embeddings OpenAI3.ai_embedding[].0.index | number | 0 | 1 |
| workflows.detail.connections.Limit | object | 1 | 1 |
| workflows.detail.connections.Limit.main | array | 1 | 1 |
| workflows.detail.connections.Limit.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Limit.main[].0.node | string | Formatta mail | 1 |
| workflows.detail.connections.Limit.main[].0.type | string | main | 1 |
| workflows.detail.connections.Limit.main[].0.index | number | 0 | 1 |
| workflows.detail.connections.Markdown | object | 1 | 1 |
| workflows.detail.connections.Markdown.main | array | 1 | 1 |
| workflows.detail.connections.Qdrant Vector Store | object | 1 | 1 |
| workflows.detail.connections.Qdrant Vector Store.ai_tool | array | 1 | 1 |
| workflows.detail.connections.Qdrant Vector Store.ai_tool[].0 | object | 3 | 1 |
| workflows.detail.connections.Qdrant Vector Store.ai_tool[].0.node | string | Write email | 1 |
| workflows.detail.connections.Qdrant Vector Store.ai_tool[].0.type | string | ai_tool | 1 |
| workflows.detail.connections.Qdrant Vector Store.ai_tool[].0.index | number | 0 | 1 |
| workflows.detail.connections.Formatta mail | object | 1 | 1 |
| workflows.detail.connections.Formatta mail.main | array | 1 | 1 |
| workflows.detail.connections.Formatta mail.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Formatta mail.main[].0.node | string | Email Classifier | 1 |
| workflows.detail.connections.Formatta mail.main[].0.type | string | main | 1 |
| workflows.detail.connections.Formatta mail.main[].0.index | number | 0 | 1 |
| workflows.detail.connections.Formatta mail.main[].1 | object | 3 | 1 |
| workflows.detail.connections.Formatta mail.main[].1.node | string | Merge | 1 |
| workflows.detail.connections.Formatta mail.main[].1.type | string | main | 1 |
| workflows.detail.connections.Formatta mail.main[].1.index | number | 0 | 1 |
| workflows.detail.connections.Input Email Data1 | object | 1 | 1 |
| workflows.detail.connections.Input Email Data1.main | array | 1 | 1 |
| workflows.detail.connections.Input Email Data1.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Input Email Data1.main[].0.node | string | Download Signature1 | 1 |
| workflows.detail.connections.Input Email Data1.main[].0.type | string | main | 1 |
| workflows.detail.connections.Input Email Data1.main[].0.index | number | 0 | 1 |
| workflows.detail.connections.Download Signature1 | object | 1 | 1 |
| workflows.detail.connections.Download Signature1.main | array | 1 | 1 |
| workflows.detail.connections.Download Signature1.main[].0 | object | 3 | 1 |
| workflows.detail.connections.Download Signature1.main[].0.node | string | Send Email2 | 1 |
| workflows.detail.connections.Download Signature1.main[].0.type | string | main | 1 |
| workflows.detail.connections.Download Signature1.main[].0.index | number | 0 | 1 |
| workflows.detail.tags[].createdAt | string | 2025-05-09T12:54:15.672Z, 2025-05-08T22:21:18.131Z | 2 |
| workflows.detail.tags[].updatedAt | string | 2025-05-09T12:54:15.672Z, 2025-05-08T22:21:18.131Z | 2 |
| workflows.detail.tags[].id | string | Vh2Oww2GTJVNG58l, jubCCEoeIKClOxYP | 2 |
| workflows.detail.tags[].name | string | Vector, GommeGo | 2 |

### executions

| Path | Type | Examples | Occurrences |
|------|------|----------|-------------|
| executions.list | object | 9 | 10 |
| executions.list.id | string | 110417, 110416 | 10 |
| executions.list.finished | boolean | true | 10 |
| executions.list.mode | string | trigger | 10 |
| executions.list.startedAt | string | 2025-08-12T12:20:28.026Z, 2025-08-12T12:20:26.025Z | 10 |
| executions.list.stoppedAt | string | 2025-08-12T12:20:28.194Z, 2025-08-12T12:20:26.124Z | 10 |
| executions.list.workflowId | string | KKSqAvsx6IO89YIJ, qKxJKh18Yqtn9kmg | 10 |
| executions.detail | object | 12 | 3 |
| executions.detail.id | string | 110417, 110416 | 3 |
| executions.detail.finished | boolean | true | 3 |
| executions.detail.mode | string | trigger | 3 |
| executions.detail.status | string | success | 3 |
| executions.detail.createdAt | string | 2025-08-12T12:20:28.004Z, 2025-08-12T12:20:26.003Z | 3 |
| executions.detail.startedAt | string | 2025-08-12T12:20:28.026Z, 2025-08-12T12:20:26.025Z | 3 |
| executions.detail.stoppedAt | string | 2025-08-12T12:20:28.194Z, 2025-08-12T12:20:26.124Z | 3 |
| executions.detail.workflowId | string | KKSqAvsx6IO89YIJ, qKxJKh18Yqtn9kmg | 3 |

### tags

| Path | Type | Examples | Occurrences |
|------|------|----------|-------------|
| tags | object | 4 | 16 |
| tags.createdAt | string | 2025-05-08T14:16:30.112Z, 2025-05-08T22:21:18.131Z | 16 |
| tags.updatedAt | string | 2025-05-08T14:16:30.112Z, 2025-05-08T22:21:18.131Z | 16 |
| tags.id | string | 2mUfTXhBtOXZNftN, jubCCEoeIKClOxYP | 16 |
| tags.name | string | embedding, GommeGo | 16 |

### users

| Path | Type | Examples | Occurrences |
|------|------|----------|-------------|
| users | object | 7 | 1 |
| users.id | string | d2011ea3-1757-483b-807c-1a1cadfe7618 | 1 |
| users.email | string | tiziano.annicchiarico@tecsolutions.org | 1 |
| users.firstName | string | Tiziano | 1 |
| users.lastName | string | Annicchiarico | 1 |
| users.createdAt | string | 2025-05-08T14:10:38.611Z | 1 |
| users.updatedAt | string | 2025-08-11T22:01:00.000Z | 1 |
| users.isPending | boolean | false | 1 |

