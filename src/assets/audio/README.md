# Audio assets

`windows-xp-startup.wav` is the real Windows XP startup chime ("The
Microsoft Sound"), trimmed to ~4.95s from a source clip that had the
startup and shutdown sounds back to back — the shutdown half was cut
(there was a clean ~1.2s silent gap between the two to cut on), leaving
just the startup sound with its natural decay tail, no extra silence
before or after.

Used by `src/hooks/useStartupSound.ts`, which plays it exactly once, the
first time the initial boot finishes and the desktop appears — see the
"Startup sound" section in the top-level README for the full behavior.
