# 🎨 PilotPro Design System - Guida Sviluppatori

## Panoramica

Design system minimalista ispirato al VS Code dark theme per PilotPro Control Center. 
**OBBLIGATORIO** per tutti gli sviluppi presenti e futuri.

## 🎯 Filosofia del Design

**"Semplicità e coerenza sopra ogni cosa"**

- Minimalismo: Solo 3 colori principali
- Coerenza: Stessi pattern su tutto il sito  
- Funzionalità: UI che non distrae dai dati
- Professionalità: Look & feel enterprise

## 🎨 Sistema Colori

### Palette HSL (OBBLIGATORIA)

```css
:root {
  --background: 220 13% 8%;  /* #1a1a1d - Grigio scuro principale */
  --foreground: 0 0% 95%;    /* #f2f2f2 - Bianco per testo principale */
  --primary: 122 39% 49%;    /* #4CAF50 - Verde Material Design */
  --card: 220 13% 10%;       /* Cards background */
  --border: 220 13% 15%;     /* Bordi sottili */
  --muted: 220 9% 70%;       /* Testo secondario */
}
```

### Classi Tailwind Principali

```css
/* Background */
.bg-background  /* Sfondo principale app */
.bg-card        /* Background cards e modali */

/* Testo */
.text-foreground  /* Testo principale bianco */
.text-muted       /* Testo secondario grigio */
.text-primary     /* Accenti verdi */

/* Bordi */
.border-border    /* Bordi sottili standard */

/* Hover States */
.hover:bg-border  /* Feedback interazione */
```

### ❌ COLORI VIETATI

```css
/* MAI usare questi colori */
purple, violet, indigo, blue, cyan, pink, rose, orange, amber, yellow, lime

/* MAI usare gradient */
bg-gradient-*, from-*, to-*, via-*

/* MAI background colorati per cards */
bg-red-*, bg-blue-*, bg-green-* (eccetto primary)
```

## 📝 Tipografia

### Font Stack

```css
/* Principale - Geist */
font-family: 'Geist', sans-serif;

/* Codice - Geist Mono */
font-family: 'Geist Mono', monospace;
```

### Dimensioni Standard

```css
/* Labels e status */
text-sm font-medium

/* Titoli cards */
text-lg font-semibold

/* Testo corpo */
text-base

/* Codice e dati */
text-sm font-mono
```

### Truncation (OBBLIGATORIO)

```tsx
// Per titoli lunghi nelle cards
<span className="truncate max-w-xs">
  {longTitle}
</span>

// Per nomi workflow
<span className="truncate max-w-sm">
  {workflowName}  
</span>
```

## 🧩 Componenti Standard

### Cards

```tsx
// Template card standard
<div className="bg-card border border-border rounded-lg p-6">
  <h3 className="text-lg font-semibold text-foreground mb-4">
    Titolo Card
  </h3>
  <div className="text-muted">
    Contenuto card
  </div>
</div>
```

### Dropdown (Custom Component)

```tsx
import { Dropdown } from '../ui/Dropdown'

// Sostituisce SEMPRE i select nativi
<Dropdown
  value={selectedValue}
  onChange={handleChange}
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
  placeholder="Seleziona opzione"
/>
```

### Buttons

```tsx
// Primary button
<button className="bg-primary text-black px-4 py-2 rounded-md hover:bg-primary/90">
  Action
</button>

// Secondary button  
<button className="border border-border text-foreground px-4 py-2 rounded-md hover:bg-border">
  Cancel
</button>
```

### Status Indicators

```tsx
// SOLO con primary/muted colors
<span className={`px-2 py-1 rounded-full text-xs font-semibold truncate max-w-xs ${
  isActive ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted'
}`}>
  {status}
</span>
```

## 📱 Layout Pattern

### Page Structure

```tsx
function PageComponent() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header sempre presente */}
      <div className="border-b border-border p-6">
        <h1 className="text-2xl font-bold text-foreground">
          Page Title
        </h1>
      </div>
      
      {/* Contenuto principale */}
      <div className="p-6 space-y-6">
        {/* Cards uniformi */}
        <div className="bg-card border border-border rounded-lg p-6">
          Content
        </div>
      </div>
    </div>
  )
}
```

