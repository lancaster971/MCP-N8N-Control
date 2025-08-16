/**
 * System Controller - Gestione servizi PilotPro dall'interfaccia web
 * 
 * Integra i comandi UPServer nel backend per controllo remoto
 * dei servizi sistema via API REST
 */

import express, { Request, Response } from 'express';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import { JwtPayload } from '../auth/jwt-auth.js';

const execAsync = promisify(exec);
const router = express.Router();

// PID files come definiti in UPServer
const BACKEND_PID_FILE = '/tmp/pilotpro_backend.pid';
const FRONTEND_PID_FILE = '/tmp/pilotpro_frontend.pid';
const SCHEDULER_STATUS_FILE = '/tmp/pilotpro_scheduler_status';

interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'unknown';
  pid?: number;
  port?: number;
  message?: string;
}

interface SystemStatus {
  overall: 'healthy' | 'degraded' | 'down';
  services: ServiceStatus[];
  lastCheck: string;
}

/**
 * Verifica se un processo è in esecuzione
 */
async function checkProcess(pid: number): Promise<boolean> {
  try {
    process.kill(pid, 0); // Signal 0 per test senza uccidere
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifica se una porta è in uso
 */
async function checkPort(port: number): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`lsof -Pi :${port} -sTCP:LISTEN -t`);
    return stdout.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Legge PID da file se esiste
 */
async function readPidFile(pidFile: string): Promise<number | null> {
  try {
    const content = await fs.readFile(pidFile, 'utf8');
    const pid = parseInt(content.trim());
    return isNaN(pid) ? null : pid;
  } catch {
    return null;
  }
}

/**
 * Ottieni status di un servizio specifico
 */
async function getServiceStatus(serviceName: string): Promise<ServiceStatus> {
  const service: ServiceStatus = {
    name: serviceName,
    status: 'unknown'
  };

  switch (serviceName) {
    case 'backend':
      service.port = 3001;
      const backendPid = await readPidFile(BACKEND_PID_FILE);
      
      if (backendPid && await checkProcess(backendPid)) {
        service.status = 'running';
        service.pid = backendPid;
        service.message = `API server active on port ${service.port}`;
      } else if (await checkPort(service.port)) {
        service.status = 'unknown';
        service.message = `Port ${service.port} occupied by unknown process`;
      } else {
        service.status = 'stopped';
        service.message = 'API server not running';
      }
      break;

    case 'frontend':
      service.port = 5173;
      const frontendPid = await readPidFile(FRONTEND_PID_FILE);
      
      if (frontendPid && await checkProcess(frontendPid)) {
        service.status = 'running';
        service.pid = frontendPid;
        service.message = `React server active on port ${service.port}`;
      } else if (await checkPort(service.port)) {
        service.status = 'unknown';
        service.message = `Port ${service.port} occupied by unknown process`;
      } else {
        service.status = 'stopped';
        service.message = 'React server not running';
      }
      break;

    case 'database':
      try {
        await execAsync('/opt/homebrew/opt/postgresql@16/bin/psql -h localhost -U tizianoannicchiarico -d n8n_mcp -c "SELECT 1;"');
        service.status = 'running';
        service.message = 'PostgreSQL connected';
      } catch {
        service.status = 'stopped';
        service.message = 'PostgreSQL not accessible';
      }
      break;

    case 'scheduler':
      try {
        const statusContent = await fs.readFile(SCHEDULER_STATUS_FILE, 'utf8');
        if (statusContent.trim() === 'true') {
          service.status = 'running';
          service.message = 'Auto-sync active (every 5min)';
        } else {
          service.status = 'stopped';
          service.message = 'Scheduler inactive';
        }
      } catch {
        service.status = 'unknown';
        service.message = 'Status unknown';
      }
      break;
  }

  return service;
}

/**
 * @swagger
 * /api/system/status:
 *   get:
 *     summary: Ottieni stato completo del sistema
 *     tags: [System Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stato sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     overall:
 *                       type: string
 *                       enum: [healthy, degraded, down]
 *                     services:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           status:
 *                             type: string
 *                           pid:
 *                             type: number
 *                           port:
 *                             type: number
 *                           message:
 *                             type: string
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const services = await Promise.all([
      getServiceStatus('database'),
      getServiceStatus('backend'),
      getServiceStatus('frontend'),
      getServiceStatus('scheduler')
    ]);

    // Determina stato generale
    const runningServices = services.filter(s => s.status === 'running').length;
    let overall: 'healthy' | 'degraded' | 'down';
    
    if (runningServices === services.length) {
      overall = 'healthy';
    } else if (runningServices > 0) {
      overall = 'degraded';
    } else {
      overall = 'down';
    }

    const systemStatus: SystemStatus = {
      overall,
      services,
      lastCheck: new Date().toISOString()
    };

    res.json({
      success: true,
      data: systemStatus
    });
  } catch (error: any) {
    console.error('Errore verifica stato sistema:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Errore verifica stato sistema'
    });
  }
});

/**
 * @swagger
 * /api/system/services/{service}/start:
 *   post:
 *     summary: Avvia servizio specifico
 *     tags: [System Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: service
 *         required: true
 *         schema:
 *           type: string
 *           enum: [backend, frontend, all]
 */
router.post('/services/:service/start', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as JwtPayload;
    const userId = (user as any).id;
    const { service } = req.params;

    // Solo admin può gestire servizi
    if (user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Solo admin può gestire i servizi sistema'
      });
    }

    const validServices = ['backend', 'frontend', 'all'];
    if (!validServices.includes(service)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Servizio non valido. Valori ammessi: ${validServices.join(', ')}`
      });
    }

    // Esegui comando UPServer
    const command = service === 'all' ? './UPServer' : `./UPServer ${service}`;
    
    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000,
      cwd: process.cwd()
    });

    res.json({
      success: true,
      message: `Servizio ${service} avviato con successo`,
      data: {
        command,
        output: stdout,
        errors: stderr || null
      }
    });
  } catch (error: any) {
    console.error(`Errore avvio servizio ${req.params.service}:`, error);
    res.status(500).json({
      error: 'Service Start Failed',
      message: `Errore avvio servizio: ${error.message}`,
      details: error.stdout || error.stderr
    });
  }
});

/**
 * @swagger
 * /api/system/services/{service}/stop:
 *   post:
 *     summary: Ferma servizio specifico
 *     tags: [System Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: service
 *         required: true
 *         schema:
 *           type: string
 *           enum: [backend, frontend, all]
 */
router.post('/services/:service/stop', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as JwtPayload;
    const userId = (user as any).id;
    const { service } = req.params;

    if (user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Solo admin può gestire i servizi sistema'
      });
    }

    const validServices = ['backend', 'frontend', 'all'];
    if (!validServices.includes(service)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Servizio non valido. Valori ammessi: ${validServices.join(', ')}`
      });
    }

    // Per evitare di fermare se stesso se service=backend o all
    if (service === 'backend' || service === 'all') {
      return res.status(400).json({
        error: 'Service Protection',
        message: 'Impossibile fermare il backend da se stesso. Usa il comando diretto: ./UPServer stop'
      });
    }

    const command = `./UPServer stop`;
    const { stdout, stderr } = await execAsync(command, {
      timeout: 15000,
      cwd: process.cwd()
    });

    res.json({
      success: true,
      message: `Servizio ${service} fermato con successo`,
      data: {
        command,
        output: stdout,
        errors: stderr || null
      }
    });
  } catch (error: any) {
    console.error(`Errore stop servizio ${req.params.service}:`, error);
    res.status(500).json({
      error: 'Service Stop Failed',
      message: `Errore stop servizio: ${error.message}`
    });
  }
});

