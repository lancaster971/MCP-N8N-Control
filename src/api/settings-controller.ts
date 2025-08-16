/**
 * Settings API Controller
 * 
 * Gestisce la configurazione del sistema per deployment frontend remoto
 * Endpoints per connection settings, API keys, e connectivity testing
 */

import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { getSettingsManager } from '../config/settings-manager.js';
import { getApiKeyManager, ApiKeyConfig } from '../auth/api-key-manager.js';
import { JwtPayload } from '../auth/jwt-auth.js';

// Extend Express Request to include user
interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

const router = express.Router();
const settingsManager = getSettingsManager();
const apiKeyManager = getApiKeyManager();

// Rate limiter per generazione API keys
const apiKeyGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 5, // max 5 API keys per ora per IP
  message: {
    error: 'Rate limit exceeded',
    message: 'Massimo 5 API keys generabili per ora. Riprova più tardi.'
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     ConnectionConfig:
 *       type: object
 *       properties:
 *         backendUrl:
 *           type: string
 *           description: URL del backend
 *         connectionTimeout:
 *           type: number
 *           description: Timeout connessione in ms
 *         retryAttempts:
 *           type: number
 *           description: Numero tentativi di retry
 *         features:
 *           type: object
 *           description: Feature flags
 *     ApiKeyInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         keyName:
 *           type: string
 *         keyPrefix:
 *           type: string
 *         keyType:
 *           type: string
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 */

/**
 * @swagger
 * /api/settings/connection:
 *   get:
 *     summary: Ottieni configurazione connessione frontend
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configurazione connessione
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConnectionConfig'
 */
router.get('/connection', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const config = await settingsManager.getFrontendConfig();
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Errore recupero configurazione connessione:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Errore recupero configurazione connessione'
    });
  }
});

/**
 * @swagger
 * /api/settings/connection:
 *   post:
 *     summary: Aggiorna configurazione connessione frontend
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConnectionConfig'
 *     responses:
 *       200:
 *         description: Configurazione aggiornata con successo
 */
router.post('/connection', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as JwtPayload;
    const userId = (user as any).id;
    const { backendUrl, connectionTimeout, retryAttempts, features } = req.body;

    // Validazione input
    if (backendUrl && typeof backendUrl !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'backendUrl deve essere una stringa'
      });
    }

    if (connectionTimeout && (!Number.isInteger(connectionTimeout) || connectionTimeout < 1000)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'connectionTimeout deve essere un numero >= 1000'
      });
    }

    if (retryAttempts && (!Number.isInteger(retryAttempts) || retryAttempts < 0)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'retryAttempts deve essere un numero >= 0'
      });
    }

    // Test connettività se URL fornito
    let connectivityResult;
    if (backendUrl) {
      connectivityResult = await settingsManager.testBackendConnectivity(
        backendUrl, 
        connectionTimeout || 5000
      );
      
      if (!connectivityResult.success) {
        return res.status(400).json({
          error: 'Connection Failed',
          message: `Impossibile connettersi a ${backendUrl}: ${connectivityResult.error}`,
          details: connectivityResult
        });
      }
    }

    // Aggiorna configurazione
    const success = await settingsManager.updateFrontendConfig({
      backendUrl,
      connectionTimeout,
      retryAttempts,
      features
    }, userId);

    if (success) {
      const updatedConfig = await settingsManager.getFrontendConfig();
      res.json({
        success: true,
        message: 'Configurazione connessione aggiornata',
        data: updatedConfig,
        connectivity: connectivityResult
      });
    } else {
      res.status(500).json({
        error: 'Update Failed',
        message: 'Errore aggiornamento configurazione'
      });
    }
  } catch (error) {
    console.error('Errore aggiornamento configurazione:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Errore aggiornamento configurazione connessione'
    });
  }
});

/**
 * @swagger
 * /api/settings/connection/test:
 *   post:
 *     summary: Testa connettività a backend URL
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: URL da testare
 *               timeout:
 *                 type: number
 *                 description: Timeout in ms
 */
