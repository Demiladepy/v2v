# Role: Demilade
## Full-Stack Engineer 2 (Backend Infrastructure & Financial APIs)

**Core Focus**: Orchestration server architecture, Paystack integration, and the Access Bank simulated ledger.

### Features Owned:
1. **Server Architecture**: Next.js serverless endpoints / Node.js runtime.
2. **Database Ledger**: unified database ledger structure (e.g., Supabase) to track merchant balance logs.
3. **Paystack Integration**: API integration for generating dynamic checkout links (`sk_test` keys).
4. **Access Bank Ledger**: Webhook listener for `charge.success` to increment simulated balances.

### Execution Plan:
- **Phase 1**: Set up the routing/endpoints. Design the database ledger structure to track persistent merchant balance logs.
- **Phase 2**: Integrate the Paystack Payment Pages API to safely handle on-the-fly checkout links. Write the secure public webhook listener endpoint that catches incoming alerts to auto-increment simulated balances.
- **Phase 3**: Set up system routing fallbacks if external requests fail and partner with Frontend (Eyitayo) to run complete end-to-end transactional testing.
