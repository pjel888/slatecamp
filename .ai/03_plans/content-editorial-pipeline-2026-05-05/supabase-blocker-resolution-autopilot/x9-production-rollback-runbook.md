# X9 Production Rollback Runbook

If future production admin audit apply occurs, rollback by run_id/payload family for inserted audit rows. For schema objects, rollback only created admin audit objects and only after backup confirmation. Never touch article/question/source content rows as rollback.