router.post('/connection/test', async (req: Request, res: Response) => {
  try {
    const { url, timeout = 5000 } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'URL richiesto'
      });
    }

    const result = await settingsManager.testBackendConnectivity(url, timeout);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Errore test connettività:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Errore durante test connettività'
    });
  }
});

/**
 * @swagger
 * /api/settings/apikeys:
 *   get:
 *     summary: Lista API keys dell'utente
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista API keys
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ApiKeyInfo'
 */
router.get('/apikeys', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as JwtPayload;
    const userId = (user as any).id;
    const includeInactive = req.query.includeInactive === 'true';
    
    const apiKeys = await apiKeyManager.listApiKeys(userId, includeInactive);
    
    // Non esporre le chiavi complete, solo prefissi
    const safeApiKeys = apiKeys.map(key => ({
      id: key.id,
      keyName: key.keyName,
      keyPrefix: key.keyPrefix,
      keyType: key.keyType,
      permissions: key.permissions,
      scopes: key.scopes,
      tenantId: key.tenantId,
      expiresAt: key.expiresAt,
      lastUsedAt: key.lastUsedAt,
      usageCount: key.usageCount,
      isActive: key.isActive,
      createdAt: key.createdAt
    }));

    res.json({
      success: true,
      data: safeApiKeys
    });
  } catch (error) {
    console.error('Errore recupero API keys:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Errore recupero API keys'
    });
  }
});

/**
 * @swagger
 * /api/settings/apikeys:
 *   post:
 *     summary: Genera nuova API key
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome della API key
 *               type:
 *                 type: string
 *                 enum: [frontend-read, frontend-full, frontend-limited, backend-service, admin-full]
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               scopes:
 *                 type: array
 *                 items:
 *                   type: string
 *               expiresInSeconds:
 *                 type: number
 *                 description: TTL in secondi
 */
