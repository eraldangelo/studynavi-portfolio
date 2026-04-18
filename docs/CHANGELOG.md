# Changelog

Generated from git commit messages. Most recent entries first.

## 2026-02-27
- `71d963c` chore: align git author email with GitHub account
- `94d7870` Harden PDF pipeline, security gates, and rollout automation
- `159b8a0` Docs: standardize deployment wording to Firebase App Hosting
- `75f3222` Redirect Firebase Hosting to App Hosting hosted.app URL
- `4bb1ed6` Refactor PDF flow structure, optimize generation, and harden payment calculations
- `0337174` chore: align verify and smoke workflow docs
- `bf355aa` docs: standardize deployment docs to firebase app hosting
- `e592404` chore: harden security deps and stabilize e2e pdf flow
- `74e305e` test: add playwright smoke suite for critical flows
- `ad3ab4a` chore: harden quality gates and ops runbooks
- `0623d61` test: add regression suite for financial and pdf rules
- `3b8469b` chore: remove cloudbuild config and jscpd ignore
- `b3fcfc5` refactor: reorganize studynavi modules and docs

## 2026-02-26
- `979a438` Fix logout redirect blank state and include Turnstile build env

## 2026-02-23
- `5b54c32` Fix auth loop by removing turnstile middleware gate
- `c35ddc3` Add StudyNavi custom-token SSO login support

## 2026-02-20
- `00e25ff` Enforce turnstile verification

## 2026-02-19
- `6ddfb2f` feat: add Turnstile to login

## 2026-02-11
- `e2e26b2` Fix Dockerfile runtime start
- `bcd1f93` Docs: add App Hosting deploy notes
- `1266043` Improve mobile layout
- `af159e3` Configure App Hosting env

## 2026-02-10
- `4e70512` Fix Navitas rendering and login image

## 2026-02-07
- `c7014da` Harden Cloud Run build and runtime
- `7c0f028` Update blueprint for Next 16
- `f900124` Upgrade to Next 16 and modernize config
- `a6ca523` Update search policy, attribution, and rate limiting
- `bff3956` Refactor chat route and improve search sourcing
- `d7a2f38` Add changelog for v3.0
- `8e5d5cc` Reorganize project structure and cleanup

## 2026-02-06
- `3384178` fix(chat): hoist measureSizes to avoid TDZ ReferenceError
- `85d632b` fix(chat): hoist measureSizes and clampPosition to avoid TDZ ReferenceError
- `01c4516` chore(lint): fix ESLint warnings (config export, hook deps, expiryTimer, remove unused disable)
- `9e10cd7` fix(lint): use eslint CLI to avoid deprecated next lint options
- `6402788` fix(chat): enforce Go8 partnership guidance
- `1dc82f5` fix(chat): redact external agency names and source lines from assistant output
- `b215a89` chore(chat): avatar border and send button styling
- `3a03368` Save workspace changes

## 2026-02-05
- `2c169f2` chore(chat): make assistant responses consultant-facing (internal briefings) and emphasize 2025+ recency
- `2fc985e` feat(chat): verify 2025+ sources via Brave Search and warn if not confirmed
- `29f78e2` chore(chat): update system prompt to 25 years experience and prioritize 2025+
- `3a9e8de` fix(ui): right-align user chat bubble
- `3cd8075` fix(ui): make user chat bubble size fit content
- `d90225a` fix(ui): tighten chat bubbles and spacing
- `b13e8a4` chore: update AI assistant start message
- `27d7c65` chore: open AI chatbox by default
- `29ca320` chore: update chatbot UI  typing indicator, subtitles, version bump
- `e92dc1e` chore: update chatbot UI, typing indicator, and version strings
- `6a785b7` chore: update chatbot UI - chat avatar and interactions

## 2026-02-04
- `919a7ca` ISAM: emphasize important phrases in WhatIsISAM
- `1c8e87d` ISAM: highlight active sidebar item; pass selectedId through wrapper
- `2b522ac` ISAM training updates: reading page, UI tweaks, completion sync
- `5ccd581` ISAM: add reading page, image and UI tweaks; add MarkComplete sync with sidebar
- `d57af5b` fix(layout): align Course Introduction with sidebar header by adjusting paddings and sidebar top
- `4152fae` fix(layout): remove extra horizontal padding so header aligns with main content
- `32a83ee` chore(isam): show Course Introduction header and Module subtitle
- `3b1af6d` feat(isam): add Dumbbell icon to sidebar header
- `0136260` fix(isam): update sidebar title to 'ISAM Training'
- `c548718` feat(isam): add SidebarWrapper to fix sidebar to viewport on desktop
- `528120a` refactor(isam): move sidebar into page layout so it remains locked; simplify client
- `a84d014` feat(isam): lock sidebar with sticky position and internal scroll
- `a5d1bbe` ux(isam): keep video large in-place; remove transcript scroll container and pin logic
- `0c74870` ux(isam): minimize video in-place on scroll instead of pinning fixed
- `d0a6987` feat(isam): pin small video on scroll; remove transcript auto-scroll; enable manual transcript scrolling
- `84dcbad` fix(transcript): clean formatting and combine list items into single caption
- `003a888` feat(isam): use provided script for transcript and add transcript.txt/.srt
- `26d7162` refactor(isam): remove demo and integrate transcript auto-scroll into ISAMPlayer
- `7b43532` fix(isam): remove hardcoded timestamp from ISAMPlayer
- `aaf225a` feat(isam): add Coursera-style sidebar and player components; modularize modules data
- `e72b0c7` fix(isam): move metadata above client imports
- `2d76854` fix(isam): remove 'use client' from page to allow metadata export
- `d53a61b` feat(isam): include global AppHeader on ISAM Training page
- `85f5b33` fix(isam): replace undefined icon in ISAMHeader
- `3cef2d3` feat(isam): add protected ISAM Training page and modular components
- `5615806` chore: add ISAM Training menu item in app header

## 2026-02-03
- `1dbbd7b` CI: deploy hosting to 'studio' channel (hosted.app)
- `00b5e32` Fix Firebase tools install in CI
- `6af66d5` Fix hosting rewrite and Cloud Build tag
- `87dfe50` fix(ci): correct substitutions and align next config
- `c6a9fca` chore(ci): pass Firebase envs to build

