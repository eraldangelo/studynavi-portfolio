# Monitoring Alerts (Runtime)

Purpose: make runtime monitoring actionable with two low-noise alerts:
- PDF failure spike
- API failure spike

## 1) Create Log-Based Metrics

Set your project:

```bash
gcloud config set project PROJECT_ID
```

Create PDF failures metric:

```bash
gcloud logging metrics create studynavi_pdf_failures \
  --description="StudyNavi PDF runtime failures" \
  --log-filter='
    resource.type="cloud_run_revision"
    AND textPayload:"[runtime-alert]"
    AND (textPayload:"pdf" OR textPayload:"PDF")
  '
```

Create API failures metric:

```bash
gcloud logging metrics create studynavi_api_failures \
  --description="StudyNavi API runtime failures" \
  --log-filter='
    resource.type="cloud_run_revision"
    AND textPayload:"runtime-alert][api"
  '
```

## 2) Apply Alert Policies

1. Ensure an email notification channel exists (Monitoring > Alerting > Notification channels).
2. If needed, create one via API:

```bash
curl -X POST "https://monitoring.googleapis.com/v3/projects/PROJECT_ID/notificationChannels" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "type":"email",
    "displayName":"StudyNavi Alerts Email",
    "labels":{"email_address":"you@example.com"},
    "enabled":true
  }'
```

1. Open JSON templates:
   - `firebase/monitoring/alert-policies/pdf-failures-spike.json`
   - `firebase/monitoring/alert-policies/api-failures-spike.json`
2. Replace `PROJECT_ID` and `CHANNEL_ID` in each file.
3. Create policies:

```bash
gcloud monitoring policies create --policy-from-file=firebase/monitoring/alert-policies/pdf-failures-spike.json
gcloud monitoring policies create --policy-from-file=firebase/monitoring/alert-policies/api-failures-spike.json
```

## 3) Threshold Rationale (Anti-Spam)

- PDF: `>5` failures in `5m`
- API: `>12` failures in `5m`
- Auto close: `30m`

Tune thresholds after one week of baseline logs.
