Fetch and report Matkewaali user metrics from CloudWatch Logs Insights.

## Setup

Log groups (replace {env} with test or prod):
- API access logs: `/matkewaali/api-access/{env}`
- Lambda logs: `/aws/lambda/matkewaali-service-{env}`
- Region: `us-east-1`

## Steps

1. Ask the user: which environment (test or prod)? What time period in days (default: 7)?

2. Compute time range using python3:
```bash
START=$(python3 -c "import time; print(int(time.time()) - DAYS*24*3600)")
END=$(python3 -c "import time; print(int(time.time()))")
```

3. Run all four queries in parallel using `aws logs start-query`, then poll each with `aws logs get-query-results --query-id ID --region us-east-1` until `status` is `Complete` (poll every 2 seconds, up to 15 seconds).

**Owner IP filtering:** Check memory for the owner IP and add `| filter ip != "<owner-ip>"` to all API access log queries. Lambda log queries don't have an ip field so they can't be filtered by IP.

**Query 1 — Unique visitors** (API access log group):
```
fields cognitoId
| filter cognitoId not like "" and cognitoId != "-" and httpMethod != "OPTIONS" and ip != "<owner-ip>"
| stats count_distinct(cognitoId) as unique_visitors
```

**Query 2 — Top pages by views** (API access log group):
```
fields path, status
| filter status = 200 and not (path like "/analytics") and ip != "<owner-ip>"
| stats count() as views by path
| sort views desc
| limit 10
```

**Query 3 — Funnel event counts** (Lambda log group):
```
fields message, event
| filter message = "analytics_event"
| stats count() as count by event
| sort count desc
```

**Query 4 — Top add-to-cart products** (Lambda log group):
```
fields event, properties.slug
| filter message = "analytics_event" and event = "add_to_cart"
| stats count() as times_added by properties.slug
| sort times_added desc
| limit 10
```

4. Present a clean report in this format:

```
Matkewaali Metrics — {env} — Last {days} days

VISITORS
  Unique visitors: {N}

TOP PAGES
  /products                  {N} views
  /products/mug-tall         {N} views
  ...

FUNNEL
  add_to_cart                {N} events
  checkout_started           {N} events   (once checkout is live)
  purchase_complete          {N} events   (once checkout is live)

TOP ADDED TO CART
  mug-tall                   {N} times
  ...
```

If a log group has no data yet, note it and skip that section rather than failing.
