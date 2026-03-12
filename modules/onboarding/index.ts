export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export function getOnboardingSteps(): OnboardingStep[] {
  return [
    { id: 1, title: "Configure your workspace", description: "Set your platform, niche, and goals", completed: false },
    { id: 2, title: "Connect a social profile", description: "Link your Instagram, TikTok, Twitter, or LinkedIn", completed: false },
    { id: 3, title: "Run your first audit", description: "Get insights about your social presence", completed: false },
    { id: 4, title: "Plan your content", description: "Create your first editorial calendar", completed: false },
  ];
}
