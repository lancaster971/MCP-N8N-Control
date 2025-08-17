# Database SSL/TLS Setup Guide

Guida per configurare SSL/TLS su PostgreSQL per connessioni sicure.

---

## 🔐 **PostgreSQL SSL Configuration**

### **1. Genera Certificati SSL**

```bash
# Crea directory per certificati
mkdir -p /opt/homebrew/var/postgresql@16/ssl
cd /opt/homebrew/var/postgresql@16/ssl

# Genera private key
openssl genpkey -algorithm RSA -pkcs8 -out server.key -pass pass:pilotpro2025

# Rimuovi passphrase per PostgreSQL
openssl rsa -in server.key -out server.key

# Genera certificato self-signed
openssl req -new -x509 -key server.key -out server.crt -days 365 \
  -subj "/C=IT/ST=IT/L=Roma/O=PilotPro/OU=Database/CN=localhost"

# Imposta permessi corretti
chmod 600 server.key
chmod 644 server.crt
chown postgres:postgres server.key server.crt
```

### **2. Configura PostgreSQL per SSL**

Modifica il file `postgresql.conf`:

```conf
# File: /opt/homebrew/var/postgresql@16/postgresql.conf

# SSL Configuration
ssl = on
ssl_cert_file = 'ssl/server.crt'
ssl_key_file = 'ssl/server.key'
ssl_ca_file = ''
ssl_crl_file = ''
ssl_cipher_list = 'HIGH:MEDIUM:+3DES:!aNULL'
ssl_prefer_server_ciphers = on
ssl_ecdh_curve = 'prime256v1'
ssl_min_protocol_version = 'TLSv1.2'
ssl_max_protocol_version = 'TLSv1.3'

# Connection security
password_encryption = scram-sha-256
```

### **3. Configura pg_hba.conf per SSL**

```conf
# File: /opt/homebrew/var/postgresql@16/pg_hba.conf

# SSL Required connections
hostssl  n8n_mcp    tizianoannicchiarico  127.0.0.1/32     scram-sha-256
hostssl  n8n_mcp    tizianoannicchiarico  ::1/128          scram-sha-256

# Local connections (no SSL required)
local    all        all                                     peer
host     all        all          127.0.0.1/32              scram-sha-256
host     all        all          ::1/128                   scram-sha-256
```

### **4. Riavvia PostgreSQL**

```bash
# Riavvia PostgreSQL per applicare configurazioni
brew services restart postgresql@16

# Verifica SSL attivo
/opt/homebrew/opt/postgresql@16/bin/psql -h localhost -U tizianoannicchiarico -d n8n_mcp -c "SELECT ssl_is_used();"
```

---

## ⚙️ **Application Configuration**

### **Update Environment Variables**

Aggiorna il file `.env` o variabili environment:

```env
# Database SSL Configuration
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
DB_SSL_CA_PATH=/opt/homebrew/var/postgresql@16/ssl/server.crt
DB_SSL_CERT_PATH=
DB_SSL_KEY_PATH=
```

### **Update Database Connection Code**

Modifica il file di connessione database:

```typescript
// src/database/connection.ts

const sslConfig = config.dbSsl ? {
  ssl: {
    rejectUnauthorized: false, // Per certificati self-signed
    ca: process.env.DB_SSL_CA_PATH ? 
        fs.readFileSync(process.env.DB_SSL_CA_PATH) : undefined,
    cert: process.env.DB_SSL_CERT_PATH ? 
          fs.readFileSync(process.env.DB_SSL_CERT_PATH) : undefined,
    key: process.env.DB_SSL_KEY_PATH ? 
         fs.readFileSync(process.env.DB_SSL_KEY_PATH) : undefined
  }
} : {};

const poolConfig = {
  host: config.dbHost,
  port: config.dbPort,
  database: config.dbName,
  user: config.dbUser,
  password: config.dbPassword,
  ...sslConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
};
```

---

## 🧪 **Testing SSL Connection**

### **1. Test da Command Line**

```bash
# Test connessione SSL
/opt/homebrew/opt/postgresql@16/bin/psql "sslmode=require host=localhost dbname=n8n_mcp user=tizianoannicchiarico"

# Verifica SSL attivo
/opt/homebrew/opt/postgresql@16/bin/psql -h localhost -U tizianoannicchiarico -d n8n_mcp -c "
SELECT 
  ssl_is_used() as ssl_active,
  ssl_version() as ssl_version,
  ssl_cipher() as ssl_cipher;
"
```

### **2. Test da Applicazione**

```bash
# Update environment per test
export DB_SSL=true

# Avvia backend con SSL
WEBHOOK_SECRET=pilotpro-webhook-2025-secure \
DB_USER=tizianoannicchiarico \
DB_SSL=true \
node build/server/express-server.js
```

