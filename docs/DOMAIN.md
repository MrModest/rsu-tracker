# RSU Domain Knowledge — Germany Tax Context

## RSU Lifecycle Overview

Restricted Stock Units (RSUs) are a form of equity compensation where a company promises shares to an employee. The shares are not owned until they "vest" (become the employee's property). The lifecycle:

1. **Grant** — Company promises X shares. No tax event. No actual shares yet.
2. **Vest / Cliff** — Shares become the employee's property. Taxable as income (geldwerter Vorteil). FIFO from grant pools.
3. **Sell-to-Cover (sell_for_tax)** — Employer sells some vested shares at market price to cover income tax withholding. Happens shortly after vest (sometimes days later, so price may differ from vest-day price).
4. **Tax Cash Return (tax_cash_return)** — Employer sells slightly MORE shares than needed for tax. The excess cash is returned to the employee separately.
5. **Release** — Remaining shares (vested minus sold-for-tax) are deposited into employee's brokerage account. The unit price at release becomes the **cost basis** for future capital gains.
6. **Sell** — Employee voluntarily sells shares. Capital gain = (sell_price - cost_basis) × shares.

---

## Event Types Reference

| Type | share_amount | unit_price | total_amount | vest_event_id | grant_name |
|------|-------------|------------|--------------|---------------|------------|
| `grant` | Total promised shares | Stock price at grant date | share_amount × unit_price | null | Required (e.g. "2024 Annual") |
| `vest` | Shares vesting | FMV at vest date (optional) | share_amount × unit_price | null | Optional (informational) |
| `cliff` | Shares vesting (first vest) | FMV at vest date (optional) | share_amount × unit_price | null | Optional (informational) |
| `sell_for_tax` | Shares sold for tax | Market price at sale | share_amount × unit_price | FK → vest/cliff event | Optional |
| `tax_cash_return` | 0 | 0 | Cash amount returned | FK → vest/cliff event | Optional |
| `release` | Shares released to brokerage | Cost basis price (defaults to sell_for_tax price) | share_amount × unit_price | FK → vest/cliff event | Optional |
| `sell` | Shares sold by employee | Sale price | share_amount × unit_price | null | null |

---

## Germany Tax Rules (§ 19, § 20 EStG)

### At Vesting — Income Tax (Lohnsteuer)
- RSU vesting is a taxable event as employment income under § 19 EStG
- The Fair Market Value (FMV) at vesting = "geldwerter Vorteil" (benefit in kind)
- Added to gross salary and taxed at employee's marginal income tax rate (up to ~45% + 5.5% solidarity surcharge)
- Employer withholds via payroll or sell-to-cover mechanism
- Tax-free allowance: €2,000/year (as of Jan 2024, increased from €1,440) if all employees with 1+ year tenure are eligible

### Cost Basis (Anschaffungskosten)
- The market price at the time of release/sell-to-cover becomes the cost basis for capital gains
- In this app: **release event's unit_price = cost basis for the lot**
- Default: release price = sell_for_tax price (user can override)
- This is the "steuerlicher Einstandspreis" used for Anlage KAP

### At Sale — Capital Gains Tax (Kapitalertragsteuer / Abgeltungsteuer)
- Capital gain = sale price − cost basis (per share)
- Flat tax rate: 25% + 5.5% solidarity surcharge = **26.375%** total
- Plus church tax if applicable (~8-9% of the 25%)
- Annual saver's allowance (Sparerpauschbetrag): €1,000 per person
- **Short-term vs long-term distinction does NOT apply in Germany** (flat rate regardless of holding period)
- Reported on Anlage KAP in tax return

### FIFO Rule (§ 20 Abs. 4 Satz 7 EStG)
- **Legally mandated** in Germany for securities sales
- When selling fungible securities from the same depot, the shares acquired FIRST are deemed sold FIRST
- Critical for RSU holders with multiple vesting tranches at different FMVs
- Each vest/release creates a new "acquisition" with its own cost basis
- Oldest lots are consumed first when selling → often results in higher gains (and higher tax)

---

## Two-Level FIFO in This App

### Level 1: Vesting Consumes Grants (FIFO by grant date)
When shares vest, they come from the oldest grant pool first.

**Example:**
- Grant A: 10 shares (Jan 2023)
- Grant B: 20 shares (Jul 2023)
- Vest of 15 shares → consumes 10 from Grant A (exhausted) + 5 from Grant B (15 remain)
- Next vest of 15 shares → consumes remaining 15 from Grant B (exhausted)

### Level 2: Selling Consumes Release Lots (FIFO by release date)
When employee sells, shares come from the oldest release lot first.

**Example:**
- Release Lot 1: 20 shares at €50 cost basis (Mar 2023)
- Release Lot 2: 30 shares at €60 cost basis (Sep 2023)
- Sell 25 shares at €80:
  - 20 from Lot 1: gain = (80−50) × 20 = €600
  - 5 from Lot 2: gain = (80−60) × 5 = €100
  - Total capital gain: €700

---

## Sell-to-Cover Details

When RSUs vest, the employer must withhold income tax. Mechanism:
1. Employer instructs broker to sell enough shares to cover the tax bill
2. Broker sells at current market price (may differ from vest-day price if delayed by days)
3. Proceeds go to tax authority
4. Broker typically sells slightly MORE than needed (rounding up)
5. Excess cash is returned to employee as a separate payment → `tax_cash_return` event
6. Remaining shares are deposited into employee's brokerage account → `release` event

**Important:** The sell_for_tax shares are NOT a capital gain event — they were sold immediately at vest/release time to cover income tax already calculated on the geldwerter Vorteil.

---

## Broker Fees

Broker fees apply only to the two event types that involve actual market transactions:

### Sell-to-Cover Fee (`sell_for_tax.fee`)
- The broker charges a transaction fee when selling shares to cover income tax
- This fee is **not** part of the tax amount — it's a separate cost borne by the employee
- Recorded as a dedicated `fee` field on the `sell_for_tax` event (defaults to 0)
- In the tax withholding summary: fee is shown alongside tax proceeds but is **not** included in "net tax paid" — it reduces the employee's net proceeds, not the tax obligation
- Net tax paid = tax_proceeds − cash_returned (fee is a separate cost line item)

### Sell Fee (`sells.fee`)
- The broker charges a transaction fee when the employee voluntarily sells shares
- Recorded as a dedicated `fee` field on the `sell` event (defaults to 0)
- For capital gains purposes: the fee is **subtracted from total sale proceeds**, reducing the taxable capital gain
- When a sell consumes multiple lots via FIFO, the fee is **prorated** across lots proportionally to the number of shares consumed from each lot
- Capital gain per lot = (sell_price × shares_from_lot) − (cost_basis × shares_from_lot) − (fee × shares_from_lot / total_shares_sold)

### Where Fees Do NOT Apply
- `grant` — no transaction occurs
- `vest` / `cliff` — shares vest but no market sale
- `tax_cash_return` — cash transfer, no market transaction
- `release` — shares transferred to brokerage account, no market sale

---

## Insight Calculations

### Promised vs Factual (per grant_name)
Compares the "paper value" at grant time vs actual value at release time:
- **Promised value** = grant_price × number_of_shares_released
- **Factual value** = release_price × number_of_shares_released
- **Difference** = factual − promised (positive = stock appreciated between grant and release)
- Grouped by grant_name, using FIFO to determine which grants fed each vest
- Only vests with a linked release event are included

### Capital Gains (per sell event)
For each sell event:
1. Determine which release lots are consumed (FIFO by release date)
2. For each consumed lot portion: gain = (sell_unit_price − lot_cost_basis) × shares_from_lot
3. Sum all per-lot gains = total capital gain for this sell

### Tax Withholding Summary (per vest event)
For each vest/cliff event, aggregate its linked events:
- Shares vested (from vest event)
- Shares sold for tax (from linked sell_for_tax)
- Tax proceeds (sell_for_tax total_amount)
- Cash returned (tax_cash_return total_amount)
- Net tax paid = tax_proceeds − cash_returned
- Effective tax rate = net_tax_paid / (vest unit_price × shares_vested) — falls back to sell_for_tax price if vest price not provided

### Portfolio Overview
- **Granted**: SUM(share_amount) where type='grant'
- **Vested**: SUM(share_amount) where type IN ('vest','cliff')
- **Sold for tax**: SUM(share_amount) where type='sell_for_tax'
- **Released**: SUM(share_amount) where type='release'
- **Sold by user**: SUM(share_amount) where type='sell'
- **Currently held**: released − sold
- **Unrealized value**: held × latest known unit_price

---

## Sources
- [Baker McKenzie — RS/RSU Germany](https://resourcehub.bakermckenzie.com/en/resources/global-equity-matrix/emea/germany/topics/rsrsu)
- [Mavaro Tax — RSU taxation in Germany](https://mavaro-tax.com/en/how-are-restricted-stock-units-rsu-taxed-in-germany/)
- [Haufe — FIFO-Methode § 20 EStG](https://www.haufe.de/id/beitrag/einkuenfte-aus-kapitalvermoegen-1026-fifo-methode-HI9285880.html)
- [Schwab — RSU Taxes Guide](https://www.schwab.com/learn/story/rsu-taxes-and-psu-taxes)
- [Brooklyn Fi — RSU Cost Basis Explained](https://www.brooklynfi.com/blog/rsu-cost-basis)
