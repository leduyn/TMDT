# Task: Triển khai Module Chương Trình Tích Lũy

## Phase 1: Database & Backend Core
- [ ] Database migration: `V20260604__create_accumulation_tables.sql`
- [ ] Entity: `AccumulationProgram.java`
- [ ] Entity: `AccumulationProgramTier.java`
- [ ] Entity: `AccumulationPayment.java`
- [ ] Repository: `AccumulationProgramRepository.java`
- [ ] Repository: `AccumulationPaymentRepository.java`

## Phase 2: DTOs & Service
- [ ] DTO: `AccumulationProgramDTO.java` (response)
- [ ] DTO: `AccumulationProgramRequest.java` (request)
- [ ] DTO: `AccumulationSummaryDTO.java` (agency report)
- [ ] Service: `AccumulationProgramService.java` (CRUD + commission calculation logic)

## Phase 3: Controller & Scheduler
- [ ] Controller: `AccumulationProgramController.java` (REST API)
- [ ] Scheduler: `AccumulationScheduler.java` (CronJob auto-calculate stage 1)

## Phase 4: Frontend
- [ ] API module: `accumulationApi.ts`
- [ ] Admin pages: Program list & form (CRUD + tier config)
- [ ] Admin pages: Agency progress dashboard + approve actions
- [ ] Agency portal: Accumulation progress widget

## Phase 5: Verification
- [ ] `mvn clean compile` - Backend compiles
- [ ] `npx tsc --noEmit` - Frontend type-checks
- [ ] Manual testing walkthrough
