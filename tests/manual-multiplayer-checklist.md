# Multiplayer test checklist (pending real Firebase deployment)

1. Two distinct anonymous users create/join same room and see both names.
2. Only host can start a round.
3. Both users see the same letter and deadline.
4. A user's private answers cannot be read by the other client before reveal.
5. Submit exactly once; reject second submission and submissions after deadline.
6. Host opens review only after round deadline.
7. A player cannot challenge or vote on their own answer.
8. Each player can vote only once per challenged answer.
9. Votes cannot be read directly by clients.
10. After review closes, scoring applies 10 unique / 5 duplicate / 0 invalid and accepts tied votes.
11. Double finalization does not add points twice.
12. Results show on both devices, then host starts another round.
13. Test weak connection, reload, host leaving, and invalid room codes.

**Status:** These are planned manual tests, not executed or passed tests.
