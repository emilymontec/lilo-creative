import type { DesignTree } from "@lilo/design-schema";

export class LiloClient {
  constructor(private baseUrl: string, private token?: string) {}

  private headers() {
    return {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  async generate(prompt: string): Promise<DesignTree> {
    const res = await fetch(`${this.baseUrl}/generation`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ prompt }),
    });
    return res.json();
  }

  async saveDesign(id: string, tree: DesignTree) {
    const res = await fetch(`${this.baseUrl}/designs/${id}`, {
      method: "PUT",
      headers: this.headers(),
      body: JSON.stringify({ tree }),
    });
    return res.json();
  }

  async exportToCode(id: string) {
    const res = await fetch(`${this.baseUrl}/export/${id}/code`, {
      headers: this.headers(),
    });
    return res.json();
  }
}
