1# N8N API Complete Field Analysis

Generated: 2025-08-12T12:10:10.140Z

## Table of Contents

1. [Workflow Endpoints](#workflow-endpoints)
2. [Execution Endpoints](#execution-endpoints)
3. [Credential Endpoints](#credential-endpoints)
4. [Node Endpoints](#node-endpoints)
5. [Tag Endpoints](#tag-endpoints)
6. [System Endpoints](#system-endpoints)

---

## Workflow Endpoints

### GET /workflows

**Status:** 200

**Response Structure:**
```json
{
  "type": "object",
  "properties": {
    "data": {
      "type": "array",
      "length": 2,
      "items": {
        "type": "object",
        "properties": {
          "createdAt": {
            "type": "string",
            "value": "2025-06-20T13:50:12.556Z"
          },
          "updatedAt": {
            "type": "string",
            "value": "2025-06-28T14:35:35.000Z"
          },
          "id": {
            "type": "string",
            "value": "053vrF50XdC1ciOA"
          },
          "name": {
            "type": "string",
            "value": "RETURN VALIDATION & INTAKE"
          },
          "active": {
            "type": "boolean",
            "value": true
          },
          "isArchived": {
            "type": "boolean",
            "value": false
          },
          "nodes": {
            "type": "array",
            "length": 32,
            "items": {
              "type": "object",
              "description": "nested object (depth limit)"
            }
          },
          "connections": {
            "type": "object",
            "properties": {
              "Genera RMA": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "Prepara Email": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "On form submission": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "Prepara Dati": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "Genera RMA1": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "Convert to File1": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "Estrai Testo": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "Validazione File": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "Mappa Dati": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "Formatta Dati": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "Merge": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "Google Gemini Chat Model": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "Call n8n Workflow Tool": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "Supabase": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "Carica immagini Merce": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "If": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "Mappa nome File": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "MAPPA NUMERO ORDINE": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "INSERT CAMPI RMA": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "Execute Workflow": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "Merge1": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "numero ordine esiste?": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "If1": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "Validazione ed RMA": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          },
          "settings": {
            "type": "object",
            "properties": {
              "executionOrder": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          },
          "staticData": {
            "type": "null"
          },
          "meta": {
            "type": "object",
            "properties": {
              "templateCredsSetupCompleted": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          },
          "pinData": {
            "type": "object",
            "properties": {
              "Form1": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          },
          "versionId": {
            "type": "string",
            "value": "f696720d-965e-4727-823e-a38652a9db49"
          },
          "triggerCount": {
            "type": "number",
            "value": 1
          },
          "tags": {
            "type": "array",
            "value": []
          }
        }
      }
    },
    "nextCursor": {
      "type": "string",
      "value": "eyJsaW1pdCI6Miwib2Zmc2V0IjoyfQ=="
    }
  }
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| data | array | Execution data |
| nextCursor | string | N/A |

---

### GET /workflows/{id}

**Status:** 200

**Response Structure:**
```json
{
  "type": "object",
  "properties": {
    "createdAt": {
      "type": "string",
      "value": "2025-06-20T13:50:12.556Z"
    },
    "updatedAt": {
      "type": "string",
      "value": "2025-06-28T14:35:35.000Z"
    },
    "id": {
      "type": "string",
      "value": "053vrF50XdC1ciOA"
    },
    "name": {
      "type": "string",
      "value": "RETURN VALIDATION & INTAKE"
    },
    "active": {
      "type": "boolean",
      "value": true
    },
    "isArchived": {
      "type": "boolean",
      "value": false
    },
    "nodes": {
      "type": "array",
      "length": 32,
      "items": {
        "type": "object",
        "properties": {
          "parameters": {
            "type": "object",
            "properties": {
              "jsCode": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          },
          "id": {
            "type": "string",
            "value": "38eac349-913b-4304-91f6-77e2762aa33e"
          },
          "name": {
            "type": "string",
            "value": "Prepara Dati"
          },
          "type": {
            "type": "string",
            "value": "n8n-nodes-base.code"
          },
          "typeVersion": {
            "type": "number",
            "value": 1
          },
          "position": {
            "type": "array",
            "length": 2,
            "items": {
              "type": "object",
              "description": "nested object (depth limit)"
            }
          }
        }
      }
    },
    "connections": {
      "type": "object",
      "properties": {
        "Genera RMA": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "Prepara Email": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "On form submission": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "Prepara Dati": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "Genera RMA1": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "Convert to File1": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "Estrai Testo": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "Validazione File": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "Mappa Dati": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "Formatta Dati": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "Merge": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "Google Gemini Chat Model": {
          "type": "object",
          "properties": {
            "ai_languageModel": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "Call n8n Workflow Tool": {
          "type": "object",
          "properties": {
            "ai_tool": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "Supabase": {
          "type": "object",
          "properties": {
            "ai_tool": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "Carica immagini Merce": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "If": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 2,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "Mappa nome File": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "MAPPA NUMERO ORDINE": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "INSERT CAMPI RMA": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "Execute Workflow": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "Merge1": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "numero ordine esiste?": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 2,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "If1": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 2,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        },
        "Validazione ed RMA": {
          "type": "object",
          "properties": {
            "main": {
              "type": "array",
              "length": 1,
              "items": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        }
      }
    },
    "settings": {
      "type": "object",
      "properties": {
        "executionOrder": {
          "type": "string",
          "value": "v1"
        }
      }
    },
    "staticData": {
      "type": "null"
    },
    "meta": {
      "type": "object",
      "properties": {
        "templateCredsSetupCompleted": {
          "type": "boolean",
          "value": true
        }
      }
    },
    "pinData": {
      "type": "object",
      "properties": {
        "Form1": {
          "type": "array",
          "length": 1,
          "items": {
            "type": "object",
            "properties": {
              "json": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        }
      }
    },
    "versionId": {
      "type": "string",
      "value": "f696720d-965e-4727-823e-a38652a9db49"
    },
    "triggerCount": {
      "type": "number",
      "value": 1
    },
    "shared": {
      "type": "array",
      "length": 1,
      "items": {
        "type": "object",
        "properties": {
          "createdAt": {
            "type": "string",
            "value": "2025-06-20T13:50:12.562Z"
          },
          "updatedAt": {
            "type": "string",
            "value": "2025-06-20T13:50:12.562Z"
          },
          "role": {
            "type": "string",
            "value": "workflow:owner"
          },
          "workflowId": {
            "type": "string",
            "value": "053vrF50XdC1ciOA"
          },
          "projectId": {
            "type": "string",
            "value": "faRAVziI0wwHAtrH"
          },
          "project": {
            "type": "object",
            "properties": {
              "createdAt": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "updatedAt": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "id": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "name": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "type": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "icon": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "description": {
                "type": "object",
                "description": "nested object (depth limit)"
              },
              "projectRelations": {
                "type": "object",
                "description": "nested object (depth limit)"
              }
            }
          }
        }
      }
    },
    "tags": {
      "type": "array",
      "value": []
    }
  }
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| createdAt | string | Creation timestamp |
| updatedAt | string | Last update timestamp |
| id | string | Unique identifier |
| name | string | Name of the resource |
| active | boolean | Whether resource is active |
| isArchived | boolean | Whether workflow is archived |
| nodes | array | Array of workflow nodes |
| connections | object | Node connections mapping |
| settings | object | Workflow settings |
| staticData | null | Static data storage |
| meta | object | Metadata object |
| pinData | object | Pinned data for testing |
| versionId | string | Version identifier |
| triggerCount | number | Number of triggers |
| shared | array | Sharing information |
| tags | array | Associated tags |

---

### POST /workflows/{id}/execute

**Status:** Not tested (to avoid side effects)

**Description:** Executes a workflow

**Expected Parameters:**
```json
{
  "body": {
    "data": "object - Input data for workflow"
  }
}
```

---

### POST /workflows/{id}/activate

**Status:** Not tested (to avoid side effects)

**Description:** Activates a workflow

**Expected Response:**
```json
{
  "success": true
}
```

---

### POST /workflows/{id}/deactivate

**Status:** Not tested (to avoid side effects)

**Description:** Deactivates a workflow

**Expected Response:**
```json
{
  "success": true
}
```

---

## Execution Endpoints

### GET /executions

**Status:** 200

**Response Structure:**
```json
{
  "type": "object",
  "properties": {
    "data": {
      "type": "array",
      "length": 2,
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "value": "110412"
          },
          "finished": {
            "type": "boolean",
            "value": true
          },
          "mode": {
            "type": "string",
            "value": "trigger"
          },
          "retryOf": {
            "type": "null"
          },
          "retrySuccessId": {
            "type": "null"
          },
          "startedAt": {
            "type": "string",
            "value": "2025-08-12T12:05:28.028Z"
          },
          "stoppedAt": {
            "type": "string",
            "value": "2025-08-12T12:05:28.162Z"
          },
          "workflowId": {
            "type": "string",
            "value": "KKSqAvsx6IO89YIJ"
          },
          "waitTill": {
            "type": "null"
          }
        }
      }
    },
    "nextCursor": {
      "type": "string",
      "value": "eyJsYXN0SWQiOiIxMTA0MTEiLCJsaW1pdCI6Mn0="
    }
  }
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| data | array | Execution data |
| nextCursor | string | N/A |

---

### GET /executions/{id}

**Status:** 200

**Response Structure:**
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "value": "110412"
    },
    "finished": {
      "type": "boolean",
      "value": true
    },
    "mode": {
      "type": "string",
      "value": "trigger"
    },
    "retryOf": {
      "type": "null"
    },
    "retrySuccessId": {
      "type": "null"
    },
    "status": {
      "type": "string",
      "value": "success"
    },
    "createdAt": {
      "type": "string",
      "value": "2025-08-12T12:05:28.004Z"
    },
    "startedAt": {
      "type": "string",
      "value": "2025-08-12T12:05:28.028Z"
    },
    "stoppedAt": {
      "type": "string",
      "value": "2025-08-12T12:05:28.162Z"
    },
    "deletedAt": {
      "type": "null"
    },
    "workflowId": {
      "type": "string",
      "value": "KKSqAvsx6IO89YIJ"
    },
    "waitTill": {
      "type": "null"
    }
  }
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| finished | boolean | Whether execution finished |
| mode | string | Execution mode |
| retryOf | null | ID of execution being retried |
| retrySuccessId | null | ID of successful retry |
| status | string | Execution status |
| createdAt | string | Creation timestamp |
| startedAt | string | Execution start time |
| stoppedAt | string | Execution stop time |
| deletedAt | null | N/A |
| workflowId | string | Associated workflow ID |
| waitTill | null | Wait until timestamp |

---

### DELETE /executions/{id}

**Status:** Not tested (to avoid side effects)

**Description:** Deletes an execution

**Expected Response:**
```json
{
  "success": true
}
```

---

### GET /executions-current

**Status:** 404

**Error:** Request failed with status code 404

---

## Credential Endpoints

### GET /credentials

**Status:** 405

**Error:** Request failed with status code 405

---

### GET /credentials/schema

**Status:** 405

**Error:** Request failed with status code 405

---

## Node Endpoints

### GET /node-types

**Status:** 404

**Error:** Request failed with status code 404

---

## Tag Endpoints

### GET /tags

**Status:** 200

**Response Structure:**
```json
{
  "type": "object",
  "properties": {
    "data": {
      "type": "array",
      "length": 16,
      "items": {
        "type": "object",
        "properties": {
          "createdAt": {
            "type": "string",
            "value": "2025-05-08T14:16:30.112Z"
          },
          "updatedAt": {
            "type": "string",
            "value": "2025-05-08T14:16:30.112Z"
          },
          "id": {
            "type": "string",
            "value": "2mUfTXhBtOXZNftN"
          },
          "name": {
            "type": "string",
            "value": "embedding"
          }
        }
      }
    },
    "nextCursor": {
      "type": "null"
    }
  }
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| data | array | Execution data |
| nextCursor | null | N/A |

---

## System Endpoints

### GET /version

**Status:** 404

**Error:** Request failed with status code 404

---

### GET /health

**Status:** 404

**Error:** Request failed with status code 404

---

### GET /metrics

**Status:** 404

**Error:** Request failed with status code 404

---

