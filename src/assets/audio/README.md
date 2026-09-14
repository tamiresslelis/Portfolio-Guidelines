# Audio assets

`windows-xp-startup.wav` is a **placeholder** — a short synthesized
three-note chime, not a reproduction of the real Windows XP startup
sound ("The Microsoft Sound"). No audio file was attached to this
conversation, and that sound is Microsoft's copyrighted property, so
one wasn't sourced from the internet on your behalf.

**To use the real sound:** drop your own audio file in here (e.g.
`windows-xp-startup.mp3`) and update the import in
`src/hooks/useStartupSound.ts` to point at it. Nothing else needs to
change — the hook just plays whatever `HTMLAudioElement` src it's given,
once, at the moment the initial boot finishes.
