# CattleCare — Feature Overview

## What's Live

### Authentication
- Phone OTP login (MSG91)
- Google OAuth login
- Session management (30-day tokens stored in Cloudflare D1)
- Profile edit (name, photo)
- Logout (invalidates session on backend)

### Cattle Management
- Register cattle with name, breed (Zebu / Crossbreed / Murrah), age, weight, ear tag
- List all cattle with stress level badges
- View cattle detail screen
- Edit cattle details
- Delete cattle
- AI-assisted registration flow (chat with Claude to register)

### Health Vitals
- Record vitals per cattle:
  - Body temperature — required
  - Respiratory rate — required
  - Heart rate — optional
  - Ambient temperature + humidity — auto-fetched via GPS + Open-Meteo weather API
- Vitals history (last 10 records per cattle)
- AI-assisted vitals recording (conversational flow with Claude)
- Stress index calculated using THI formula
  - Weights: THI 40%, body temp 25%, resp rate 20%, heart rate 15%
- Stress levels: None / Mild / Moderate / Severe / Danger
- Stress gauge visualization on cattle detail screen
- Cattle stress level auto-updates after every vitals entry

### Reports
- Summary — total cattle count + stress distribution breakdown
- At-risk — cattle with Moderate/Severe/Danger stress, sorted by severity, with latest vitals

### AI Health Assistant
- Chat with Claude about a specific cattle's health
- Context-aware: Claude knows breed, age, weight, stress level, and latest vitals
- Separate conversation per cattle

---

## What's Not Built Yet

| Feature | Description |
|---|---|
| Vaccination tracking | Record vaccines given, due dates, reminders |
| Medication / treatment log | Vet visits, prescriptions, dosages |
| Breeding & reproduction | Heat cycles, insemination dates, pregnancy, calving |
| Weight gain history | Track weight over time with growth chart |
| Feed & nutrition log | Daily feed intake and feed type |
| Milk production | Daily yield tracking for dairy cattle |
| Push notifications / alerts | Alert when cattle crosses a stress threshold |
| Vitals trends chart | Graph body temp / resp rate over time |
| Multiple farms / groups | Group cattle by field or shed |
| Offline mode | Core features work without internet |
| PDF export | Download health report per cattle |
