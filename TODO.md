# DAO Layer Implementation Plan

## Status: In Progress [18/27]

### Phase 1: Create DAO Infrastructure [3/3 ✅]
- [x] Create `src/dao/__init__.py` 
- [x] Create `src/dao/base.py` (BaseDAO mixin)
- [x] Create `src/dao/dependencies.py` (DAO factory dependencies)

### Phase 2: Implement Model DAOs [6/6 ✅]

### Phase 3: Update Existing Routers [6/6 ✅]

### Phase 4: Add Missing CRUD Endpoints [4/8 ✅]
- [x] Topics: PUT/{id}, DELETE/{id}
- [x] Documents: PATCH/{id}, GET list w/pagination
- [ ] Chat: full CRUD
- [x] Feedback: GET list, DELETE/{id}
- [ ] User: Admin CRUD
- [ ] AdminLog: list/filter endpoints
- [ ] Topics: PUT/{id}, DELETE/{id}
- [ ] Documents: PATCH/{id}, GET list w/pagination
- [ ] Chat: full CRUD
- [ ] User: Admin CRUD
- [ ] Feedback: GET list, DELETE/{id}
- [ ] AdminLog: list/filter endpoints
- [ ] Update schemas.py (Add Update schemas + pagination)

### Phase 5: Testing & Validation [0/3]
- [ ] Test existing endpoints (no regressions)
- [ ] Test new CRUD endpoints
- [ ] Docker restart + full API test

**Next step:** Create DAO infrastructure files
