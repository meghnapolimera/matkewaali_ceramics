# Test Scenarios

Manual test cases for the Matkewaali shop. Run these against the test stack before deploying to prod.

## Setup

- Frontend running: `cd frontend && npm run dev`
- Using test stack API (values in `frontend/.env.local`)
- Square sandbox test cards listed below

## Square Sandbox Test Cards

| Card Number | Result |
|---|---|
| `4111 1111 1111 1111` | Always succeeds |
| `4000 0000 0000 0002` | Always declined |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0069` | Expired card |

Use any future expiry date, any 3-digit CVV, any name.

---

## 1. Happy Path — Successful Purchase

**Goal**: Full checkout flow completes, order in DynamoDB, email received.

1. Go to `/products`, click a product
2. Click "Add to Cart" → button shows "Added" then "Sold Out"
3. Go to `/cart` → item shows with "Reserved until HH:MM"
4. Click "Checkout" → redirected to `/checkout`
5. Fill in: name, email, US address (use state WA to test tax)
6. Enter card `4111 1111 1111 1111`, any expiry/CVV
7. Click "Place Order" → spinner appears
8. Confirm success screen: "Order confirmed! A confirmation email has been sent to {email}"

**Verify:**
- [ ] `matkewaali-orders-test` in DynamoDB: order record with `status = completed`, `squarePaymentId` present
- [ ] `matkewaali-locks-test`: lock record deleted
- [ ] `matkewaali-products-test`: product `quantity` still at 0 (not restored)
- [ ] Confirmation email received at the address entered
- [ ] Square sandbox dashboard: payment appears
- [ ] Cart is empty after success

---

## 2. Tax Calculation

**Goal**: WA orders include 10.25% tax, other states don't.

1. Go to `/checkout` with an item in cart
2. Enter a Washington state address → confirm tax line shows 10.25%
3. Change state to CA → confirm tax line shows $0.00

**Verify:**
- [ ] Tax updates in real time as state changes
- [ ] Order in DynamoDB has correct `tax` and `total` values

---

## 3. Card Declined

**Goal**: Declined card shows inline error, cart stays intact, user can retry.

1. Add item to cart, go to `/checkout`
2. Fill in valid address, enter card `4000 0000 0000 0002`
3. Click "Place Order"

**Verify:**
- [ ] Error message appears inline (e.g. "Your card was declined")
- [ ] Form re-enabled, user can change card
- [ ] Cart still has the item
- [ ] `matkewaali-orders-test`: order record with `status = failed`
- [ ] `matkewaali-locks-test`: lock record still present
- [ ] `matkewaali-products-test`: quantity still decremented (lock is still active)
4. Now enter `4111 1111 1111 1111` and resubmit → should succeed

---

## 4. Lock Expired at Checkout

**Goal**: 409 response when lock expires before order is placed.

1. Add item to cart, go to `/checkout`
2. In DynamoDB console, find the lock in `matkewaali-locks-test` and set `expiresAt` to `1`
3. Fill in form and submit

**Verify:**
- [ ] Checkout page shows "One or more items in your cart have expired" state
- [ ] "Return to Cart" button navigates to `/cart`
- [ ] Cart page: item removed (cart store's `checkExpiredLocks` fires on next interval or page load)

---

## 5. Empty Cart Guard

**Goal**: Navigating directly to `/checkout` with no cart items redirects to `/cart`.

1. Clear cart (remove all items or use a fresh browser session)
2. Navigate directly to `http://localhost:5173/checkout`

**Verify:**
- [ ] Immediately redirected to `/cart`

---

## 6. Sold Out — Cannot Add to Cart

**Goal**: A product with `quantity = 0` cannot be added to cart.

1. In DynamoDB console, set a product's `quantity` to `0` in `matkewaali-products-test`
2. Navigate to that product's detail page (may need to reload)

**Verify:**
- [ ] "Sold Out" button shown, disabled
- [ ] If you try to navigate while someone else is buying the last one: add item to cart, then manually set quantity to 0 on the product in DynamoDB before clicking "Add to Cart" a second time → "Sold Out" shown

---

## 7. TTL Expiry — Quantity Restored

**Goal**: When a lock expires via TTL, the product quantity is restored.

1. Add item to cart
2. In DynamoDB console, set the lock's `expiresAt` to a past timestamp (e.g. `1`)
3. DynamoDB TTL fires within a few minutes of the expiry time
4. Monitor CloudWatch Logs (`/aws/lambda/matkewaali-service-test`) for a `lock_expired` log entry

**Verify:**
- [ ] `lock_expired` log appears in CloudWatch
- [ ] `matkewaali-products-test`: product `quantity` incremented back up
- [ ] `matkewaali-locks-test`: lock record deleted
- [ ] On the frontend (within 30s interval): toast appears "Your reservation for {item} has expired", item removed from cart

---

## 8. Remove From Cart — Quantity Restored Immediately

**Goal**: Removing an item from the cart immediately releases the lock and restores quantity.

1. Add item to cart (quantity decrements)
2. Go to `/cart`
3. Click ✕ to remove the item

**Verify:**
- [ ] Item removed from cart immediately
- [ ] `matkewaali-locks-test`: lock record deleted
- [ ] `matkewaali-products-test`: product `quantity` restored (+1)
- [ ] On the product detail page: button returns to "Add to Cart" after a reload

---

## 9. Reconciliation Check — Pending Orders

**Goal**: Verify you can identify any orders stuck in `pending` status (Square charged but DynamoDB update failed).

1. Scan `matkewaali-orders-test` in DynamoDB console
2. Filter by `status = pending` with `createdAt` older than a few minutes

**What to do with a stuck pending order:**
- Find the `orderId` in CloudWatch logs
- Look for `order_update_failed` log entry — it will contain the `squarePaymentId`
- Cross-reference with Square sandbox dashboard to confirm payment succeeded
- Manually update the order's `status` to `completed` and add the `squarePaymentId` in DynamoDB console

---

## Notes

- DynamoDB TTL deletion is not instant — AWS processes TTL within ~48 hours of expiry (usually within minutes, but no guarantee)
- All test scenarios above use the test stack and Square sandbox — no real money moves
- When testing email scenarios, check spam folder if confirmation doesn't arrive within a few minutes
