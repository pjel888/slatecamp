# Production Admin Audit Rollback Plan

Rollback must delete only admin audit rows by run_id/payload family and revert only admin audit schema objects if explicitly created by the cutover. Prefer production backup restore for broad failures. Do not touch article/question/source content rows.
