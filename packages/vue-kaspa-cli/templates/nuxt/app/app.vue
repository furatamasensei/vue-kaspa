<template>
  <NuxtPage />
</template>

<style>
*, *::before, *::after { box-sizing: border-box; }

:root {
  --ks-surface:  #ffffff;
  --ks-soft:     #f4f4f5;
  --ks-border:   #e4e4e7;
  --ks-heading:  #18181b;
  --ks-text:     #3f3f46;
  --ks-muted:    #a1a1aa;
  --ks-accent:   #49c5a3;
  --ks-shine:    rgba(73, 197, 163, .55);
}

@media (prefers-color-scheme: dark) {
  :root {
    --ks-surface: #09090b;
    --ks-soft:    #18181b;
    --ks-border:  #27272a;
    --ks-heading: #fafafa;
    --ks-text:    #a1a1aa;
    --ks-muted:   #52525b;
    --ks-shine:   rgba(73, 197, 163, .40);
  }
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(ellipse 60% 55% at  8% 100%, rgba(73, 197, 163, .32) 0%, transparent 55%),
    radial-gradient(ellipse 60% 55% at 92% 100%, rgba(73, 197, 163, .32) 0%, transparent 55%),
    radial-gradient(ellipse 80% 28% at 50% 100%, rgba(73, 197, 163, .18) 0%, transparent 60%),
    var(--ks-surface);
  background-attachment: fixed;
  color: var(--ks-text);
  font-family: Inter, system-ui, -apple-system, sans-serif;
}
</style>
