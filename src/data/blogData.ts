export interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "founder-overload-map",
    title: "THE FOUNDER OVERLOAD MAP",
    date: "18-Feb-2026",
    category: "Operations",
    excerpt: "If your company stops moving when you step away, you did not build a business. You built a dependency engine. Learn how to diagnose and fix the structural gaps causing founder overload.",
    content: `
Many leaders assume exhaustion is the price of ambition. It is not. Sustainable companies do not demand constant founder energy. They demand sound operating design.

Burnout is usually diagnosed as a personal issue. In practice, it is structural. When execution depends on one person, growth multiplies pressure instead of results.

Here is the pattern visible across scaling firms.

### SYMPTOMS

When founders become the system, certain signals appear:

*   Decisions require their validation
*   Teams escalate small issues upward
*   Calendars fill with alignment meetings
*   Work slows during their absence

These symptoms often get misread as growth complexity. They are actually architecture gaps.

### MECHANISM

Every organization runs on decision pathways. If those pathways are undefined, they default upward. That upward pull concentrates responsibility at the top.

The founder becomes the routing layer for problems, approvals, and coordination.

As scale increases, this routing load compounds. The company grows. The structure does not. Pressure accumulates at the point of least design.

### MISDIAGNOSIS

Most leaders respond by working harder or hiring assistants. Both approaches treat symptoms. Neither fixes the mechanism.

Effort cannot compensate for missing structure.

### REAL CAUSE

The real issue is dependency design. When authority, ownership, and process are unclear, teams cannot act independently. They seek direction. That direction source becomes the founder.

Dependency is not a personality outcome. It is an architectural outcome.

### SOLUTION

Shift from personal control to structural control.

Build:

*   Decision ownership maps
*   Escalation rules
*   Process triggers
*   Autonomy boundaries

These elements distribute execution across the system instead of concentrating it.

### PRINCIPLE

Capacity scales through systems, not stamina.

### PUNCHLINE

If your company stops moving when you step away, you did not build a business. You built a dependency engine.
    `
  }
];
