# 🏭 ELPLC Production Hall Simulator

> **Realistyczny symulator hali produkcyjnej** dla demonstracji systemu FailSafe  
> Hackathon dla Małopolski 2025 • ELPLC S.A.

---

## 🎯 Cel Projektu

Interaktywny **symulator 4 maszyn produkcyjnych** przetwarzających zlecenia w czasie rzeczywistym. System demonstruje:

- ✅ **Ciągły napływ zleceń** produkcyjnych (wariatory, baterie e-bike, amortyzatory)
- ✅ **Inteligentny przydział zadań** oparty o heurystykę minimalizacji makespan
- ✅ **Realistyczne parametry czasowe** z hal ELPLC (wariatory $120/szt, cykl 6 sek)
- ✅ **Wizualizację w stylu MES/planistycznym** zrozumiałą dla planera produkcji
- ✅ **Metryki w czasie rzeczywistym** (obciążenie, ETA, throughput, wykorzystanie)

---

## 🚀 Quick Start

### Instalacja i uruchomienie

```powershell
# Zainstaluj zależności
npm install

# Uruchom dev server
npm run dev
```

Aplikacja uruchomi się pod adresem **http://localhost:5173**

---

## 🎮 Jak używać

### Kontrola symulacji

- **▶️ START** - Rozpoczyna symulację (przypisuje wszystkie zadania)
- **⏸️ PAUSE** - Wstrzymuje symulację
- **🔄 RESET** - Resetuje do stanu początkowego (nowa pula 15-25 zadań)

### Co się dzieje w trakcie symulacji?

1. **Przy starcie**: System generuje 15-25 losowych zleceń i przypisuje je do maszyn
2. **Co 5-15 sekund**: Pojawiają się nowe zlecenia (symulacja ciągłego napływu)
3. **Automatyczny przydział**: Nowe zadania są natychmiast przypisywane algorytmem
4. **Realizacja**: Maszyny przetwarzają kolejkę, paski postępu aktualizują się płynnie

**Prędkość symulacji**: 2 minuty produkcyjne = 1 sekunda czasu rzeczywistego

---

## 📊 Typy Zleceń (Produkty ELPLC)

System zawiera **12 realistycznych typów zadań** inspirowanych produktami ELPLC:

- Wariator - Obróbka (Critical, 25 min)
- Bateria E-Bike - Montaż (Rush, 40 min)
- Amortyzator - Spawanie (Normal, 35 min)
- Inwenter - Sterownik (Critical, 50 min)
- Test EOL - Rozszerzony/Krótki (60/15 min)
- Kalibracja - Czujniki (45 min)
- + więcej

---

## 🤖 Algorytm Przydziału

System używa **heurystyki minimalizacji makespan** z preferencjami maszyn:

```
DLA KAŻDEGO NOWEGO ZADANIA:
1. Znajdź maszyny preferowane przez zadanie
2. Oblicz ETA dla każdej maszyny
3. Wybierz maszynę z najmniejszym ETA
4. Bonus dla preferowanych maszyn
```

**To NIE jest losowy przydział** - to uproszczony model myślenia planera produkcji.

---

## 📈 Stack Technologiczny

- **React 18 + TypeScript** - Komponenty i typowanie
- **Vite** - Dev server (ultra szybki)
- **Tailwind CSS** - Profesjonalny dark theme
- **Framer Motion** - Płynne animacje
- **Zustand** - State management

---

## 🧮 Realistyczne Parametry

### Koszt przestoju (validowane z ELPLC)

```
Wariatory: $120/szt, 6 sek cykl = 600 szt/h
KOSZT PRZESTOJU: $72,000 NA GODZINĘ! ⚠️

Awaria 30 min = $36,000 strat
FailSafe (2 min) = $2,400 strat
Oszczędność: $33,600 (93%)
```

---

<div align="center">
  <h3>🏭 FailSafe Production Simulator</h3>
  <p><i>"Zero paniki. 3 sekundy. Nowy plan."</i></p>
  <p>Built with ❤️ for ELPLC by Team FailSafe</p>
</div>
