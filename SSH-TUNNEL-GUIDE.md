# SSH Tunnel Guide - Database Access Sicuro

Guida per accesso sicuro al database PostgreSQL tramite SSH tunnel standard.

---

## 🔐 **Accesso Database Sicuro**

### **Configurazione SSH Tunnel Standard**

Per accedere al database PostgreSQL in modo sicuro, utilizzare un tunnel SSH standard tramite il server Hostinger:

#### **1. SSH Tunnel da Terminal**

```bash
# Comando tunnel SSH per database PostgreSQL
ssh -L 15432:localhost:5432 utente@flow.agentix-io.com -p 22

# Spiegazione parametri:
# -L 15432:localhost:5432  = Porta locale 15432 -> PostgreSQL porta 5432
# utente@flow.agentix-io.com = Server SSH Hostinger
# -p 22 = Porta SSH standard
```

#### **2. Mantenere Tunnel Attivo**

```bash
# Comando con keep-alive per sessioni lunghe
ssh -L 15432:localhost:5432 utente@flow.agentix-io.com -p 22 -o ServerAliveInterval=60
```

#### **3. Tunnel in Background**

```bash
# Avvia tunnel in background
ssh -f -N -L 15432:localhost:5432 utente@flow.agentix-io.com -p 22

# Termina tunnel background
pkill -f "ssh.*15432:localhost:5432"
```

---

## 🗄️ **Configurazione PgAdmin**

### **Setup Connessione Database via SSH Tunnel**

1. **Avvia SSH Tunnel** (vedi sezione sopra)

2. **Configurazione PgAdmin:**
   - **General Tab:**
     - Name: `PilotPro Database (SSH)`
   
   - **Connection Tab:**
     - Host: `localhost`
     - Port: `15432` (porta tunnel locale)
     - Database: `n8n_mcp`
     - Username: `tizianoannicchiarico`
     - Password: `[password database]`

   - **SSL Tab:**
     - SSL Mode: `Prefer`

3. **Test Connessione:**
   - Clicca "Test" per verificare la connessione
   - Dovrebbe risultare "Successfully connected"

### **Configurazione PgAdmin con SSH Integrato**

PgAdmin Pro supporta SSH tunneling integrato:

1. **SSH Tunnel Tab:**
   - Use SSH Tunneling: `Yes`
   - Tunnel Host: `flow.agentix-io.com`
   - Tunnel Port: `22`
   - Username: `[utente_ssh]`
   - Authentication: `Password` o `Identity file`

2. **Connection Tab:**
   - Host: `localhost`
   - Port: `5432` (porta PostgreSQL originale)
   - Database: `n8n_mcp`
   - Username: `tizianoannicchiarico`

---

## 🛡️ **Sicurezza e Best Practices**

### **Configurazioni Raccomandate**

1. **SSH Key Authentication:**
   ```bash
   # Genera chiave SSH (se non presente)
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   
   # Copia chiave sul server
   ssh-copy-id utente@flow.agentix-io.com
   
   # Tunnel con chiave
   ssh -i ~/.ssh/id_rsa -L 15432:localhost:5432 utente@flow.agentix-io.com
   ```

2. **SSH Config per Connessioni Rapide:**
   ```bash
   # File: ~/.ssh/config
   Host pilotpro-db
       HostName flow.agentix-io.com
       User [utente_ssh]
       Port 22
       LocalForward 15432 localhost:5432
       ServerAliveInterval 60
       IdentityFile ~/.ssh/id_rsa
   
   # Utilizzo semplificato:
   ssh pilotpro-db
   ```

3. **Firewall e Porte:**
   - Porto SSH 22: Aperto solo per IP autorizzati
   - Porto PostgreSQL 5432: Accessibile solo via localhost
   - Porto tunnel 15432: Solo locale

### **Troubleshooting Comuni**

1. **Errore "Port already in use":**
   ```bash
   # Trova processo che usa la porta
   lsof -i :15432
   
   # Termina tunnel esistente
   pkill -f "ssh.*15432"
   ```

2. **Timeout connessione:**
   ```bash
   # Verifica connettività SSH
   ssh -v utente@flow.agentix-io.com
   
   # Test con keep-alive
   ssh -o ServerAliveInterval=30 -L 15432:localhost:5432 utente@flow.agentix-io.com
   ```

3. **PostgreSQL non accessibile:**
   ```bash
   # Test connessione locale (dal server)
   psql -h localhost -U tizianoannicchiarico -d n8n_mcp
   
   # Verifica postgresql.conf
   # listen_addresses = 'localhost'
   ```

---

## 📋 **Checklist Setup**

### **✅ Prerequisiti**
- [ ] Accesso SSH al server Hostinger
- [ ] PostgreSQL in esecuzione sul server
- [ ] PgAdmin installato localmente
- [ ] Firewall configurato correttamente

### **✅ Configurazione**
- [ ] Tunnel SSH funzionante (porta 15432)
- [ ] PgAdmin connessione configurata
- [ ] Test connessione database eseguito
- [ ] SSL/TLS abilitato per sicurezza

### **✅ Verifica**
- [ ] Query database eseguibili
- [ ] Performance acceptable
- [ ] Sessione stabile senza disconnessioni
- [ ] Backup/restore funzionanti

---

## 🔗 **Collegamenti Utili**

- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **PgAdmin Documentation:** https://www.pgadmin.org/docs/
- **SSH Tunnel Guide:** https://www.ssh.com/academy/ssh/tunneling
- **SSH Config Manual:** `man ssh_config`

---

*Questa guida sostituisce l'app SSH custom, fornendo un approccio standard e sicuro per l'accesso database.*