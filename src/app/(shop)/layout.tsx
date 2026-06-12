// src/app/(shop)/layout.tsx
import AppShell from '@/components/AppShell';
import AgentDock from '@/components/AgentDock';
import AgentPanel from '@/components/AgentPanel';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <div className="lg:pr-[400px]">{children}</div>
      <AgentDock><AgentPanel /></AgentDock>
    </AppShell>
  );
}
