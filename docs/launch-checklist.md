# Launch Checklist + SLA Monitoring

## Go-Live Checklist

- [ ] DNS and TLS verified for primary and admin domains
- [ ] Production secrets configured and validated
- [ ] Payment providers in live mode with webhook verification
- [ ] Backup/restore test completed within last 7 days
- [ ] Legal pages and privacy flows verified
- [ ] Traceability lookup and batch data validated
- [ ] Core flows pass smoke test:
  - [ ] Browse + product details
  - [ ] Cart + checkout
  - [ ] Customer account
  - [ ] B2B quote flow
  - [ ] Admin content update
- [ ] Observability and alert channels active

## SLA Baseline

- Availability target: `99.9%` monthly
- Incident response:
  - P1 acknowledge within 15 minutes
  - P2 acknowledge within 30 minutes
  - P3 acknowledge within 4 hours
- Error budget:
  - monthly downtime budget aligned with 99.9% target

## Monitoring Signals

- API health endpoint uptime (`/api/health`)
- Core Web Vitals budget violations (LCP/INP/CLS)
- Captured client/server error event volume
- Checkout and payment failure rates
- Traceability lookup failure rates

## Post-Launch Cadence

- First 24 hours: hourly checks
- First 7 days: daily reliability summary
- Ongoing: weekly ops review + monthly SLA report