### **3. Verifica Logs**

```bash
# Check PostgreSQL logs per SSL
tail -f /opt/homebrew/var/postgresql@16/log/postgresql-*.log | grep -i ssl

# Check application logs
tail -f /tmp/pilotpro_backend.log | grep -i ssl
```

---

## 🔧 **PgAdmin SSL Configuration**

### **Setup PgAdmin con SSL**

1. **Connection Tab:**
   - Host: `localhost`
   - Port: `5432`
   - Database: `n8n_mcp`
   - Username: `tizianoannicchiarico`

2. **SSL Tab:**
   - SSL Mode: `Require`
   - Client Certificate: `/opt/homebrew/var/postgresql@16/ssl/server.crt`
   - Client Certificate Key: (leave empty for server cert)
   - Root Certificate: `/opt/homebrew/var/postgresql@16/ssl/server.crt`

### **SSH + SSL Combined**

Per massima sicurezza, combina SSH tunnel + SSL:

```bash
# SSH tunnel con SSL endpoint
ssh -L 15432:localhost:5432 utente@flow.agentix-io.com

# PgAdmin connection:
# Host: localhost
# Port: 15432
# SSL Mode: Require
```

---

## 🛡️ **Security Best Practices**

### **Certificate Management**

1. **Production Certificates:**
   ```bash
   # Per produzione, usa certificati CA-signed
   # Let's Encrypt per domini pubblici
   # Corporate CA per ambienti interni
   ```

2. **Certificate Rotation:**
   ```bash
   # Rinnova certificati ogni 90 giorni
   # Script automatico per renewal
   */59 23 */89 * * /path/to/ssl-renewal.sh
   ```

3. **Monitoring SSL:**
   ```bash
   # Verifica scadenza certificati
   openssl x509 -in server.crt -noout -dates
   
   # Alert 30 giorni prima scadenza
   openssl x509 -in server.crt -noout -checkend 2592000
   ```

### **Network Security**

1. **Firewall Rules:**
   ```bash
   # Solo localhost per PostgreSQL
   ufw allow from 127.0.0.1 to any port 5432
   ufw deny 5432
   ```

2. **SSL-Only Mode:**
   ```conf
   # pg_hba.conf - solo SSL
   hostssl  all  all  0.0.0.0/0  scram-sha-256
   # Rimuovi tutte le righe 'host' (non SSL)
   ```

---

## 📋 **Troubleshooting**

### **Common SSL Issues**

1. **Certificate Permission Errors:**
   ```bash
   # Fix permissions
   sudo chown postgres:postgres /opt/homebrew/var/postgresql@16/ssl/*
   sudo chmod 600 /opt/homebrew/var/postgresql@16/ssl/server.key
   sudo chmod 644 /opt/homebrew/var/postgresql@16/ssl/server.crt
   ```

2. **SSL Handshake Failures:**
   ```bash
   # Check certificate validity
   openssl x509 -in server.crt -text -noout
   
   # Test SSL connection
   openssl s_client -connect localhost:5432 -starttls postgres
   ```

3. **Application SSL Errors:**
   ```bash
   # Debug SSL in application
   export DEBUG=true
   export NODE_TLS_REJECT_UNAUTHORIZED=0  # Solo per debug
   ```

### **Performance Considerations**

1. **SSL Overhead:**
   - ~5-10% CPU overhead per SSL connection
   - Use connection pooling per ridurre overhead
   - Monitor con `pg_stat_ssl`

2. **Connection Limits:**
   ```sql
   -- Monitor SSL connections
   SELECT * FROM pg_stat_ssl;
   
   -- Check connection count
   SELECT count(*) FROM pg_stat_activity WHERE ssl = true;
   ```

---

## ✅ **Verifica Finale**

```bash
# Test completo SSL setup
echo "Testing SSL database connection..."

# 1. SSL enabled check
/opt/homebrew/opt/postgresql@16/bin/psql -h localhost -U tizianoannicchiarico -d n8n_mcp -c "SELECT ssl_is_used();"

# 2. SSL version check  
/opt/homebrew/opt/postgresql@16/bin/psql -h localhost -U tizianoannicchiarico -d n8n_mcp -c "SELECT ssl_version();"

# 3. Application test
WEBHOOK_SECRET=pilotpro-webhook-2025-secure DB_USER=tizianoannicchiarico DB_SSL=true node build/server/express-server.js &
sleep 5
curl -s http://localhost:3001/health | jq '.database.ssl'
pkill -f express-server.js

echo "SSL setup verification complete!"
```

---

*Configurazione SSL completata. Il database ora supporta connessioni sicure con crittografia TLS.*