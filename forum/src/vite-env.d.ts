/// <reference types="vite/client" />

interface Window {
  __forumStartup?: { ready(): void; fail(): void };
}