### Modal Structure  

```tsx
function ModalComponent() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-card border border-border rounded-lg p-6 max-w-4xl w-full mx-4">
        {/* Header modal */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground truncate">
            Modal Title
          </h2>
          <button className="text-muted hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Contenuto modal */}
        <div className="space-y-4">
          Content
        </div>
      </div>
    </div>
  )
}
```

## 🔍 Icone (Lucide React)

### Import Standard

```tsx
import { 
  Search, Filter, RefreshCw, Download, 
  CheckCircle, XCircle, AlertTriangle,
  User, Settings, Database, BarChart3
} from 'lucide-react'
```

### Dimensioni Standard

```tsx
// Icone piccole (buttons, status)
<CheckCircle className="w-4 h-4" />

// Icone medie (navigation, cards)  
<Database className="w-5 h-5" />

// Icone grandi (headers, empty states)
<BarChart3 className="w-6 h-6" />
```

## ✅ Checklist Sviluppatore

Prima di ogni commit, verificare:

- [ ] **Solo 3 colori**: background, foreground, primary
- [ ] **No gradient**: Eliminati tutti bg-gradient-*
- [ ] **Tipografia coerente**: text-sm font-medium per labels
- [ ] **Truncation**: truncate max-w-xs per titoli lunghi
- [ ] **Dropdown custom**: Mai select nativi
- [ ] **Background uniforme**: bg-background/bg-card ovunque
- [ ] **Bordi sottili**: border-border (15% opacity)
- [ ] **Icone Lucide**: Mai emoji o icone pittografiche
- [ ] **Hover states**: hover:bg-border per feedback

## 🚫 Anti-Pattern da Evitare

```tsx
// ❌ SBAGLIATO - Colori non permessi
<div className="bg-blue-500 text-yellow-300">

// ❌ SBAGLIATO - Gradient vietati  
<div className="bg-gradient-to-r from-purple-500 to-blue-500">

// ❌ SBAGLIATO - Select nativo
<select className="...">

// ❌ SBAGLIATO - Emoji
<span>🚀 Status</span>

// ❌ SBAGLIATO - Titoli senza truncation
<h3>{veryLongWorkflowNameThatBreaksLayout}</h3>

// ❌ SBAGLIATO - Background inconsistenti
<div className="bg-gray-800"> {/* Usa bg-card */}
```

```tsx
// ✅ CORRETTO - Design system compliant
<div className="bg-card border border-border rounded-lg">
  <div className="flex items-center gap-3">
    <Database className="w-5 h-5 text-primary" />
    <span className="text-sm font-medium text-foreground truncate max-w-xs">
      {workflowName}
    </span>
    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
      ACTIVE
    </span>
  </div>
</div>
```

## 🔧 Migrazione Codice Esistente

### Trovare e Sostituire

```bash
# Cerca colori non permessi
rg "bg-(blue|purple|yellow|orange|pink|rose|cyan|indigo|violet|amber|lime)"

# Cerca gradient
rg "bg-gradient|from-|to-|via-"

# Cerca select nativi
rg "<select"

# Cerca emoji
rg "[🔴🟢🟡⚡🚀📊🔧⚙️🎯]"
```

### Pattern di Sostituzione

```tsx
// Prima (da cambiare)
bg-blue-500 → bg-primary
bg-red-500 → bg-primary (per status attivi) o text-muted (per disabilitati)  
bg-gradient-to-r from-green-400 to-blue-500 → bg-primary

// Tipografia
text-md → text-sm font-medium
font-bold → font-semibold

// Select nativi
<select> → <Dropdown>
```

## 🎯 Standard di Qualità

### Performance
- React.memo per componenti pesanti
- useCallback per funzioni complesse
- Lazy loading per modali

### Accessibilità
- Alt text per icone semantiche
- Focus management nei modali
- Contrasto colori rispettato

### Maintainability  
- Componenti single-responsibility
- Props tipizzate TypeScript
- CSS variables per temi futuri

---

**Versione**: v2.5.0  
**Ultima modifica**: 14/08/2025  
**Status**: FINALE - Regole permanenti per tutti gli sviluppi