## Day 5: Integration & Testing

### Task 5.1: End-to-End Testing

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read all week 4 tasks.

## TASK
Integrate and test all Week 4 features.

1. Wire CSV export button to Settings page
2. Wire offline queue to QuickAddModal
3. Test admin endpoints with admin JWT
4. Add offline banner component
5. Add sync status indicator

Create test scenarios:
- Online: Normal flow
- Offline: Add 3 transactions → reconnect → verify sync
- CSV export: Various date ranges
- Admin: Login → view metrics → verify no financial data

## CONSTRAINTS
- All features must work on mobile
- Offline queue must survive page refresh
- CSV must be valid format
- Admin auth must be separate

## VERIFICATION
1. Complete offline → online flow on mobile
2. Export CSV and open in spreadsheet
3. Admin dashboard shows correct aggregates
4. No 500 errors in any flow
Week 4 Exit Gate Checklist
[ ] CSV export works with date range filter
[ ] CSV contains exact decimal amounts
[ ] Offline queue stores transactions when offline
[ ] Auto-sync when reconnecting
[ ] Failed transactions shown to user
[ ] Offline banner appears when disconnected
[ ] Admin /health returns 200
[ ] Admin /metrics shows aggregate counts only
[ ] Admin /users shows non-financial data only
[ ] Admin auth separate from user auth
[ ] Sync job runs every 15 minutes
[ ] All features work on mobile
plain

---