/**
 * @swagger
 * /api/system/services/restart:
 *   post:
 *     summary: Riavvia sistema completo
 *     tags: [System Management]
 *     security:
 *       - bearerAuth: []
 */
router.post('/services/restart', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as JwtPayload;
    const userId = (user as any).id;

    if (user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Solo admin può riavviare il sistema'
      });
    }

    // Restart asincrono per evitare di interrompere la risposta
    setTimeout(async () => {
      try {
        await execAsync('./UPServer restart', {
          timeout: 60000,
          cwd: process.cwd()
        });
      } catch (error) {
        console.error('Errore restart sistema:', error);
      }
    }, 2000); // Delay per permettere alla risposta di arrivare

    res.json({
      success: true,
      message: 'Sistema in fase di riavvio...',
      data: {
        estimatedTime: '45-60 secondi',
        note: 'Il sistema si riavvierà automaticamente. Ricarica la pagina tra 1 minuto.'
      }
    });
  } catch (error: any) {
    console.error('Errore riavvio sistema:', error);
    res.status(500).json({
      error: 'System Restart Failed',
      message: `Errore riavvio sistema: ${error.message}`
    });
  }
});

/**
 * @swagger
 * /api/system/health:
 *   get:
 *     summary: Esegue health check completo come UPServer
 *     tags: [System Management]
 *     security:
 *       - bearerAuth: []
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Esegui UPServer status
    const { stdout, stderr } = await execAsync('./UPServer status', {
      timeout: 15000,
      cwd: process.cwd()
    });

    // Parse output per informazioni strutturate
    const services = await Promise.all([
      getServiceStatus('database'),
      getServiceStatus('backend'),
      getServiceStatus('frontend'),
      getServiceStatus('scheduler')
    ]);

    res.json({
      success: true,
      data: {
        services,
        rawOutput: stdout,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Errore health check sistema:', error);
    res.status(500).json({
      error: 'Health Check Failed',
      message: `Errore health check: ${error.message}`,
      details: error.stderr
    });
  }
});

/**
 * @swagger
 * /api/system/logs:
 *   get:
 *     summary: Ottieni log dei servizi
 *     tags: [System Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: service
 *         schema:
 *           type: string
 *           enum: [backend, frontend]
 *       - in: query
 *         name: lines
 *         schema:
 *           type: number
 *           default: 50
 */
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const { service = 'backend', lines = '50' } = req.query;
    
    const logFiles: Record<string, string> = {
      backend: '/tmp/pilotpro_backend.log',
      frontend: '/tmp/pilotpro_frontend.log'
    };

    const logFile = logFiles[service as string];
    if (!logFile) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Servizio non valido per log. Valori ammessi: backend, frontend'
      });
    }

    try {
      const { stdout } = await execAsync(`tail -n ${lines} ${logFile}`);
      res.json({
        success: true,
        data: {
          service,
          lines: parseInt(lines as string),
          logs: stdout,
          timestamp: new Date().toISOString()
        }
      });
    } catch {
      res.json({
        success: true,
        data: {
          service,
          lines: 0,
          logs: 'Log file non trovato o vuoto',
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error: any) {
    console.error('Errore lettura log:', error);
    res.status(500).json({
      error: 'Log Read Failed',
      message: 'Errore lettura log servizi'
    });
  }
});

/**
 * @swagger
 * /api/system/pids:
 *   get:
 *     summary: Ottieni PID di tutti i processi gestiti
 *     tags: [System Management]
 *     security:
 *       - bearerAuth: []
 */
router.get('/pids', async (req: Request, res: Response) => {
  try {
    const pids = {
      backend: await readPidFile(BACKEND_PID_FILE),
      frontend: await readPidFile(FRONTEND_PID_FILE)
    };

    // Verifica che i PID siano ancora attivi
    const processStatus = {
      backend: pids.backend ? await checkProcess(pids.backend) : false,
      frontend: pids.frontend ? await checkProcess(pids.frontend) : false
    };

    res.json({
      success: true,
      data: {
        pids,
        processStatus,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Errore lettura PID:', error);
    res.status(500).json({
      error: 'PID Read Failed',
      message: 'Errore lettura PID processi'
    });
  }
});

export default router;