## Summary

- What changed:
- Why:

## Validation

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test:regression`
- [ ] `npm run test:e2e:smoke`
- [ ] `npm run check:file-lengths`

## Risk Checklist

- [ ] No business logic change unless explicitly intended
- [ ] No UI/UX regressions introduced
- [ ] Country computations (AU/CA/NZ/IE) still match expected behavior
- [ ] PDF preview/download flow still works
- [ ] No new file exceeds 250 lines

## Deploy Notes

- [ ] Requires Firebase App Hosting rollout
- [ ] Requires env/secrets change
- [ ] Requires monitoring/alert updates
