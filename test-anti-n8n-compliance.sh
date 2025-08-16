#!/bin/bash

# Test Script per Compliance Anti-N8N
# REGOLA FERREA: Verificare che nessun riferimento "n8n" raggiunga il cliente
# 
# Questo script scansiona tutto il codebase per trovare potenziali leak

echo "🔒 TEST COMPLIANCE ANTI-N8N - REGOLA FERREA PROGETTO"
echo "======================================================"
echo ""

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contatori
ISSUES_FOUND=0
FILES_SCANNED=0

echo -e "${BLUE}🔍 Scansione 1: Frontend Components per 'n8n' hardcoded${NC}"
echo "------------------------------------------------------"

# Scansiona frontend per riferimenti hardcoded (escludi sanitizzazione e commenti dev)
FRONTEND_ISSUES=$(grep -r -i "n8n" frontend/src/ --exclude-dir=node_modules --exclude="*.map" --exclude="test-anti-n8n-compliance.sh" --exclude="sanitization.ts" --exclude="*.backup*" 2>/dev/null | grep -v "// Sanitizza\|replace.*n8n\|sanitiz\|FORCE REFRESH.*API\|sync da n8n" | wc -l)

if [ $FRONTEND_ISSUES -gt 0 ]; then
    echo -e "${RED}❌ TROVATI $FRONTEND_ISSUES riferimenti 'n8n' nel frontend:${NC}"
    grep -r -i "n8n" frontend/src/ --exclude-dir=node_modules --exclude="*.map" --exclude="test-anti-n8n-compliance.sh" --exclude="sanitization.ts" --exclude="*.backup*" 2>/dev/null | grep -v "// Sanitizza\|replace.*n8n\|sanitiz\|FORCE REFRESH.*API\|sync da n8n" | head -10
    ISSUES_FOUND=$((ISSUES_FOUND + FRONTEND_ISSUES))
    echo ""
else
    echo -e "${GREEN}✅ Frontend PULITO - Nessun riferimento 'n8n' hardcoded${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Scansione 2: Backend APIs per 'n8n' in response JSON${NC}"
echo "--------------------------------------------------------"

# Scansiona backend per potenziali leak in responses
BACKEND_ISSUES=$(grep -r -i "n8n" src/api/ --exclude="sanitization*" --exclude="test-anti-n8n-compliance.sh" 2>/dev/null | grep -E "(json|response|res\.)" | grep -v "sanitiz" | wc -l)

if [ $BACKEND_ISSUES -gt 0 ]; then
    echo -e "${RED}❌ TROVATI $BACKEND_ISSUES potenziali leak nel backend:${NC}"
    grep -r -i "n8n" src/api/ --exclude="sanitization*" --exclude="test-anti-n8n-compliance.sh" 2>/dev/null | grep -E "(json|response|res\.)" | grep -v "sanitiz" | head -5
    ISSUES_FOUND=$((ISSUES_FOUND + BACKEND_ISSUES))
    echo ""
else
    echo -e "${GREEN}✅ Backend APIs SICURE - Nessun leak in response JSON${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Scansione 3: Database Queries per 'n8n' in SELECT${NC}"
echo "-------------------------------------------------------"

# Scansiona query database per potenziali leak
DB_ISSUES=$(grep -r -i "select.*n8n\|n8n.*select" src/ --exclude="sanitization*" --exclude="test-anti-n8n-compliance.sh" 2>/dev/null | wc -l)

if [ $DB_ISSUES -gt 0 ]; then
    echo -e "${RED}❌ TROVATI $DB_ISSUES query con potenziali leak:${NC}"
    grep -r -i "select.*n8n\|n8n.*select" src/ --exclude="sanitization*" --exclude="test-anti-n8n-compliance.sh" 2>/dev/null
    ISSUES_FOUND=$((ISSUES_FOUND + DB_ISSUES))
    echo ""