router.post('/apikeys', apiKeyGenerationLimiter, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as JwtPayload;
    const userId = (user as any).id;
    const { name, type, permissions = [], scopes = ['read'], expiresInSeconds } = req.body;

    // Validazione input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Nome API key richiesto'
      });
    }

    const validTypes = ['frontend-read', 'frontend-full', 'frontend-limited', 'backend-service', 'admin-full'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Tipo API key non valido. Valori ammessi: ${validTypes.join(', ')}`
      });
    }

    // Solo admin può creare admin-full keys
    if (type === 'admin-full' && user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Solo admin può creare API keys admin-full'
      });
    }

    const config: ApiKeyConfig = {
      name: name.trim(),
      type,
      permissions: Array.isArray(permissions) ? permissions : [],
      scopes: Array.isArray(scopes) ? scopes : ['read'],
      tenantId: user.tenantId,
      expiresInSeconds
    };

    const result = await apiKeyManager.generateApiKey(config, userId);

    res.status(201).json({
      success: true,
      message: 'API key generata con successo',
      data: {
        apiKey: result.apiKey, // Esposta solo una volta alla creazione
        keyInfo: {
          id: result.keyInfo.id,
          keyName: result.keyInfo.keyName,
          keyPrefix: result.keyInfo.keyPrefix,
          keyType: result.keyInfo.keyType,
          permissions: result.keyInfo.permissions,
          scopes: result.keyInfo.scopes,
          expiresAt: result.keyInfo.expiresAt,
          createdAt: result.keyInfo.createdAt
        }
      }
    });
  } catch (error: any) {
    console.error('Errore generazione API key:', error);
    
    if (error?.message?.includes('Rate limit')) {
      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Errore generazione API key'
    });
  }
});

/**
 * @swagger
 * /api/settings/apikeys/{keyId}:
 *   delete:
 *     summary: Revoca API key
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/apikeys/:keyId', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as JwtPayload;
    const userId = (user as any).id;
    const { keyId } = req.params;

    if (!keyId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'ID API key richiesto'
      });
    }

    const success = await apiKeyManager.revokeApiKey(keyId, userId);

    if (success) {
      res.json({
        success: true,
        message: 'API key revocata con successo'
      });
    } else {
      res.status(404).json({
        error: 'Not Found',
        message: 'API key non trovata o già revocata'
      });
    }
  } catch (error) {
    console.error('Errore revoca API key:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Errore revoca API key'
    });
  }
});

/**
 * @swagger
 * /api/settings/apikeys/{keyId}/renew:
 *   put:
 *     summary: Rinnova scadenza API key
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - expiresInSeconds
 *             properties:
 *               expiresInSeconds:
 *                 type: number
 *                 description: Nuova durata in secondi
 */
router.put('/apikeys/:keyId/renew', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as JwtPayload;
    const userId = (user as any).id;
    const { keyId } = req.params;
    const { expiresInSeconds } = req.body;

    if (!keyId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'ID API key richiesto'
      });
    }

    if (!expiresInSeconds || !Number.isInteger(expiresInSeconds) || expiresInSeconds < 3600) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'expiresInSeconds deve essere un numero >= 3600 (1 ora)'
      });
    }

    const success = await apiKeyManager.renewApiKey(keyId, expiresInSeconds, userId);

    if (success) {
      res.json({
        success: true,
        message: 'API key rinnovata con successo'
      });
    } else {
      res.status(404).json({
        error: 'Not Found',
        message: 'API key non trovata o non attiva'
      });
    }
  } catch (error) {
    console.error('Errore rinnovo API key:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Errore rinnovo API key'
    });
  }
});

/**
 * @swagger
 * /api/settings/client/apikey:
 *   put:
 *     summary: Aggiorna API key per cliente (hot-swap sicuro)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newApiKey
 *               - adminPassword
 *             properties:
 *               newApiKey:
 *                 type: string
 *                 description: Nuova API key da utilizzare
 *               adminPassword:
 *                 type: string
 *                 description: Password SuperAdmin per autorizzazione
 */
router.put('/client/apikey', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { newApiKey, adminPassword } = req.body;

    // Validazione input
    if (!newApiKey || typeof newApiKey !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Nuova API key richiesta'
      });
    }

    if (!adminPassword || typeof adminPassword !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Password admin richiesta per autorizzazione'
      });
    }

    // Validazione password SuperAdmin (hardcoded per sicurezza)
    const validPasswords = ['admin123', 'superadmin2025', 'pilotpro-secure'];
    if (!validPasswords.includes(adminPassword)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Password admin non valida'
      });
    }

    // Validazione formato API key
    const apiKeyPattern = /^[a-z]{2,3}_[a-f0-9]{32,128}$/;
    if (!apiKeyPattern.test(newApiKey)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Formato API key non valido (esempio: fr_abc123...)'
      });
    }

    // Verifica che la nuova API key esista nel database
    const keyValidation = await apiKeyManager.validateApiKey(newApiKey);
    if (!keyValidation.isValid) {
      return res.status(400).json({
        error: 'Invalid API Key',
        message: `API key non valida: ${keyValidation.reason}`
      });
    }

    // Log sicurezza per audit trail
    console.log(`🔐 API Key Update Request:`, {
      timestamp: new Date().toISOString(),
      oldKeyPrefix: req.headers['x-api-key'] ? (req.headers['x-api-key'] as string).substring(0, 10) + '***' : 'None',
      newKeyPrefix: newApiKey.substring(0, 10) + '***',
      clientIP: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'API Key validata e pronta per l\'aggiornamento',
      data: {
        keyInfo: {
          type: keyValidation.keyInfo?.keyType,
          scopes: keyValidation.keyInfo?.scopes,
          expiresAt: keyValidation.keyInfo?.expiresAt
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Errore update API key cliente:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Errore aggiornamento API key'
    });
  }
});

export default router;