else
    echo -e "${GREEN}✅ Database Queries SICURE - Nessun leak in SELECT${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Scansione 4: File di configurazione${NC}"
echo "----------------------------------------------"

# Scansiona file config per riferimenti n8n
CONFIG_FILES="package.json package-lock.json tsconfig.json vite.config.ts tailwind.config.ts"
CONFIG_ISSUES=0

for file in $CONFIG_FILES; do
    if [ -f "$file" ]; then
        FOUND=$(grep -i "n8n" "$file" 2>/dev/null | grep -v "test-anti-n8n" | wc -l)
        if [ $FOUND -gt 0 ]; then
            echo -e "${YELLOW}⚠️  Riferimenti in $file (potrebbero essere legittimi)${NC}"
            CONFIG_ISSUES=$((CONFIG_ISSUES + FOUND))
        fi
    fi
done

if [ $CONFIG_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ File configurazione PULITI${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Scansione 5: README e Documentazione${NC}"
echo "-----------------------------------------------"

# Scansiona documentazione per leak accidentali
DOC_ISSUES=$(grep -r -i "n8n" *.md --exclude="test-anti-n8n-compliance.sh" 2>/dev/null | grep -v "REGOLA\|sanitiz\|nascond" | wc -l)

if [ $DOC_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  TROVATI $DOC_ISSUES riferimenti in documentazione:${NC}"
    echo "    (Verificare se sono intenzionali per sviluppatori)"
    grep -r -i "n8n" *.md --exclude="test-anti-n8n-compliance.sh" 2>/dev/null | grep -v "REGOLA\|sanitiz\|nascond" | head -3
    echo ""
else
    echo -e "${GREEN}✅ Documentazione SICURA per cliente${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Scansione 6: Verifica Sanitizzazione Attiva${NC}"
echo "---------------------------------------------------"

# Verifica che i middleware di sanitizzazione siano attivi
SANITIZATION_MIDDLEWARE=$(grep -r "sanitizationMiddleware" src/ 2>/dev/null | wc -l)
SANITIZATION_UTILS=$(grep -r "sanitizeApiResponse" frontend/src/ 2>/dev/null | wc -l)

if [ $SANITIZATION_MIDDLEWARE -gt 0 ] && [ $SANITIZATION_UTILS -gt 0 ]; then
    echo -e "${GREEN}✅ Middleware sanitizzazione ATTIVO nel backend${NC}"
    echo -e "${GREEN}✅ Backup sanitizzazione ATTIVO nel frontend${NC}"
else
    echo -e "${RED}❌ SANITIZZAZIONE NON COMPLETA!${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""
echo "======================================================"
echo -e "${BLUE}📊 REPORT FINALE COMPLIANCE${NC}"
echo "======================================================"

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}🎉 COMPLIANCE PERFETTA!${NC}"
    echo -e "${GREEN}✅ Nessun riferimento 'n8n' potrebbe raggiungere il cliente${NC}"
    echo -e "${GREEN}✅ Sistema SICURO per privacy cliente${NC}"
    echo ""
    echo -e "${GREEN}🔒 REGOLA FERREA RISPETTATA AL 100%${NC}"
    exit 0
else
    echo -e "${RED}❌ COMPLIANCE FALLITA!${NC}"
    echo -e "${RED}🚨 TROVATI $ISSUES_FOUND POTENZIALI PROBLEMI${NC}"
    echo ""
    echo -e "${YELLOW}📋 AZIONI RICHIESTE:${NC}"
    echo "1. Rivedere tutti i riferimenti 'n8n' trovati sopra"
    echo "2. Applicare sanitizzazione dove necessario"
    echo "3. Verificare che middleware sanitizzazione sia attivo"
    echo "4. Ri-eseguire questo test fino a compliance 100%"
    echo ""
    echo -e "${RED}⚠️  CLIENTE NON DEVE MAI VEDERE RIFERIMENTI N8N!${NC}"
    exit 1
fi